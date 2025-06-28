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

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params
        console.log('🎮 Control API - Starting request:', {
            sessionId,
            method: 'POST',
            timestamp: new Date().toISOString()
        })

        // Parse and validate request
        const body = await req.json()
        console.log('📋 Control request body:', {
            action: body.action,
            userId: body.userId
        })

        const { action, userId } = ControlRequestSchema.parse(body)
        console.log('✅ Control request validation passed:', { action, userId })

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
        console.log('🔍 Querying session for control...', { sessionId })
        const session = await prisma.swarmChatSession.findUnique({
            where: { id: sessionId }
        })

        console.log('📊 Control session query result:', {
            sessionFound: !!session,
            sessionCreatedBy: session?.createdById,
            swarmUserId: swarmUser.id,
            originalUserId: userId
        })

        if (!session) {
            console.error('❌ Control: Session not found:', { sessionId })
            return NextResponse.json(
                { error: 'Session not found' },
                { status: 404 }
            )
        }

        console.log('🔐 Control: Checking authorization:', {
            sessionCreatedBy: session.createdById,
            swarmUserId: swarmUser.id,
            originalUserId: userId,
            match: session.createdById === swarmUser.id
        })

        if (session.createdById !== swarmUser.id) {
            console.error('❌ Control: Authorization failed:', {
                sessionCreatedBy: session.createdById,
                swarmUserId: swarmUser.id,
                originalUserId: userId,
                sessionId
            })
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        console.log('✅ Control: Authorization passed')

        // Execute control action
        let success = false
        let message = ''

        console.log(`🎯 Executing control action: ${action}`)
        switch (action) {
            case 'cancel':
                success = interruptGraph(sessionId)
                message = success ? 'Flow cancelled successfully' : 'No active flow to cancel'
                console.log('🛑 Cancel result:', { success, message })
                break

            case 'resume':
                success = resumeGraph(sessionId)
                message = success ? 'Flow resumed successfully' : 'No interrupted flow to resume'
                console.log('▶️ Resume result:', { success, message })
                break
        }

        const responseData = {
            success,
            action,
            message
        }

        console.log('🎉 Control API completed:', responseData)
        return NextResponse.json(responseData)

    } catch (error) {
        console.error('❌ Control API error:', {
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        })

        if (error instanceof z.ZodError) {
            console.error('❌ Control validation error:', error.errors)
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