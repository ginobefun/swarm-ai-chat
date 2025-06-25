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