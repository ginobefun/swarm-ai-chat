import { NextRequest, NextResponse } from 'next/server'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { addMessageToSession } from '@/lib/database/sessions-prisma'
import { z } from 'zod'
import { prisma } from '@/lib/database/prisma'
import { OrchestratorGraphBuilder, createInitialState } from '@/lib/orchestrator/graphBuilder'
import {
    saveOrchestratorResult,
    getLatestTurnIndex,
    storeActiveGraph,
    getActiveGraph
} from '@/lib/orchestrator/hooks'
import type { OrchestratorState } from '@/lib/orchestrator/types'

// Types
interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    parts?: Array<{
        type: string
        text: string
    }>
}

// Request validation schema
const ChatRequestSchema = z.object({
    sessionId: z.string().uuid(),
    message: z.string().min(1).optional(), // Optional for AI SDK format
    agentId: z.string().optional(),
    userId: z.string(),
    confirmedIntent: z.string().optional() // For multi-agent clarification
})

/**
 * POST /api/chat
 * Unified chat endpoint that automatically handles:
 * - Single-agent mode: Traditional streaming chat
 * - Multi-agent mode: LangGraph orchestration
 * 
 * The server analyzes the session and decides the processing method
 */
export async function POST(req: NextRequest) {
    try {
        console.log('🔍 Unified Chat API - Starting request processing')
        const body = await req.json()
        console.log('🔍 Chat API - Received body:', {
            hasMessages: !!body.messages,
            messagesLength: body.messages?.length,
            sessionId: body.sessionId,
            userId: body.userId,
            agentId: body.agentId,
            hasConfirmedIntent: !!body.confirmedIntent
        })

        // Extract message from Vercel AI SDK format (messages array) or direct format
        const messageContent = body.messages?.slice(-1)[0]?.content || body.message
        console.log('🔍 Chat API - Extracted message content:', messageContent?.substring(0, 100) + '...')

        // Validate request data
        const { sessionId, agentId = 'gemini-flash', userId, confirmedIntent } = ChatRequestSchema.parse({
            ...body,
            message: messageContent
        })
        console.log('🔍 Chat API - Validation passed:', { sessionId, agentId, userId, hasConfirmedIntent: !!confirmedIntent })

        // Validate message content
        if (!messageContent || typeof messageContent !== 'string') {
            throw new Error('Message content is required')
        }

        // 🎯 KEY CHANGE: Analyze session to determine processing mode
        console.log('🔍 Analyzing session configuration...')
        const sessionAnalysis = await analyzeSession(sessionId, userId)
        console.log('📊 Session analysis result:', sessionAnalysis)

        if (sessionAnalysis.isMultiAgent) {
            // Multi-agent mode: Use LangGraph orchestration
            console.log('🤖 Using multi-agent orchestration mode')
            return await handleMultiAgentChat(sessionId, messageContent, userId, confirmedIntent, sessionAnalysis)
        } else {
            // Single-agent mode: Use traditional streaming
            console.log('⚡ Using single-agent streaming mode')
            return await handleSingleAgentChat(body, sessionId, messageContent, userId, agentId)
        }

    } catch (error) {
        console.error('❌ Unified Chat API Error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request data',
                    details: error.errors
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        )
    }
}

/**
 * Analyze session to determine processing mode
 */
async function analyzeSession(sessionId: string, userId: string) {
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
            primaryAgent: session.primaryAgentId
        })

        return {
            isMultiAgent: agentParticipants.length > 1,
            agentIds,
            primaryAgentId: session.primaryAgentId || agentIds[0] || 'gemini-flash',
            session,
            swarmUser
        }
    } catch (error) {
        console.error('❌ Session analysis failed:', error)
        throw error
    }
}

/**
 * Handle multi-agent orchestration mode
 */
async function handleMultiAgentChat(
    sessionId: string,
    message: string,
    userId: string,
    confirmedIntent?: string,
    sessionAnalysis?: {
        isMultiAgent: boolean
        agentIds: string[]
        primaryAgentId: string
        session: {
            id: string
            participants: Array<{ agentId?: string | null }>
        }
        swarmUser: {
            id: string
            userId: string
        }
    }
) {
    try {
        console.log('🎬 Starting multi-agent orchestration...')

        // Save user message to database
        console.log('💾 Saving user message to database...')
        await addMessageToSession({
            sessionId,
            senderType: 'user',
            senderId: userId,
            content: message,
            contentType: 'text'
        })

        const agentIds = sessionAnalysis?.agentIds || []

        // Check if there's already an active graph for this session
        let graph = getActiveGraph(sessionId)
        let state: OrchestratorState

        if (graph && confirmedIntent) {
            console.log('🔄 Continuing existing graph with confirmed intent')
            const turnIndex = await getLatestTurnIndex(sessionId)
            state = createInitialState(sessionId, message, turnIndex)
            state.confirmedIntent = confirmedIntent
            state.shouldClarify = false
        } else {
            console.log('🆕 Creating new orchestrator graph')
            const builder = new OrchestratorGraphBuilder({
                sessionId,
                participants: agentIds
            })

            graph = builder.build()
            storeActiveGraph(sessionId, graph)

            const turnIndex = await getLatestTurnIndex(sessionId) + 1
            state = createInitialState(sessionId, message, turnIndex)
        }

        // Execute graph
        console.log('🎬 Running orchestrator graph...')
        const startTime = Date.now()
        const finalState = await graph.invoke(state)
        const executionTime = Date.now() - startTime

        console.log('✅ Graph execution completed:', {
            executionTimeMs: executionTime,
            finalTurnIndex: finalState.turnIndex,
            shouldClarify: finalState.shouldClarify,
            hasSummary: !!finalState.summary,
            tasksCount: finalState.tasks?.length || 0,
            resultsCount: finalState.results?.length || 0,
            eventsCount: finalState.events?.length || 0,
            costUSD: finalState.costUSD
        })

        // Save orchestrator result
        console.log('💾 Saving orchestrator result...')
        await saveOrchestratorResult(finalState)

        // Return orchestrator response as streaming-compatible text
        const response = {
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

        console.log('🎉 Multi-agent orchestration completed successfully')

        // Create a streaming response that sends the orchestrator data as valid JSON
        const stream = new ReadableStream({
            start(controller) {
                const encoder = new TextEncoder()

                try {
                    // Send response directly as streaming data (no double JSON encoding)
                    const dataChunk = `data: ${JSON.stringify(response)}\n\n`
                    console.log('📤 Sending orchestrator stream data:', {
                        chunkLength: dataChunk.length,
                        responseKeys: Object.keys(response),
                        preview: dataChunk.substring(0, 100),
                        format: 'direct_json'
                    })

                    controller.enqueue(encoder.encode(dataChunk))
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    controller.close()
                } catch (streamError) {
                    console.error('🚨 Stream creation error:', streamError)
                    // Fallback: send minimal response
                    const fallbackData = JSON.stringify({
                        success: true,
                        message: 'Orchestration completed',
                        turnIndex: finalState.turnIndex
                    })
                    controller.enqueue(encoder.encode(`data: ${fallbackData}\n\n`))
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                    controller.close()
                }
            }
        })

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            }
        })

    } catch (error) {
        console.error('❌ Multi-agent orchestration failed:', error)
        throw error
    }
}

/**
 * Handle single-agent streaming mode
 */
async function handleSingleAgentChat(
    body: { messages?: ChatMessage[] },
    sessionId: string,
    messageContent: string,
    userId: string,
    agentId: string
) {
    try {
        console.log('⚡ Starting single-agent streaming...')

        // Save user message to database
        console.log('💾 Saving user message to database...')
        await addMessageToSession({
            sessionId,
            senderType: 'user',
            senderId: userId,
            content: messageContent,
            contentType: 'text'
        })

        // Get all messages for context
        const allMessages = body.messages || []

        // Create OpenRouter provider
        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error('OPENROUTER_API_KEY is not configured')
        }

        const openrouter = createOpenRouter({
            apiKey: process.env.OPENROUTER_API_KEY,
            headers: {
                'HTTP-Referer': process.env.BETTER_AUTH_URL || 'http://localhost:3000',
                'X-Title': 'SwarmAI.chat'
            }
        })

        const modelName = getModelForAgent(agentId)
        const model = openrouter.chat(modelName)
        const systemPrompt = getAgentSystemPrompt(agentId)

        const startTime = Date.now()

        // Prepare messages for AI model
        const aiMessages = [
            { role: 'system' as const, content: systemPrompt },
            ...allMessages.map((msg: ChatMessage) => ({
                role: msg.role,
                content: msg.content
            }))
        ]

        // Stream AI response
        const result = await streamText({
            model,
            messages: aiMessages,
            temperature: 0.7,
            maxTokens: 2048,
            onFinish: async (completion) => {
                try {
                    const processingTime = Date.now() - startTime
                    const tokenCount = completion.usage?.totalTokens || 0
                    const cost = calculateCost(tokenCount, modelName)

                    await addMessageToSession({
                        sessionId,
                        senderType: 'agent',
                        senderId: agentId,
                        content: completion.text,
                        contentType: 'text',
                        tokenCount,
                        processingTime,
                        cost
                    })

                    console.log(`✅ Single-agent response saved:`, {
                        agentId,
                        tokenCount,
                        processingTime: `${processingTime}ms`,
                        cost: `$${cost.toFixed(4)}`
                    })
                } catch (error) {
                    console.error('❌ Error saving single-agent response:', error)
                }
            }
        })

        console.log('✅ Single-agent streaming response created')
        return result.toDataStreamResponse()

    } catch (error) {
        console.error('❌ Single-agent streaming failed:', error)
        throw error
    }
}

/**
 * Get OpenRouter model name based on agent ID
 */
function getModelForAgent(agentId: string): string {
    const agentModels: Record<string, string> = {
        'gemini-flash': 'google/gemini-2.0-flash-exp:free',
        'general-assistant': 'google/gemini-2.0-flash-exp:free',
        'article-summarizer': 'google/gemini-2.0-flash-exp:free',
        'critical-thinker': 'anthropic/claude-3.5-sonnet',
        'creative-writer': 'anthropic/claude-3.5-sonnet',
        'code-expert': 'anthropic/claude-3.5-sonnet',
        'data-scientist': 'anthropic/claude-3.5-sonnet',
        'education-tutor': 'google/gemini-2.0-flash-exp:free',
        'researcher': 'anthropic/claude-3.5-sonnet'
    }

    return agentModels[agentId] || 'google/gemini-2.0-flash-exp:free'
}

/**
 * Get system prompt based on agent ID
 */
function getAgentSystemPrompt(agentId: string): string {
    const agentPrompts: Record<string, string> = {
        'gemini-flash': `你是 Gemini Flash，一个快速高效的AI助手。请用简洁、准确的方式回答用户的问题。`,
        'general-assistant': `你是一个通用的AI助手，能够帮助用户解决各种问题。请保持友好、有帮助的态度。`,
        'article-summarizer': `你是一个专业的文章摘要师。你的任务是：
1. 快速理解文章的核心内容
2. 提取关键信息和要点
3. 生成简洁准确的摘要
4. 保持原文的语调和风格`,
        'critical-thinker': `你是一个批判性思考专家。你的任务是：
1. 分析问题的多个角度
2. 识别潜在的逻辑漏洞
3. 提出深层次的问题
4. 提供平衡和客观的观点`,
        'creative-writer': `你是一个创意写作专家。你的任务是：
1. 创作富有想象力的内容
2. 运用生动的语言和比喻
3. 构建引人入胜的故事情节
4. 保持创新和原创性`,
        'code-expert': `你是一个编程专家。你的任务是：
1. 提供高质量的代码解决方案
2. 解释编程概念和最佳实践
3. 调试和优化代码
4. 推荐合适的技术栈和工具`,
        'data-scientist': `你是一个数据科学专家。你的任务是：
1. 分析和解读数据
2. 提供统计洞察
3. 建议数据处理方法
4. 解释机器学习概念`,
        'education-tutor': `你是一个教育导师。你的任务是：
1. 以易懂的方式解释复杂概念
2. 提供学习建议和资源
3. 鼓励学生的学习进程
4. 适应不同的学习风格`,
        'researcher': `你是一个研究专家。你的任务是：
1. 进行深入的信息搜集
2. 分析资料的可靠性
3. 提供综合性的研究报告
4. 提出进一步研究的方向`
    }

    return agentPrompts[agentId] || agentPrompts['general-assistant']
}

/**
 * Calculate cost based on token usage and model
 * OpenRouter pricing varies by model
 */
function calculateCost(tokenCount: number, modelName: string): number {
    // Cost per 1K tokens for different models (in USD)
    const modelCosts: Record<string, number> = {
        'google/gemini-2.0-flash-exp:free': 0, // Free model
        'anthropic/claude-3.5-sonnet': 0.003,
        'openai/gpt-4o': 0.005
    }

    const costPer1K = modelCosts[modelName] || 0.001
    return (tokenCount / 1000) * costPer1K
}