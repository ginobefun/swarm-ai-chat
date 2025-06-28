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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params
        console.log('🎯 Dispatch API - Starting request:', {
            sessionId,
            method: 'POST',
            timestamp: new Date().toISOString()
        })

        // Parse and validate request
        const body = await req.json()
        console.log('📋 Request body received:', {
            messageLength: body.message?.length || 0,
            userId: body.userId,
            hasConfirmedIntent: !!body.confirmedIntent,
            confirmedIntentLength: body.confirmedIntent?.length || 0
        })

        const { message, userId, confirmedIntent } = DispatchRequestSchema.parse(body)
        console.log('✅ Request validation passed:', {
            messageLength: message.length,
            userId,
            hasConfirmedIntent: !!confirmedIntent
        })

        // First, find the SwarmUser record for the authenticated user
        console.log('🔍 Finding SwarmUser for User.id...', { userId })
        const swarmUser = await prisma.swarmUser.findUnique({
            where: { userId: userId }
        })

        console.log('📊 SwarmUser query result:', {
            swarmUserFound: !!swarmUser,
            swarmUserId: swarmUser?.id,
            originalUserId: userId
        })

        if (!swarmUser) {
            console.error('❌ SwarmUser not found for User.id:', { userId })
            return NextResponse.json(
                { error: 'User not found in swarm system' },
                { status: 404 }
            )
        }

        // Verify session exists and user has access
        console.log('🔍 Querying session from database...', { sessionId })
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

        console.log('📊 Session query result:', {
            sessionFound: !!session,
            sessionId: session?.id,
            sessionTitle: session?.title,
            sessionCreatedBy: session?.createdById,
            participantsCount: session?.participants?.length || 0,
            participants: session?.participants?.map(p => ({
                id: p.id,
                agentId: p.agentId,
                agentName: p.agent?.name
            })) || []
        })

        if (!session) {
            console.error('❌ Session not found:', { sessionId })
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        console.log('🔐 Checking authorization:', {
            sessionCreatedBy: session.createdById,
            swarmUserId: swarmUser.id,
            originalUserId: userId,
            match: session.createdById === swarmUser.id
        })

        if (session.createdById !== swarmUser.id) {
            console.error('❌ Authorization failed:', {
                sessionCreatedBy: session.createdById,
                swarmUserId: swarmUser.id,
                originalUserId: userId,
                sessionId
            })
            return NextResponse.json(
                {
                    error: 'Unauthorized', details: {
                        sessionCreatedBy: session.createdById,
                        swarmUserId: swarmUser.id,
                        originalUserId: userId
                    }
                },
                { status: 403 }
            )
        }

        console.log('✅ Authorization passed')

        // Save user message to database
        console.log('💾 Saving user message to database...')
        await addMessageToSession({
            sessionId,
            senderType: 'user',
            senderId: userId,
            content: message,
            contentType: 'text'
        })
        console.log('✅ User message saved')

        // Get participating agents
        const agentIds = session.participants
            .filter(p => p.agentId)
            .map(p => p.agentId!)

        console.log('🤖 Agent participants:', {
            totalParticipants: session.participants.length,
            agentParticipants: agentIds.length,
            agentIds
        })

        if (agentIds.length === 0) {
            console.error('❌ No agents in session')
            return NextResponse.json(
                { error: 'No agents in session' },
                { status: 400 }
            )
        }

        // Check if there's already an active graph for this session
        let graph = getActiveGraph(sessionId)
        let state: OrchestratorState

        if (graph && confirmedIntent) {
            console.log('🔄 Continuing existing graph with confirmed intent')
            // Continue existing conversation with confirmed intent
            const turnIndex = await getLatestTurnIndex(sessionId)
            state = createInitialState(sessionId, message, turnIndex)
            state.confirmedIntent = confirmedIntent
            state.shouldClarify = false
        } else {
            console.log('🆕 Creating new orchestrator graph')
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
            console.log('📊 Initial state created:', {
                turnIndex,
                messageLength: state.userMessage.length,
                tasksCount: state.tasks.length,
                eventsCount: state.events.length
            })
        }

        // Execute graph
        console.log('🎬 Running orchestrator graph...')
        const startTime = Date.now()
        const finalState = await graph.invoke(state)
        const executionTime = Date.now() - startTime

        console.log('🏁 Graph execution completed:', {
            executionTimeMs: executionTime,
            finalTurnIndex: finalState.turnIndex,
            shouldClarify: finalState.shouldClarify,
            hasSummary: !!finalState.summary,
            tasksCount: finalState.tasks?.length || 0,
            resultsCount: finalState.results?.length || 0,
            eventsCount: finalState.events?.length || 0,
            costUSD: finalState.costUSD
        })

        // Save results
        if (finalState.summary || finalState.shouldClarify) {
            console.log('💾 Saving orchestrator result...')
            await saveOrchestratorResult(finalState)
            console.log('✅ Orchestrator result saved')
        }

        // Save AI messages to database
        if (finalState.shouldClarify) {
            console.log('💬 Saving clarification question...')
            // Save clarification question
            await addMessageToSession({
                sessionId,
                senderType: 'system',
                senderId: 'moderator',
                content: finalState.clarificationQuestion!,
                contentType: 'text'
            })
            console.log('✅ Clarification question saved')
        } else if (finalState.summary) {
            console.log('📝 Saving final summary...')
            // Save final summary
            await addMessageToSession({
                sessionId,
                senderType: 'agent',
                senderId: 'moderator',
                content: finalState.summary,
                contentType: 'text'
            })
            console.log('✅ Final summary saved')
        }

        const responseData = {
            success: true,
            turnIndex: finalState.turnIndex,
            shouldClarify: finalState.shouldClarify,
            clarificationQuestion: finalState.clarificationQuestion,
            summary: finalState.summary,
            events: finalState.events,
            tasks: finalState.tasks,
            results: finalState.results.map((r: { taskId: string, agentId: string, content: string }) => ({
                taskId: r.taskId,
                agentId: r.agentId,
                content: r.content.substring(0, 500) + '...'
            })),
            costUSD: finalState.costUSD
        }

        console.log('🎉 Dispatch API completed successfully:', {
            responseSize: JSON.stringify(responseData).length,
            totalTime: Date.now() - startTime
        })

        // Return response
        return NextResponse.json(responseData)

    } catch (error) {
        console.error('❌ Dispatch API error:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        })

        if (error instanceof z.ZodError) {
            console.error('❌ Validation error details:', error.errors)
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}