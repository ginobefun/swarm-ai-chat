/**
 * Dispatch API Route - Refactored with Service Layer Architecture
 * 
 * Features:
 * - Thin route layer (HTTP handling only)
 * - Service layer separation
 * - Soft transaction pattern (eventual consistency)
 * - Concurrent-safe operations without locks
 * - Graceful error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { DispatchService, DispatchRequestSchema } from '@/lib/services/DispatchService'
import { graphManager } from '@/lib/orchestrator/GraphManager'

/**
 * Handle POST requests for message dispatching
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const startTime = Date.now()
    const { sessionId } = await params

    console.log('🎯 Dispatch API Request:', {
        sessionId,
        method: 'POST',
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent')?.substring(0, 100)
    })

    try {
        // Parse request body
        const body = await req.json()
        console.log('📋 Request received:', {
            sessionId,
            messageLength: body.message?.length || 0,
            userId: body.userId,
            hasConfirmedIntent: !!body.confirmedIntent
        })

        // Validate request with enhanced schema
        const validatedRequest = DispatchRequestSchema.parse(body)
        console.log('✅ Request validation passed')

        // Process request through service layer
        const dispatchService = new DispatchService()
        const response = await dispatchService.processMessage(validatedRequest, sessionId)

        const totalTime = Date.now() - startTime
        console.log('🎉 Dispatch API completed:', {
            sessionId,
            success: response.success,
            turnIndex: response.turnIndex,
            shouldClarify: response.shouldClarify,
            hasSummary: !!response.summary,
            totalTimeMs: totalTime,
            graphStats: graphManager.getStats()
        })

        // Return successful response
        return NextResponse.json(response, {
            status: response.success ? 200 : 500,
            headers: {
                'X-Request-ID': crypto.randomUUID(),
                'X-Processing-Time': totalTime.toString(),
                'X-Turn-Index': response.turnIndex.toString()
            }
        })

    } catch (error) {
        const totalTime = Date.now() - startTime
        const isValidationError = error?.constructor?.name === 'ZodError'

        console.error('❌ Dispatch API error:', {
            sessionId,
            error: error instanceof Error ? error.message : error,
            errorType: error?.constructor?.name || 'Unknown',
            stack: error instanceof Error ? error.stack : undefined,
            totalTimeMs: totalTime,
            isValidationError
        })

        // Handle validation errors
        if (isValidationError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: (error as { errors?: unknown[] }).errors,
                    message: '请求数据格式不正确，请检查后重试。'
                },
                {
                    status: 400,
                    headers: {
                        'X-Error-Type': 'ValidationError',
                        'X-Processing-Time': totalTime.toString()
                    }
                }
            )
        }

        // Handle general errors with graceful response
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error',
                message: '服务暂时不可用，请稍后重试。',
                retryAfter: 5000 // Suggest retry after 5 seconds
            },
            {
                status: 500,
                headers: {
                    'X-Error-Type': 'InternalError',
                    'X-Processing-Time': totalTime.toString(),
                    'Retry-After': '5'
                }
            }
        )
    }
}

/**
 * Handle GET requests for session status/health check
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params

    console.log('📊 Session status check:', { sessionId })

    try {
        // Return session and graph statistics
        const stats = {
            sessionId,
            timestamp: new Date().toISOString(),
            graphManager: graphManager.getStats(),
            healthy: true
        }

        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Health-Check': 'true'
            }
        })

    } catch (error) {
        console.error('❌ Health check failed:', {
            sessionId,
            error: error instanceof Error ? error.message : error
        })

        return NextResponse.json(
            {
                sessionId,
                healthy: false,
                error: 'Health check failed'
            },
            { status: 503 }
        )
    }
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    })
}