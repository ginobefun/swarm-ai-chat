import { NextRequest } from 'next/server'
import { streamText, createDataStreamResponse } from 'ai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

import prisma from '@/lib/database/prisma'
import { addMessageToSession } from '@/lib/database/sessions-prisma'
import { getLatestTurnIndex } from '@/lib/orchestrator/hooks'
import { auth } from '@/lib/auth'

// Import our new types
import {
    ChatMessage,
    ChatRequestData,
    SessionAnalysis,
    StreamEvent,
    EnhancedTask,
    EnhancedOrchestratorResponse,
    UserAction
} from '@/types/chat'
import { AgentConfigService } from '@/lib/services/AgentConfigService'

// Active session states for handling interrupts
const activeOrchestrations = new Map<string, {
    controller: AbortController
    startTime: number
}>()

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

        // Check for user actions (interrupt, retry, feedback)
        if (requestData.userAction) {
            return handleUserAction(requestData.userAction, requestData.sessionId)
        }

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
            return handleEnhancedMultiAgentChat({
                messages,
                sessionId,
                messageContent,
                userId,
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
 * Handle user actions (interrupt, retry, feedback)
 */
async function handleUserAction(action: UserAction, sessionId: string) {
    console.log('🎮 Handling user action:', action)

    switch (action.type) {
        case 'interrupt':
            const orchestration = activeOrchestrations.get(sessionId)
            if (orchestration) {
                orchestration.controller.abort()
                activeOrchestrations.delete(sessionId)
                return new Response(JSON.stringify({ success: true, message: 'Process interrupted' }), {
                    headers: { 'Content-Type': 'application/json' }
                })
            }
            break

        case 'like':
        case 'dislike':
            // Store feedback in database
            // TODO: Implement feedback storage
            return new Response(JSON.stringify({ success: true }), {
                headers: { 'Content-Type': 'application/json' }
            })

        case 'retry':
            // TODO: Implement retry logic
            break

        case 'suggest':
            // TODO: Handle suggestion for improvement
            break
    }

    return new Response(JSON.stringify({ success: false, message: 'Action not implemented' }), {
        headers: { 'Content-Type': 'application/json' }
    })
}

/**
 * Enhanced multi-agent chat with natural streaming output
 */
async function handleEnhancedMultiAgentChat({
    sessionId,
    messageContent,
    userId,
    sessionAnalysis
}: {
    messages: ChatMessage[]
    sessionId: string
    messageContent: string
    userId: string
    sessionAnalysis: SessionAnalysis
}) {
    console.log('🤖 Starting enhanced multi-agent orchestration...')

    // Create abort controller for interrupts
    const controller = new AbortController()
    activeOrchestrations.set(sessionId, {
        controller,
        startTime: Date.now()
    })

    // Save user message to database
    await addMessageToSession({
        sessionId,
        senderType: 'user',
        senderId: userId,
        content: messageContent,
        contentType: 'text'
    })

    const openrouter = createOpenRouter({
        apiKey: process.env.OPENROUTER_API_KEY!,
        headers: {
            'HTTP-Referer': process.env.BETTER_AUTH_URL || 'https://swarmai.chat',
            'X-Title': 'SwarmAI.chat'
        }
    })

    // Get agent configurations
    const agentConfigService = AgentConfigService.getInstance()
    const agentConfigs = new Map()
    for (const agentId of sessionAnalysis.agentIds) {
        const config = await agentConfigService.getAgentConfiguration(agentId)
        agentConfigs.set(agentId, config)
    }

    return createDataStreamResponse({
        execute: async (dataStream) => {
            const streamEvents: StreamEvent[] = []
            const tasks: EnhancedTask[] = []

            try {
                // Step 1: Moderator understands and plans
                const planningEvent: StreamEvent = {
                    id: crypto.randomUUID(),
                    type: 'task_planning',
                    timestamp: new Date(),
                    agentId: 'moderator',
                    content: '正在理解您的需求并制定计划...'
                }
                streamEvents.push(planningEvent)
                dataStream.writeData(JSON.parse(JSON.stringify(planningEvent)))

                // Stream moderator's thinking process
                const moderatorStream = streamText({
                    model: openrouter.chat('openai/gpt-4o-mini'),
                    messages: [
                        {
                            role: 'system',
                            content: `你是一个多智能体系统的主持人。请用自然、友好的语言分析用户的需求，并制定任务计划。

当前可用的智能体：
${sessionAnalysis.agentIds.map(id => {
                                const config = agentConfigs.get(id)
                                return `- @${config.name} (${id}): ${config.systemPrompt.substring(0, 100)}...`
                            }).join('\n')}

要求：
1. 首先用简洁的语言说明你对用户需求的理解
2. 列出需要完成的主要任务（2-4个）
3. 使用 @智能体名称 的格式分配任务
4. 用友好的语气解释为什么这样分配

示例输出：
"我理解您想要深度分析这篇文章。让我为您安排几位专家来协助：

📋 任务分解：
1. 文章核心内容提取 - @文章摘要师 将为您提取关键信息
2. 批判性分析 - @批判性思考者 将评估论点的逻辑性
3. 实用建议总结 - @研究分析师 将提炼可行动的见解

现在开始执行..."`
                        },
                        {
                            role: 'user',
                            content: messageContent
                        }
                    ],
                    onFinish: async (result) => {
                        // Parse tasks from moderator's response
                        const taskMatches = result.text.matchAll(/@(\S+)\s+将/g)
                        let taskIndex = 0
                        for (const match of taskMatches) {
                            const agentName = match[1]
                            const agentId = sessionAnalysis.agentIds.find(id =>
                                agentConfigs.get(id)?.name === agentName
                            ) || sessionAnalysis.agentIds[taskIndex % sessionAnalysis.agentIds.length]

                            const task: EnhancedTask = {
                                id: crypto.randomUUID(),
                                title: `任务 ${taskIndex + 1}`,
                                description: '',
                                assignedTo: agentId,
                                status: 'pending',
                                priority: 'medium',
                                createdAt: new Date(),
                                progress: 0
                            }
                            tasks.push(task)
                            taskIndex++

                            // Send task created event
                            const taskEvent: StreamEvent = {
                                id: crypto.randomUUID(),
                                type: 'task_created',
                                timestamp: new Date(),
                                taskId: task.id,
                                agentId: task.assignedTo,
                                content: `任务已分配给 @${agentConfigs.get(agentId)?.name}`
                            }
                            streamEvents.push(taskEvent)
                            dataStream.writeData(JSON.parse(JSON.stringify(taskEvent)))
                        }
                    }
                })

                // Merge moderator stream
                moderatorStream.mergeIntoDataStream(dataStream)
                await moderatorStream

                // Step 2: Execute tasks with each agent
                for (const task of tasks) {
                    if (controller.signal.aborted) break

                    const agentConfig = agentConfigs.get(task.assignedTo)
                    if (!agentConfig) continue

                    // Task started event
                    const startEvent: StreamEvent = {
                        id: crypto.randomUUID(),
                        type: 'task_started',
                        timestamp: new Date(),
                        taskId: task.id,
                        agentId: task.assignedTo,
                        content: `@${agentConfig.name} 开始处理任务...`
                    }
                    streamEvents.push(startEvent)
                    dataStream.writeData(JSON.parse(JSON.stringify(startEvent)))

                    // Update task status
                    task.status = 'in_progress'
                    task.startedAt = new Date()

                    // Stream agent's response
                    const agentStream = streamText({
                        model: openrouter.chat(agentConfig.modelName),
                        messages: [
                            {
                                role: 'system',
                                content: agentConfig.systemPrompt
                            },
                            {
                                role: 'user',
                                content: `${messageContent}\n\n请根据你的专长完成分配给你的任务。使用 Markdown 格式输出。`
                            }
                        ],
                        temperature: agentConfig.temperature,
                        maxTokens: agentConfig.maxTokens,
                        onFinish: async (result) => {
                            // Task completed
                            task.status = 'completed'
                            task.completedAt = new Date()
                            task.progress = 100
                            task.output = result.text

                            const completeEvent: StreamEvent = {
                                id: crypto.randomUUID(),
                                type: 'task_completed',
                                timestamp: new Date(),
                                taskId: task.id,
                                agentId: task.assignedTo,
                                content: `@${agentConfig.name} 已完成任务`
                            }
                            streamEvents.push(completeEvent)
                            dataStream.writeData(JSON.parse(JSON.stringify(completeEvent)))

                            // Save to database
                            await addMessageToSession({
                                sessionId,
                                senderType: 'agent',
                                senderId: task.assignedTo,
                                content: result.text,
                                contentType: 'text'
                            })
                        }
                    })

                    agentStream.mergeIntoDataStream(dataStream)
                    await agentStream
                }

                // Step 3: Final summary
                if (!controller.signal.aborted && tasks.length > 0) {
                    const summaryEvent: StreamEvent = {
                        id: crypto.randomUUID(),
                        type: 'summary_started',
                        timestamp: new Date(),
                        agentId: 'moderator',
                        content: '\n\n📊 正在为您整理最终结果...'
                    }
                    streamEvents.push(summaryEvent)
                    dataStream.writeData(JSON.parse(JSON.stringify(summaryEvent)))

                    // Create summary with structured results
                    const summaryStream = streamText({
                        model: openrouter.chat('openai/gpt-4o-mini'),
                        messages: [
                            {
                                role: 'system',
                                content: `作为主持人，请基于各智能体的输出创建一个结构化的总结。

使用以下格式：

## 📖 执行摘要
[简要总结主要发现]

## 🎯 关键要点
- 要点1
- 要点2
- ...

## 💭 批判性思考
[如果有批判性分析的内容]

## 💡 行动建议
[可执行的建议]

## 📌 精彩引述
[如果有值得记住的句子]`
                            },
                            {
                                role: 'user',
                                content: tasks.map(t =>
                                    `@${agentConfigs.get(t.assignedTo)?.name} 的分析：\n${t.output}`
                                ).join('\n\n---\n\n')
                            }
                        ],
                        onFinish: async (result) => {
                            const summaryCompleteEvent: StreamEvent = {
                                id: crypto.randomUUID(),
                                type: 'summary_completed',
                                timestamp: new Date(),
                                agentId: 'moderator',
                                content: '✅ 分析完成！'
                            }
                            streamEvents.push(summaryCompleteEvent)
                            dataStream.writeData(JSON.parse(JSON.stringify(summaryCompleteEvent)))

                            // Save summary
                            await addMessageToSession({
                                sessionId,
                                senderType: 'agent',
                                senderId: 'moderator',
                                content: result.text,
                                contentType: 'text'
                            })
                        }
                    })

                    summaryStream.mergeIntoDataStream(dataStream)
                    await summaryStream
                }

                // Send final orchestrator response
                const orchestratorResponse: EnhancedOrchestratorResponse = {
                    type: 'orchestrator',
                    success: true,
                    turnIndex: await getLatestTurnIndex(sessionId) + 1,
                    phase: 'completed',
                    events: streamEvents.map(e => ({
                        id: e.id,
                        type: e.type,
                        timestamp: e.timestamp.toISOString(),
                        content: e.content,
                        agentId: e.agentId
                    })),
                    tasks,
                    results: tasks.filter(t => t.status === 'completed').map(t => ({
                        taskId: t.id,
                        agentId: t.assignedTo,
                        content: t.output || ''
                    })),
                    costUSD: 0, // TODO: Calculate actual cost
                    streamEvents,
                    isStreaming: false,
                    canInterrupt: false,
                    canRetry: true
                }

                dataStream.writeData(JSON.parse(JSON.stringify(orchestratorResponse)))

            } catch (error) {
                console.error('❌ Orchestration error:', error)
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'

                if (error instanceof Error && error.name === 'AbortError') {
                    dataStream.writeData({
                        type: 'error',
                        message: 'Process interrupted by user'
                    })
                } else {
                    dataStream.writeData({
                        type: 'error',
                        message: errorMessage
                    })
                }
            } finally {
                activeOrchestrations.delete(sessionId)
            }
        },
        headers: {
            'X-Chat-Mode': 'multi-enhanced',
            'X-Agent-Count': sessionAnalysis.agentIds.length.toString()
        },
        onError: (error) => {
            console.error('🔴 Multi-agent streaming error:', error)
            activeOrchestrations.delete(sessionId)
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