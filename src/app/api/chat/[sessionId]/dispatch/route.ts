/**
 * Dispatch API - Handles user messages and orchestrates AI agents
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addMessageToSession } from '@/lib/database/sessions-prisma'
import { OrchestratorGraphBuilder, createInitialState } from '@/lib/orchestrator/graphBuilder'
import { 
  saveOrchestratorResult, 
  getLatestTurnIndex, 
  storeActiveGraph,
  getActiveGraph 
} from '@/lib/orchestrator/hooks'
import { prisma } from '@/lib/database/prisma'
import type { OrchestratorState } from '@/lib/orchestrator/types'

// Request validation schema
const DispatchRequestSchema = z.object({
  message: z.string().min(1),
  userId: z.string(),
  confirmedIntent: z.string().optional()
})

interface DispatchParams {
  params: {
    sessionId: string
  }
}

export async function POST(req: NextRequest, { params }: DispatchParams) {
  try {
    const { sessionId } = params
    console.log('🚀 Dispatch API - Processing request for session:', sessionId)

    // Parse and validate request
    const body = await req.json()
    const { message, userId, confirmedIntent } = DispatchRequestSchema.parse(body)

    // Verify session exists and user has access
    const session = await prisma.swarmChatSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: {
            agent: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.createdById !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Save user message to database
    await addMessageToSession({
      sessionId,
      senderType: 'user',
      senderId: userId,
      content: message,
      contentType: 'text'
    })

    // Get participating agents
    const agentIds = session.participants
      .filter(p => p.agentId)
      .map(p => p.agentId!)

    if (agentIds.length === 0) {
      return NextResponse.json(
        { error: 'No agents in session' },
        { status: 400 }
      )
    }

    // Check if there's already an active graph for this session
    let graph = getActiveGraph(sessionId)
    let state: OrchestratorState

    if (graph && confirmedIntent) {
      // Continue existing conversation with confirmed intent
      const turnIndex = await getLatestTurnIndex(sessionId)
      state = createInitialState(sessionId, message, turnIndex)
      state.confirmedIntent = confirmedIntent
      state.shouldClarify = false
    } else {
      // Create new graph
      const builder = new OrchestratorGraphBuilder({
        sessionId,
        participants: agentIds
      })
      
      graph = builder.build()
      storeActiveGraph(sessionId, graph)

      // Create initial state
      const turnIndex = await getLatestTurnIndex(sessionId) + 1
      state = createInitialState(sessionId, message, turnIndex)
    }

    // Execute graph
    console.log('🔄 Running orchestrator graph...')
    const finalState = await graph.invoke(state)

    // Save results
    if (finalState.summary || finalState.shouldClarify) {
      await saveOrchestratorResult(finalState)
    }

    // Save AI messages to database
    if (finalState.shouldClarify) {
      // Save clarification question
      await addMessageToSession({
        sessionId,
        senderType: 'system',
        senderId: 'moderator',
        content: finalState.clarificationQuestion!,
        contentType: 'text'
      })
    } else if (finalState.summary) {
      // Save final summary
      await addMessageToSession({
        sessionId,
        senderType: 'agent',
        senderId: 'moderator',
        content: finalState.summary,
        contentType: 'text'
      })
    }

    // Return response
    return NextResponse.json({
      success: true,
      turnIndex: finalState.turnIndex,
      shouldClarify: finalState.shouldClarify,
      clarificationQuestion: finalState.clarificationQuestion,
      summary: finalState.summary,
      events: finalState.events,
      tasks: finalState.tasks,
      results: finalState.results.map((r: any) => ({
        taskId: r.taskId,
        agentId: r.agentId,
        content: r.content.substring(0, 500) + '...'
      })),
      costUSD: finalState.costUSD
    })

  } catch (error) {
    console.error('❌ Dispatch API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}