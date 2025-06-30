import { NextRequest } from 'next/server'
import { streamText, createDataStreamResponse } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

import prisma from '@/lib/database/prisma'
import { getLatestTurnIndex, storeActiveGraph, getActiveGraph } from '@/lib/orchestrator/hooks'
import { OrchestratorGraphBuilder } from '@/lib/orchestrator/graphBuilder'
import { createInitialState } from '@/lib/orchestrator/graphBuilder'
import { addMessageToSession } from '@/lib/database/sessions-prisma'
import { saveOrchestratorResult } from '@/lib/orchestrator/hooks'
import { auth } from '@/lib/auth'

// Import our new types
import {
    ChatMessage,
    ChatRequestData,
    OrchestratorResponse,
    SessionAnalysis
} from '@/types/chat'
import { AgentConfigService } from '@/lib/services/AgentConfigService'

export async function POST(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: req.headers
        })

        if (!session?.user?.id) {
            return new Response('Unauthorized', { status: 401 })
        }

        const { messages, data } = await req.json()
        const requestData = data as ChatRequestData

        if (!messages?.length || !requestData?.sessionId) {
            return new Response('Invalid request: missing messages or sessionId', { status: 400 })
        }

        const userId = session.user.id
        const sessionId = requestData.sessionId
        const messageContent = messages[messages.length - 1]?.content

        if (!messageContent) {
            return new Response('Invalid request: empty message', { status: 400 })
        }

        console.log('📥 Unified chat request:', {
            sessionId,
            messageLength: messageContent.length,
            requestMode: requestData.mode,
            confirmedIntent: requestData.confirmedIntent,
            userId
        })

        // Analyze session to determine mode
        const sessionAnalysis = await analyzeSession(sessionId, userId)

        // Determine final mode
        const finalMode = requestData.mode === 'auto' || !requestData.mode
            ? (sessionAnalysis.isMultiAgent ? 'multi' : 'single')
            : requestData.mode

        console.log('🎯 Mode decision:', {
            requestMode: requestData.mode,
            analysisResult: sessionAnalysis.isMultiAgent ? 'multi' : 'single',
            finalMode,
            agentCount: sessionAnalysis.agentIds.length
        })

        if (finalMode === 'multi') {
            return handleMultiAgentChat({
                messages,
                sessionId,
                messageContent,
                userId,
                requestData,
                sessionAnalysis
            })
        } else {
            return handleSingleAgentChat({
                messages,
                sessionId,
                messageContent,
                userId,
                agentId: sessionAnalysis.primaryAgentId
            })
        }

    } catch (error) {
        console.error('❌ Chat API error:', error)
        return new Response(`Server error: ${(error as Error).message}`, { status: 500 })
    }
}

/**
 * Handle multi-agent collaboration with StreamData
 */
async function handleMultiAgentChat({
    sessionId,
    messageContent,
    userId,
    requestData,
    sessionAnalysis
}: {
    messages: ChatMessage[]
    sessionId: string
    messageContent: string
    userId: string
    requestData: ChatRequestData
    sessionAnalysis: SessionAnalysis
}) {
    console.log('🤖 Starting multi-agent orchestration...')

    const agentIds = sessionAnalysis.agentIds
    const confirmedIntent = requestData.confirmedIntent

    // Save user message to database
    await addMessageToSession({
        sessionId,
        senderType: 'user',
        senderId: userId,
        content: messageContent,
        contentType: 'text'
    })

    let graph = getActiveGraph(sessionId)
    let state

    if (graph && confirmedIntent) {
        console.log('🔄 Continuing existing graph with confirmed intent')
        const turnIndex = await getLatestTurnIndex(sessionId)
        state = createInitialState(sessionId, messageContent, turnIndex)
        state.confirmedIntent = confirmedIntent
        state.shouldClarify = false
    } else {
        console.log('🆕 Creating new orchestrator graph')
        const builder = new OrchestratorGraphBuilder({
            sessionId,
            participants: agentIds
        })

        graph = await builder.build()
        storeActiveGraph(sessionId, graph)

        const turnIndex = await getLatestTurnIndex(sessionId) + 1
        state = createInitialState(sessionId, messageContent, turnIndex)
    }

    // Execute graph
    console.log('🎬 Running orchestrator graph...')
    const startTime = Date.now()
    const finalState = await graph.invoke(state, {
        recursionLimit: 50
    })
    const executionTime = Date.now() - startTime

    console.log('✅ Graph execution completed:', {
        executionTimeMs: executionTime,
        finalTurnIndex: finalState.turnIndex,
        shouldClarify: finalState.shouldClarify,
        tasksCount: finalState.tasks?.length || 0,
        resultsCount: finalState.results?.length || 0
    })

    // Save orchestrator result
    await saveOrchestratorResult(finalState)

    // Prepare orchestrator response for StreamData
    const orchestratorResponse: OrchestratorResponse = {
        type: 'orchestrator',
        success: true,
        turnIndex: finalState.turnIndex,
        shouldClarify: finalState.shouldClarify,
        clarificationQuestion: finalState.clarificationQuestion,
        summary: finalState.summary,
        events: finalState.events || [],
        tasks: finalState.tasks || [],
        results: finalState.results || [],
        costUSD: finalState.costUSD || 0
    }

    console.log('🎉 Multi-agent orchestration completed, sending via createDataStreamResponse')

    // Use createDataStreamResponse to send orchestrator data
    return createDataStreamResponse({
        execute: async (dataStream) => {
            // Write orchestrator response as data (convert to JSON-compatible format)
            dataStream.writeData(JSON.parse(JSON.stringify(orchestratorResponse)))

            // Send a simple completion message
            const stream = streamText({
                model: createOpenRouter({
                    apiKey: process.env.OPENROUTER_API_KEY!,
                    headers: {
                        'HTTP-Referer': process.env.BETTER_AUTH_URL || 'https://swarmai.chat',
                        'X-Title': 'SwarmAI.chat'
                    }
                }).chat('openai/gpt-4.1'),
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant. Simply acknowledge that the multi-agent collaboration has been completed.'
                    },
                    {
                        role: 'user',
                        content: 'Multi-agent collaboration completed'
                    }
                ]
            })

            // Merge the streamText result into the data stream
            stream.mergeIntoDataStream(dataStream)
        },
        headers: {
            'X-Chat-Mode': 'multi',
            'X-Agent-Count': agentIds.length.toString()
        },
        onError: (error) => {
            console.error('🔴 Multi-agent streaming error:', error)
            return error instanceof Error ? error.message : 'Multi-agent collaboration failed'
        }
    })
}

/**
 * Handle single-agent streaming
 */
async function handleSingleAgentChat({
    messages,
    sessionId,
    messageContent,
    userId,
    agentId
}: {
    messages: ChatMessage[]
    sessionId: string
    messageContent: string
    userId: string
    agentId: string
}) {
    console.log('⚡ Starting single-agent streaming...')

    // Save user message to database
    await addMessageToSession({
        sessionId,
        senderType: 'user',
        senderId: userId,
        content: messageContent,
        contentType: 'text'
    })

    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error('OPENROUTER_API_KEY is not configured')
    }

    const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY,
        headers: {
            'HTTP-Referer': process.env.BETTER_AUTH_URL || 'https://swarmai.chat',
            'X-Title': 'SwarmAI.chat'
        }
    })

    const agentConfigService = AgentConfigService.getInstance()
    const agentConfig = await agentConfigService.getAgentConfiguration(agentId)
    const model = openrouter.chat(agentConfig.modelName)

    const startTime = Date.now()

    // Prepare messages for AI model
    const aiMessages = [
        { role: 'system' as const, content: agentConfig.systemPrompt },
        ...messages.map((msg: ChatMessage) => ({
            role: msg.role,
            content: msg.content
        }))
    ]

    // Stream AI response
    const result = streamText({
        model,
        messages: aiMessages,
        temperature: agentConfig.temperature,
        maxTokens: agentConfig.maxTokens,
        onFinish: async (completion) => {
            try {
                const processingTime = Date.now() - startTime
                const inputTokens = completion.usage?.promptTokens || 0
                const outputTokens = completion.usage?.completionTokens || 0
                const totalTokens = completion.usage?.totalTokens || (inputTokens + outputTokens)

                const cost = calculateCost(
                    inputTokens,
                    outputTokens,
                    agentConfig.inputPricePerK,
                    agentConfig.outputPricePerK
                )

                await addMessageToSession({
                    sessionId,
                    senderType: 'agent',
                    senderId: agentId,
                    content: completion.text,
                    contentType: 'text',
                    tokenCount: totalTokens,
                    processingTime,
                    cost
                })

                console.log(`✅ Single-agent response saved:`, {
                    agentId,
                    inputTokens,
                    outputTokens,
                    totalTokens,
                    processingTime: `${processingTime}ms`,
                    cost: `$${cost.toFixed(6)}`
                })
            } catch (error) {
                console.error('❌ Error saving single-agent response:', error)
            }
        }
    })

    return result.toDataStreamResponse({
        headers: {
            'X-Chat-Mode': 'single',
            'X-Agent-Id': agentId
        }
    })
}

async function analyzeSession(sessionId: string, userId: string): Promise<SessionAnalysis> {
    try {
        // First, find the SwarmUser record
        const swarmUser = await prisma.swarmUser.findUnique({
            where: { userId: userId }
        })

        if (!swarmUser) {
            throw new Error('User not found in swarm system')
        }

        // Get session with participants
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
            throw new Error('Session not found')
        }

        // Check authorization
        if (session.createdById !== swarmUser.id) {
            throw new Error('Unauthorized access to session')
        }

        // Analyze agent participants
        const agentParticipants = session.participants.filter(p => p.agentId)
        const agentIds = agentParticipants.map(p => p.agentId!)

        console.log('📊 Session analysis:', {
            sessionId,
            totalParticipants: session.participants.length,
            agentParticipants: agentParticipants.length,
            agentIds,
            primaryAgent: session.primaryAgentId || agentIds[0]
        })

        return {
            isMultiAgent: agentParticipants.length > 1,
            agentIds,
            primaryAgentId: session.primaryAgentId || agentIds[0],
            session: {
                id: sessionId,
                participants: session.participants.map(p => ({ agentId: p.agentId }))
            },
            swarmUser: {
                id: swarmUser.id,
                userId: swarmUser.userId,
                username: swarmUser.username || ''
            }
        }
    } catch (error) {
        console.error('❌ Session analysis failed:', error)
        throw new Error(`Failed to analyze session '${sessionId}': ${(error as Error).message}`)
    }
}

function calculateCost(
    inputTokens: number,
    outputTokens: number,
    inputPricePerK: number,
    outputPricePerK: number
): number {
    const inputCost = (inputTokens / 1000) * inputPricePerK
    const outputCost = (outputTokens / 1000) * outputPricePerK
    return inputCost + outputCost
}