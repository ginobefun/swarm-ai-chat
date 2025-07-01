/**
 * Dispatch Service - Handles message processing and orchestration
 * 
 * Implements:
 * - Soft transaction pattern (eventual consistency)
 * - Concurrent-safe operations without locks
 * - Service layer separation
 * - Graceful error handling
 */

import { z } from 'zod'
import { graphManager } from '@/lib/orchestrator/GraphManager'
import { addMessageToSession } from '@/lib/database/sessions-prisma'
import { saveOrchestratorResult } from '@/lib/orchestrator/hooks'
import { createInitialState } from '@/lib/orchestrator/graphBuilder'
import { prisma } from '@/lib/database/prisma'
import type { OrchestratorState } from '@/lib/orchestrator/types'

// Request/Response types
export const DispatchRequestSchema = z.object({
    message: z.string().min(1).max(10000), // Add reasonable limits
    userId: z.string(),
    confirmedIntent: z.string().optional()
})

export type DispatchRequest = z.infer<typeof DispatchRequestSchema>

export interface DispatchResponse {
    success: boolean
    turnIndex: number
    shouldClarify?: boolean
    clarificationQuestion?: string
    summary?: string
    events: unknown[]
    tasks: unknown[]
    results: unknown[]
    costUSD: number
    message?: string
    error?: string
}

/**
 * Authentication and Authorization Service
 */
export class AuthService {
    /**
     * Validate user and get SwarmUser record
     */
    async validateUser(userId: string) {
        console.log('🔍 Validating user:', { userId })

        const swarmUser = await prisma.swarmUser.findUnique({
            where: { userId }
        })

        if (!swarmUser) {
            throw new Error(`SwarmUser not found for userId: ${userId}`)
        }

        console.log('✅ User validation successful:', {
            swarmUserId: swarmUser.id,
            originalUserId: userId
        })

        return swarmUser
    }

    /**
     * Validate session access
     */
    async validateSessionAccess(sessionId: string, swarmUserId: string) {
        console.log('🔍 Validating session access:', { sessionId, swarmUserId })

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
            throw new Error(`Session not found: ${sessionId}`)
        }

        if (session.createdById !== swarmUserId) {
            throw new Error(`Unauthorized access to session: ${sessionId}`)
        }

        console.log('✅ Session access validated:', {
            sessionId: session.id,
            title: session.title,
            participants: session.participants.length
        })

        return session
    }
}

/**
 * Message Processing Service
 */
export class MessageService {
    /**
     * Save user message with soft transaction approach
     */
    async saveUserMessage(sessionId: string, userId: string, message: string): Promise<void> {
        try {
            await addMessageToSession({
                sessionId,
                senderType: 'user',
                senderId: userId,
                content: message,
                contentType: 'text'
            })
            console.log('✅ User message saved successfully')
        } catch (error) {
            console.error('❌ Failed to save user message:', error)
            // In soft transaction pattern, we log but don't throw
            // The user experience continues, and we can retry later
        }
    }

    /**
     * Save AI response with error tolerance
     */
    async saveAIResponse(sessionId: string, content: string, senderType: 'agent' | 'system', senderId: string): Promise<void> {
        try {
            await addMessageToSession({
                sessionId,
                senderType,
                senderId,
                content,
                contentType: 'text'
            })
            console.log('✅ AI response saved successfully:', { senderType, senderId })
        } catch (error) {
            console.error('❌ Failed to save AI response:', error)
            // Log for retry mechanism, but don't break user experience
        }
    }
}

/**
 * Collaboration Orchestration Service
 */
export class CollaborationService {
    /**
     * Execute collaboration with participants
     */
    async executeCollaboration(
        sessionId: string,
        message: string,
        participants: string[],
        confirmedIntent?: string
    ): Promise<OrchestratorState> {
        console.log('🎬 Starting collaboration execution:', {
            sessionId,
            messageLength: message.length,
            participants: participants.length,
            hasConfirmedIntent: !!confirmedIntent
        })

        // Get or create graph instance (concurrent-safe)
        const graph = await graphManager.getOrCreateGraph(sessionId, participants)

        // Create execution state
        const turnIndex = await this.getNextTurnIndex(sessionId)
        const state = createInitialState(sessionId, message, turnIndex)

        if (confirmedIntent) {
            state.confirmedIntent = confirmedIntent
            state.shouldClarify = false
        }

        console.log('📊 Execution state prepared:', {
            turnIndex,
            hasConfirmedIntent: !!state.confirmedIntent,
            shouldClarify: state.shouldClarify
        })

        // Execute collaboration
        const startTime = Date.now()
        try {
            const graphResult = await graph.invoke(state)
            const executionTime = Date.now() - startTime

            // Convert graph result to OrchestratorState
            const finalState: OrchestratorState = {
                sessionId: graphResult.sessionId || state.sessionId,
                turnIndex: graphResult.turnIndex || state.turnIndex,
                userMessage: graphResult.userMessage || state.userMessage,
                confirmedIntent: graphResult.confirmedIntent,
                tasks: graphResult.tasks || [],
                inFlight: graphResult.inFlight || {},
                results: graphResult.results || [],
                summary: graphResult.summary,
                events: graphResult.events || [],
                costUSD: graphResult.costUSD || 0,
                shouldClarify: graphResult.shouldClarify,
                clarificationQuestion: graphResult.clarificationQuestion,
                isCancelled: graphResult.isCancelled,
                shouldProceedToSummary: graphResult.shouldProceedToSummary
            }

            console.log('🏁 Collaboration execution completed:', {
                executionTimeMs: executionTime,
                turnIndex: finalState.turnIndex,
                shouldClarify: finalState.shouldClarify,
                hasSummary: !!finalState.summary,
                tasksCount: finalState.tasks?.length || 0,
                resultsCount: finalState.results?.length || 0,
                costUSD: finalState.costUSD
            })

            return finalState
        } catch (error) {
            const executionTime = Date.now() - startTime
            console.error('❌ Collaboration execution failed:', {
                executionTimeMs: executionTime,
                error: error instanceof Error ? error.message : error
            })

            // Return a graceful error state instead of throwing
            return {
                ...state,
                summary: '协作执行遇到问题，请稍后重试。',
                shouldClarify: false,
                costUSD: 0,
                events: [...state.events, {
                    id: 'error-' + Date.now(),
                    type: 'system',
                    timestamp: new Date(),
                    content: 'Collaboration execution failed'
                }]
            }
        }
    }

    /**
     * Get next turn index with safe fallback
     */
    private async getNextTurnIndex(sessionId: string): Promise<number> {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const latest = await (prisma as any).swarmChatResult.findFirst({
                where: { sessionId },
                orderBy: { turnIndex: 'desc' },
                select: { turnIndex: true }
            })
            return (latest?.turnIndex || 0) + 1
        } catch (error) {
            console.warn('⚠️ Failed to get latest turn index, using fallback:', error)
            return 1 // Safe fallback
        }
    }
}

/**
 * Result Processing Service
 */
export class ResultService {
    /**
     * Process and save orchestration results with error tolerance
     */
    async processResults(finalState: OrchestratorState, messageService: MessageService): Promise<void> {
        console.log('💾 Processing orchestration results:', {
            sessionId: finalState.sessionId,
            shouldClarify: finalState.shouldClarify,
            hasSummary: !!finalState.summary
        })

        // Save orchestrator state (async, non-blocking)
        this.saveOrchestratorState(finalState)

        // Save AI messages based on result type
        if (finalState.shouldClarify && finalState.clarificationQuestion) {
            await messageService.saveAIResponse(
                finalState.sessionId,
                finalState.clarificationQuestion,
                'system',
                'moderator'
            )
        } else if (finalState.summary) {
            await messageService.saveAIResponse(
                finalState.sessionId,
                finalState.summary,
                'agent',
                'moderator'
            )
        }

        console.log('✅ Result processing completed')
    }

    /**
     * Save orchestrator state asynchronously (fire-and-forget)
     */
    private saveOrchestratorState(state: OrchestratorState): void {
        // Use async fire-and-forget pattern for non-critical saves
        saveOrchestratorResult(state).catch(error => {
            console.error('❌ Failed to save orchestrator state (non-blocking):', error)
            // Could implement retry queue here in the future
        })
    }
}

/**
 * Main Dispatch Service - Orchestrates all operations
 */
export class DispatchService {
    private authService = new AuthService()
    private messageService = new MessageService()
    private collaborationService = new CollaborationService()
    private resultService = new ResultService()

    /**
     * Process dispatch request with soft transaction pattern
     */
    async processMessage(request: DispatchRequest, sessionId: string): Promise<DispatchResponse> {
        const { message, userId, confirmedIntent } = request

        console.log('🎯 Processing dispatch request:', {
            sessionId,
            messageLength: message.length,
            userId,
            hasConfirmedIntent: !!confirmedIntent
        })

        try {
            // Step 1: Authentication and Authorization
            const swarmUser = await this.authService.validateUser(userId)
            const session = await this.authService.validateSessionAccess(sessionId, swarmUser.id)

            // Step 2: Get participants
            const agentIds = session.participants
                .filter(p => p.agentId)
                .map(p => p.agentId!)

            if (agentIds.length === 0) {
                throw new Error('No agents in session')
            }

            console.log('🤖 Session participants:', { agentIds })

            // Step 3: Save user message (soft transaction - continue on failure)
            await this.messageService.saveUserMessage(sessionId, userId, message)

            // Step 4: Execute collaboration
            const finalState = await this.collaborationService.executeCollaboration(
                sessionId,
                message,
                agentIds,
                confirmedIntent
            )

            // Step 5: Process results (async, non-blocking)
            await this.resultService.processResults(finalState, this.messageService)

            // Step 6: Return response
            const response: DispatchResponse = {
                success: true,
                turnIndex: finalState.turnIndex,
                shouldClarify: finalState.shouldClarify,
                clarificationQuestion: finalState.clarificationQuestion,
                summary: finalState.summary,
                events: finalState.events,
                tasks: finalState.tasks,
                results: finalState.results.map((r: { taskId: string; agentId: string; content: string }) => ({
                    taskId: r.taskId,
                    agentId: r.agentId,
                    content: r.content.substring(0, 500) + (r.content.length > 500 ? '...' : '')
                })),
                costUSD: finalState.costUSD
            }

            console.log('🎉 Dispatch processing completed successfully:', {
                sessionId,
                turnIndex: response.turnIndex,
                shouldClarify: response.shouldClarify,
                hasSummary: !!response.summary
            })

            return response

        } catch (error) {
            console.error('❌ Dispatch processing failed:', {
                sessionId,
                error: error instanceof Error ? error.message : error
            })

            // Return graceful error response
            return {
                success: false,
                turnIndex: 0,
                events: [],
                tasks: [],
                results: [],
                costUSD: 0,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                message: '处理请求时遇到问题，请稍后重试。'
            }
        }
    }
} 