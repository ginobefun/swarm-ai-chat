import { NextRequest, NextResponse } from 'next/server'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { streamText } from 'ai'
import { addMessageToSession } from '@/lib/database/sessions-prisma'
import { z } from 'zod'

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
    const body = await req.json()
    
    // Validate request data
    const { sessionId, message, agentId = 'gemini-flash', userId } = ChatRequestSchema.parse(body)

    // Save user message to database first
    await addMessageToSession({
      sessionId,
      senderType: 'user',
      senderId: userId,
      content: message,
      contentType: 'text'
    })

    // Create OpenRouter provider instance
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

    // Create system prompt based on agent
    const systemPrompt = getAgentSystemPrompt(agentId)

    const startTime = Date.now()

    // Stream AI response
    const result = await streamText({
      model,
      messages: [
        { 
          role: 'system', 
          content: systemPrompt 
        },
        { 
          role: 'user', 
          content: message 
        }
      ],
      temperature: 0.7,
      maxTokens: 2048,
      // Callback to save AI response chunks as they come
      onFinish: async (completion) => {
        try {
          const processingTime = Date.now() - startTime
          const tokenCount = completion.usage?.totalTokens || 0
          const cost = calculateCost(tokenCount, modelName)

          // Save AI response to database
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

          console.log(`✅ AI Response saved for session ${sessionId}:`, {
            agentId,
            modelName,
            tokenCount,
            processingTime: `${processingTime}ms`,
            cost: `$${cost.toFixed(4)}`
          })
        } catch (error) {
          console.error('❌ Error saving AI response:', error)
        }
      }
    })

    // Return streaming response
    return result.toDataStreamResponse()

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
    'gemini-flash': 'google/gemini-2.0-flash-exp',
    'article-summarizer': 'google/gemini-2.0-flash-exp', 
    'critical-thinker': 'anthropic/claude-3.5-sonnet',
    'creative-writer': 'anthropic/claude-3.5-sonnet',
    'data-scientist': 'openai/gpt-4o'
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
- 列出3-5个核心要点
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
5. 改进建议`
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
    'google/gemini-2.0-flash-exp': 0.075, // $0.075 per 1M tokens
    'anthropic/claude-3.5-sonnet': 3.0,   // $3.00 per 1M tokens  
    'openai/gpt-4o': 2.5                  // $2.50 per 1M tokens
  }

  const pricePerMillion = modelPricing[modelName] || 0.075
  return (tokenCount / 1000000) * pricePerMillion
}