// 通用工具函数
import {
    SessionTypeValue,
    SessionStatusValue,
    ParticipantRoleValue,
    SenderTypeValue,
    ContentTypeValue,
    MessageStatusValue
} from '@/types'

// 通用日期格式化工具
export const formatTimeAgo = (date: Date | string, t: (key: string) => string): string => {
    const now = new Date()
    const targetDate = typeof date === 'string' ? new Date(date) : date
    const diff = now.getTime() - targetDate.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return t('session.justNow')
    if (minutes < 60) return `${minutes}${t('common.minute')}`
    if (hours < 24) return `${hours}${t('common.hour')}`
    if (days < 7) return `${days}${t('common.day')}`
    return targetDate.toLocaleDateString()
}

// 用户名或 ID 验证
export const isValidUserId = (id: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

// 会话标题生成
export const generateSessionTitle = (participants: { name: string; type: 'user' | 'agent' }[]): string => {
    const agents = participants.filter(p => p.type === 'agent')
    if (agents.length === 0) return '新会话'
    if (agents.length === 1) return `与 ${agents[0].name} 的对话`
    if (agents.length === 2) return `与 ${agents[0].name} 和 ${agents[1].name} 的对话`
    return `与 ${agents[0].name} 等 ${agents.length} 个助手的对话`
}

// 安全的 JSON 解析
export const safeParseJSON = <T>(jsonString: string, defaultValue: T): T => {
    try {
        return JSON.parse(jsonString) as T
    } catch {
        return defaultValue
    }
}

// 枚举值验证工具
export const isValidSessionType = (value: string): value is SessionTypeValue => {
    return ['direct', 'group', 'workflow'].includes(value)
}

export const isValidSessionStatus = (value: string): value is SessionStatusValue => {
    return ['active', 'paused', 'completed', 'archived'].includes(value)
}

export const isValidParticipantRole = (value: string): value is ParticipantRoleValue => {
    return ['owner', 'admin', 'participant', 'observer'].includes(value)
}

export const isValidSenderType = (value: string): value is SenderTypeValue => {
    return ['user', 'agent', 'system'].includes(value)
}

export const isValidContentType = (value: string): value is ContentTypeValue => {
    return ['text', 'file', 'image', 'code', 'system'].includes(value)
}

export const isValidMessageStatus = (value: string): value is MessageStatusValue => {
    return ['sending', 'sent', 'delivered', 'read', 'failed'].includes(value)
}

/**
 * Extract JSON from AI response that might be wrapped in markdown code blocks
 * or contain extra text before/after the JSON
 */
export const extractJSONFromResponse = <T = unknown>(text: string): T => {
    if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string')
    }

    // Try different extraction strategies
    const strategies = [
        // Strategy 1: Direct JSON parse (pure JSON response)
        () => JSON.parse(text.trim()),

        // Strategy 2: Extract from markdown code blocks
        () => {
            const jsonBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i)
            if (jsonBlockMatch) {
                return JSON.parse(jsonBlockMatch[1].trim())
            }
            throw new Error('No JSON code block found')
        },

        // Strategy 3: Extract from curly braces (find first complete JSON object)
        () => {
            const start = text.indexOf('{')
            if (start === -1) throw new Error('No opening brace found')

            let braceCount = 0
            let end = start

            for (let i = start; i < text.length; i++) {
                if (text[i] === '{') braceCount++
                else if (text[i] === '}') braceCount--

                if (braceCount === 0) {
                    end = i + 1
                    break
                }
            }

            const jsonStr = text.substring(start, end)
            return JSON.parse(jsonStr)
        },

        // Strategy 4: Extract from square brackets (for JSON arrays)
        () => {
            const start = text.indexOf('[')
            if (start === -1) throw new Error('No opening bracket found')

            let bracketCount = 0
            let end = start

            for (let i = start; i < text.length; i++) {
                if (text[i] === '[') bracketCount++
                else if (text[i] === ']') bracketCount--

                if (bracketCount === 0) {
                    end = i + 1
                    break
                }
            }

            const jsonStr = text.substring(start, end)
            return JSON.parse(jsonStr)
        }
    ]

    // Try each strategy until one succeeds
    const errors: string[] = []
    for (let i = 0; i < strategies.length; i++) {
        try {
            const result = strategies[i]()
            console.log(`✅ JSON extracted using strategy ${i + 1}`, {
                strategy: ['Direct JSON', 'Markdown block', 'Curly braces', 'Square brackets'][i],
                resultType: typeof result,
                resultKeys: typeof result === 'object' ? Object.keys(result) : 'N/A'
            })
            return result
        } catch (error) {
            const errorMsg = (error as Error).message
            errors.push(`Strategy ${i + 1}: ${errorMsg}`)
            console.log(`❌ Strategy ${i + 1} failed:`, {
                strategy: ['Direct JSON', 'Markdown block', 'Curly braces', 'Square brackets'][i],
                error: errorMsg,
                textPreview: text.substring(0, 100)
            })
            continue
        }
    }

    // If all strategies fail, throw a detailed error with all attempts
    console.error('🚨 All JSON extraction strategies failed:', {
        textLength: text.length,
        textPreview: text.substring(0, 300),
        allErrors: errors,
        containsCodeBlock: text.includes('```'),
        containsBraces: text.includes('{'),
        containsBrackets: text.includes('[')
    })
    throw new Error(`Failed to extract JSON from response after ${strategies.length} attempts. All errors: ${errors.join('; ')}. Text preview: ${text.substring(0, 200)}...`)
}

/**
 * Safe JSON extraction with fallback value
 */
export const safeExtractJSON = <T>(text: string, fallback: T): T => {
    try {
        return extractJSONFromResponse<T>(text)
    } catch (error) {
        console.warn('JSON extraction failed, using fallback:', (error as Error).message)
        return fallback
    }
} 