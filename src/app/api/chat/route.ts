import { NextRequest, NextResponse } from 'next/server'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { addMessageToSession } from '@/lib/database/sessions-prisma'
import { z } from 'zod'
import { ContextManager } from '@/lib/langchain/context-manager'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { globalMetricsTracker, createMetric } from '@/lib/metrics/agent-metrics'

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
    message: z.string().min(1),
    agentId: z.string().optional(),
    userId: z.string()
})

/**
 * POST /api/chat
 * Handle chat messages with AI using OpenRouter's Gemini 2.5 Flash
 * 
 * Features:
 * - Stream AI responses using Vercel AI SDK + OpenRouter
 * - Save user and AI messages to SwarmChatMessage
 * - Support for different AI agents
 * - Error handling and logging
 */
export async function POST(req: NextRequest) {
    try {
        console.log('🔍 Chat API - Starting request processing')
        const body = await req.json()
        console.log('🔍 Chat API - Received body:', {
            hasMessages: !!body.messages,
            messagesLength: body.messages?.length,
            sessionId: body.sessionId,
            userId: body.userId,
            agentId: body.agentId
        })

        // Extract message from Vercel AI SDK format (messages array) or direct format
        const messageContent = body.messages?.slice(-1)[0]?.content || body.message
        console.log('🔍 Chat API - Extracted message content:', messageContent?.substring(0, 100) + '...')

        // Get all messages for context (required by AI SDK)
        const allMessages = body.messages || []
        console.log('🔍 Chat API - All messages count:', allMessages.length)

        // Validate request data (message field is not required since it comes from messages array)
        const { sessionId, agentId = 'gemini-flash', userId } = ChatRequestSchema.omit({ message: true }).parse(body)
        console.log('🔍 Chat API - Validation passed:', { sessionId, agentId, userId })

        // Validate message content
        if (!messageContent || typeof messageContent !== 'string') {
            throw new Error('Message content is required')
        }

        // Save user message to database first
        console.log('🔍 Chat API - Saving user message to database')
        try {
            await addMessageToSession({
                sessionId,
                senderType: 'user',
                senderId: userId,
                content: messageContent,
                contentType: 'text'
            })
            console.log('✅ Chat API - User message saved successfully')
        } catch (dbError) {
            console.error('❌ Chat API - Database error:', dbError)
            throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown database error'}`)
        }

        // Create OpenRouter provider instance
        console.log('🔍 Chat API - Creating OpenRouter provider')
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

        // Select model based on agent
        const modelName = getModelForAgent(agentId)
        const model = openrouter.chat(modelName)
        console.log('🔍 Chat API - Selected model:', modelName)

        // Create system prompt based on agent
        const systemPrompt = getAgentSystemPrompt(agentId)
        console.log('🔍 Chat API - Created system prompt for agent:', agentId)

        const startTime = Date.now()

        // Prepare messages for AI model
        console.log('🔍 Chat API - Preparing messages for AI model')

        // Convert to LangChain messages for context optimization
        const langchainMessages = allMessages.map((msg: ChatMessage) => {
            if (msg.role === 'user') {
                return new HumanMessage(msg.content)
            } else if (msg.role === 'assistant') {
                return new AIMessage(msg.content)
            } else {
                return new SystemMessage(msg.content)
            }
        })

        // Optimize context using ContextManager (4000 tokens limit for single chat)
        const contextManager = new ContextManager({
            maxTokens: 4000,
            minMessages: 3,
            preserveSystemMessages: true,
            preserveRecentMessages: 5
        })

        const optimizedContext = contextManager.optimizeContext(langchainMessages)
        console.log(`🔍 Chat API - Context optimized: ${langchainMessages.length} -> ${optimizedContext.messages.length} messages, ${optimizedContext.tokenCount} tokens`)

        // Convert back to AI SDK format
        const optimizedAiMessages = [
            {
                role: 'system' as const,
                content: systemPrompt
            },
            ...optimizedContext.messages.map((msg) => ({
                role: msg._getType() === 'human' ? 'user' as const :
                     msg._getType() === 'ai' ? 'assistant' as const :
                     'system' as const,
                content: msg.content as string
            }))
        ]
        console.log('🔍 Chat API - AI messages prepared, count:', optimizedAiMessages.length)

        // Stream AI response
        console.log('🔍 Chat API - Starting AI stream text generation')
        try {
            const result = await streamText({
                model,
                messages: optimizedAiMessages,
                temperature: 0.7,
                maxTokens: 2048,
                // Callback to save AI response chunks as they come
                onFinish: async (completion) => {
                    console.log('🔍 Chat API - onFinish callback triggered')
                    console.log('🔍 Chat API - Completion object:', {
                        hasText: !!completion.text,
                        textLength: completion.text?.length,
                        hasUsage: !!completion.usage,
                        usage: completion.usage
                    })

                    try {
                        const processingTime = Date.now() - startTime
                        const tokenCount = completion.usage?.totalTokens || 0
                        const cost = calculateCost(tokenCount, modelName)

                        console.log('🔍 Chat API - Calculated metrics:', {
                            processingTime,
                            tokenCount,
                            cost
                        })

                        // Save AI response to database
                        const savedMessage = await addMessageToSession({
                            sessionId,
                            senderType: 'agent',
                            senderId: agentId,
                            content: completion.text,
                            contentType: 'text',
                            tokenCount,
                            processingTime,
                            cost
                        })

                        // Record agent metrics
                        const agentMetric = createMetric({
                            agentId,
                            agentName: `Agent-${agentId}`,
                            sessionId,
                            messageId: savedMessage?.id || 'unknown',
                            startTime,
                            tokenCount,
                            cost,
                            success: true,
                            model: modelName,
                        })
                        globalMetricsTracker.record(agentMetric)

                        console.log(`✅ AI Response saved for session ${sessionId}:`, {
                            agentId,
                            modelName,
                            tokenCount,
                            processingTime: `${processingTime}ms`,
                            cost: `$${cost.toFixed(4)}`,
                            contextOptimization: `${langchainMessages.length} -> ${optimizedContext.messages.length} messages`
                        })
                    } catch (error) {
                        console.error('❌ Error saving AI response:', error)
                        console.error('❌ Error details:', {
                            name: error instanceof Error ? error.name : 'Unknown',
                            message: error instanceof Error ? error.message : String(error),
                            stack: error instanceof Error ? error.stack : undefined
                        })

                        // Record failed metric
                        const failedMetric = createMetric({
                            agentId,
                            agentName: `Agent-${agentId}`,
                            sessionId,
                            messageId: 'failed',
                            startTime,
                            tokenCount: 0,
                            cost: 0,
                            success: false,
                            errorType: error instanceof Error ? error.message : 'Unknown error',
                        })
                        globalMetricsTracker.record(failedMetric)
                    }
                },
                onError: (error) => {
                    console.error('❌ Chat API - Stream error:', error)
                }
            })

            console.log('✅ Chat API - AI stream created successfully')
            // Return streaming response
            return result.toDataStreamResponse()
        } catch (aiError) {
            console.error('❌ Chat API - AI generation error:', aiError)
            throw new Error(`AI generation error: ${aiError instanceof Error ? aiError.message : 'Unknown AI error'}`)
        }

    } catch (error) {
        console.error('❌ Chat API Error:', error)

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
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

/**
 * Get OpenRouter model name based on agent ID
 */
function getModelForAgent(agentId: string): string {
    const agentModels: Record<string, string> = {
        'gemini-flash': 'google/gemini-flash-1.5',
        'article-summarizer': 'google/gemini-flash-1.5',
        'critical-thinker': 'anthropic/claude-3.5-sonnet',
        'creative-writer': 'anthropic/claude-3.5-sonnet',
        'data-scientist': 'openai/gpt-4o',
        'code-expert': 'google/gemini-flash-1.5'
    }

    return agentModels[agentId] || agentModels['gemini-flash']
}

/**
 * Get system prompt based on agent ID
 */
function getAgentSystemPrompt(agentId: string): string {
    const agentPrompts: Record<string, string> = {
        'gemini-flash': `你是 SwarmAI.chat 平台上的智能助手，专门为用户提供高质量的对话支持。

核心特征：
- 友好、专业、富有洞察力
- 能够理解上下文并提供深入的回答
- 支持中英文交流，优先使用用户的语言
- 关注用户体验，提供结构化的回答

回答风格：
- 清晰简洁，重点突出
- 使用适当的格式（列表、段落等）
- 必要时提供具体的例子
- 保持温和且专业的语调

请根据用户的问题提供有帮助的回答。`,

        'article-summarizer': `你是一位专业的文章摘要师，擅长快速提取文档的核心观点和要点。

专长能力：
- 快速理解长篇文档的主要内容
- 提取关键信息和核心论点
- 生成结构化的摘要报告
- 识别重要的数据和结论

工作方式：
- 首先概述文档的主题和范围
- 列出 3-5 个核心要点
- 提供具体的数据支持
- 总结主要结论和建议`,

        'critical-thinker': `你是一位批判性思维专家，专门分析论点的逻辑性和可靠性。

分析重点：
- 论证的逻辑结构和推理过程
- 证据的可靠性和相关性
- 潜在的偏见和假设
- 论点的局限性和反驳观点

分析框架：
1. 论点强度分析
2. 证据质量评估
3. 逻辑漏洞识别
4. 替代观点探讨
5. 改进建议`,

        'code-expert': `你是一位编程专家，擅长多种编程语言和技术栈。

专长能力：
- 精通 Java、Python、JavaScript、TypeScript、Go 等多种编程语言
- 熟悉前端、后端、移动端开发
- 代码审查和性能优化
- 架构设计和最佳实践

回答风格：
- 提供清晰的代码示例
- 解释关键概念和原理
- 给出最佳实践建议
- 包含完整的实现步骤

请根据用户的编程问题提供专业的技术解答。`
    }

    return agentPrompts[agentId] || agentPrompts['gemini-flash']
}

/**
 * Calculate cost based on token usage and model
 * OpenRouter pricing varies by model
 */
function calculateCost(tokenCount: number, modelName: string): number {
    // OpenRouter pricing per 1M tokens (approximate)
    const modelPricing: Record<string, number> = {
        'google/gemini-flash-1.5': 0.075,     // $0.075 per 1M tokens (input)
        'google/gemini-2.0-flash-001': 0.10,  // $0.10 per 1M tokens (input)
        'google/gemini-2.0-flash-exp:free': 0, // Free tier
        'anthropic/claude-3.5-sonnet': 3.0,   // $3.00 per 1M tokens  
        'openai/gpt-4o': 2.5                  // $2.50 per 1M tokens
    }

    const pricePerMillion = modelPricing[modelName] || 0.075
    return (tokenCount / 1000000) * pricePerMillion
}