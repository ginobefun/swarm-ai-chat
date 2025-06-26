import type {
    SwarmChatSession,
    SwarmChatSessionParticipant,
    SwarmAIAgent,
    SwarmUser
} from '@prisma/client'
import type { Session as FrontendSession, SessionParticipant } from '@/types'

// 定义数据库查询的扩展类型
export type SessionWithIncludes = SwarmChatSession & {
    participants?: (SwarmChatSessionParticipant & {
        agent?: SwarmAIAgent | null
        user?: SwarmUser | null
    })[]
    primaryAgent?: SwarmAIAgent | null
}

/**
 * 转换 Prisma 会话为前端会话格式
 * 
 * @param session - 从数据库查询得到的会话数据，包含关联的参与者和主要智能体
 * @returns 前端所需的会话格式
 */
export function convertPrismaSessionToSession(session: SessionWithIncludes): FrontendSession {
    // 转换参与者数据
    const participants: SessionParticipant[] = []

    // 如果有主要智能体，添加到参与者列表
    if (session.primaryAgent) {
        participants.push({
            id: session.primaryAgent.id,
            type: 'agent',
            name: session.primaryAgent.name,
            avatar: session.primaryAgent.avatar || `bg-gradient-to-br from-indigo-500 to-purple-600`,
            avatarStyle: session.primaryAgent.avatarStyle || undefined
        })
    }

    // 添加其他参与者（如果存在）
    if (session.participants) {
        session.participants.forEach((p) => {
            // 添加智能体参与者（排除已添加的主要智能体）
            if (p.agent && p.agent.id !== session.primaryAgentId) {
                participants.push({
                    id: p.agent.id,
                    type: 'agent',
                    name: p.agent.name,
                    avatar: p.agent.avatar || `bg-gradient-to-br from-indigo-500 to-purple-600`,
                    avatarStyle: p.agent.avatarStyle || undefined
                })
            }
            // 添加用户参与者
            if (p.user) {
                participants.push({
                    id: p.user.id,
                    type: 'user',
                    name: p.user.username || 'User',
                    avatar: p.user.avatarUrl || `bg-gradient-to-br from-green-500 to-blue-600`,
                    avatarStyle: undefined
                })
            }
        })
    }

    return {
        id: session.id,
        title: session.title,
        description: session.description,
        type: session.type as 'DIRECT' | 'GROUP' | 'WORKFLOW', // 保持大写枚举
        status: session.status as 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED', // 保持大写枚举
        createdById: session.createdById,
        primaryAgentId: session.primaryAgentId,
        configuration: session.configuration,
        isPublic: session.isPublic,
        isTemplate: session.isTemplate,
        messageCount: session.messageCount,
        totalCost: Number(session.totalCost),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        participants: participants,
        isPinned: false, // 默认值，后续可从数据库添加
        isArchived: session.status === 'ARCHIVED'
    }
}

/**
 * 格式化时间显示
 * 
 * @param date - 要格式化的日期
 * @returns 相对时间字符串
 */
export function formatTimeAgo(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
        return `${days}天前`
    } else if (hours > 0) {
        return `${hours}小时前`
    } else if (minutes > 0) {
        return `${minutes}分钟前`
    } else {
        return '刚刚'
    }
}

/**
 * 验证会话类型是否有效
 * 
 * @param type - 要验证的会话类型
 * @returns 是否为有效的会话类型
 */
export function isValidSessionType(type: string): type is 'DIRECT' | 'GROUP' | 'WORKFLOW' {
    return ['DIRECT', 'GROUP', 'WORKFLOW'].includes(type)
}

/**
 * 验证会话状态是否有效
 * 
 * @param status - 要验证的会话状态
 * @returns 是否为有效的会话状态
 */
export function isValidSessionStatus(status: string): status is 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' {
    return ['ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'].includes(status)
} 