/**
 * Control API - Handles flow control (cancel/resume)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { interruptGraph, resumeGraph } from '@/lib/orchestrator/hooks'
import { prisma } from '@/lib/database/prisma'

// Request validation schema
const ControlRequestSchema = z.object({
  action: z.enum(['cancel', 'resume']),
  userId: z.string()
})

interface ControlParams {
  params: {
    sessionId: string
  }
}

export async function POST(req: NextRequest, { params }: ControlParams) {
  try {
    const { sessionId } = params
    console.log('🎮 Control API - Processing request for session:', sessionId)

    // Parse and validate request
    const body = await req.json()
    const { action, userId } = ControlRequestSchema.parse(body)

    // Verify session exists and user has access
    const session = await prisma.swarmChatSession.findUnique({
      where: { id: sessionId }
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

    // Execute control action
    let success = false
    let message = ''

    switch (action) {
      case 'cancel':
        success = interruptGraph(sessionId)
        message = success ? 'Flow cancelled successfully' : 'No active flow to cancel'
        break
      
      case 'resume':
        success = resumeGraph(sessionId)
        message = success ? 'Flow resumed successfully' : 'No interrupted flow to resume'
        break
    }

    return NextResponse.json({
      success,
      action,
      message
    })

  } catch (error) {
    console.error('❌ Control API error:', error)

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