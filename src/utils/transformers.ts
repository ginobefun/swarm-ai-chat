/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// 转换层 - 处理不同层次之间的数据转换
import { formatTimeAgo, generateSessionTitle } from '@/utils'
import { SessionResponse, MessageResponse, ParticipantResponse } from '@/types/api'
import { Session, SessionParticipant, Message } from '@/types'

// ============================================================================
// API 层到前端层的转换
// ============================================================================

export const transformApiSessionToUI = (
    apiSession: SessionResponse,
    clientState: {
        isPinned?: boolean
        isArchived?: boolean
        isSelected?: boolean
        participants?: ParticipantResponse[]
        lastMessage?: MessageResponse
    } = {}
): Session => {
    // 转换参与者数据
    const participants: SessionParticipant[] = (clientState.participants || []).map(p => ({
        id: p.id,
        type: p.type,
        name: p.name,
        avatar: p.avatar || '',
        avatarStyle: undefined // 可以根据类型设置默认样式
    }))

    // 转换最后一条消息
    const lastMessage = clientState.lastMessage ? {
        content: clientState.lastMessage.content,
        sender: clientState.lastMessage.senderName,
        timestamp: clientState.lastMessage.createdAt
    } : undefined

    return {
        // 基础字段直接映射
        id: apiSession.id,
        title: apiSession.title,
        description: apiSession.description,
        type: apiSession.type.toLowerCase() as 'direct' | 'group' | 'workflow',
        status: apiSession.status.toLowerCase() as 'active' | 'paused' | 'completed' | 'archived',
        createdById: apiSession.createdById,
        primaryAgentId: apiSession.primaryAgentId,
        isPublic: apiSession.settings.isPublic,
        isTemplate: apiSession.isTemplate,
        messageCount: apiSession.messageCount,
        totalCost: apiSession.cost.total,
        createdAt: apiSession.createdAt,
        updatedAt: apiSession.updatedAt,

        // 前端状态字段
        isPinned: clientState.isPinned || false,
        isArchived: clientState.isArchived || false,

        // 关联数据
        participants,
        lastMessage,

        // 计算字段（可选：也可以在组件中计算）
        // displayTitle: apiSession.title || generateSessionTitle(participants),
        // timeAgo: formatTimeAgo(apiSession.updatedAt, (key: string) => key) // 简化版本
    }
}

export const transformApiMessageToUI = (
    apiMessage: MessageResponse
): Message => {
    return {
        id: apiMessage.id,
        content: apiMessage.content,
        sender: apiMessage.senderName,
        senderType: apiMessage.senderType === 'USER' ? 'user' : 'ai',
        timestamp: apiMessage.createdAt,
        avatar: apiMessage.senderAvatar,
        avatarStyle: undefined // 可以根据发送者类型设置
    }
}

export const transformApiParticipantToUI = (
    apiParticipant: ParticipantResponse
): SessionParticipant => {
    return {
        id: apiParticipant.id,
        type: apiParticipant.type,
        name: apiParticipant.name,
        avatar: apiParticipant.avatar || '',
        avatarStyle: undefined
    }
}

// ============================================================================
// 前端层到 API 层的转换
// ============================================================================

export const transformUISessionToAPI = (
    uiSession: Session
): Partial<SessionResponse> => {
    // 只返回 API 层需要的字段
    return {
        id: uiSession.id,
        title: uiSession.title,
        description: uiSession.description,
        // type: uiSession.type,
        // status: uiSession.status,
        // 注意：不包含前端特有的字段如 isPinned, isArchived
    }
}

// ============================================================================
// 批量转换函数
// ============================================================================

export const transformApiSessionsToUI = (
    apiSessions: SessionResponse[],
    clientStatesMap: Record<string, {
        isPinned?: boolean
        isArchived?: boolean
        participants?: ParticipantResponse[]
        lastMessage?: MessageResponse
    }> = {}
): Session[] => {
    return apiSessions.map(apiSession =>
        transformApiSessionToUI(apiSession, clientStatesMap[apiSession.id] || {})
    )
}

export const transformApiMessagesToUI = (
    apiMessages: MessageResponse[]
): Message[] => {
    return apiMessages.map(transformApiMessageToUI)
}

// ============================================================================
// 数据合并和更新函数
// ============================================================================

export const mergeSessionWithClientState = (
    existingSession: Session,
    updates: Partial<Session>
): Session => {
    return {
        ...existingSession,
        ...updates,
        // 确保某些字段不会被意外覆盖
        id: existingSession.id,
        createdAt: existingSession.createdAt,
        // 合并参与者数据而不是替换
        participants: updates.participants || existingSession.participants
    }
}

export const updateSessionInList = (
    sessions: Session[],
    sessionId: string,
    updates: Partial<Session>
): Session[] => {
    return sessions.map(session =>
        session.id === sessionId
            ? mergeSessionWithClientState(session, updates)
            : session
    )
}

// ============================================================================
// 数据验证和清理函数
// ============================================================================

export const sanitizeSessionForAPI = (session: Partial<Session>) => {
    return session
}

export const validateSessionData = (session: Partial<Session>): boolean => {
    // 基本验证逻辑
    if (!session.title || session.title.trim().length === 0) {
        return false
    }

    if (session.type && !['direct', 'group', 'workflow'].includes(session.type)) {
        return false
    }

    return true
}

// ============================================================================
// 缓存和状态管理辅助函数
// ============================================================================

export const createSessionCacheKey = (sessionId: string): string => {
    return `session:${sessionId}`
}

export const createSessionListCacheKey = (filters: {
    type?: string
    status?: string
    userId?: string
}): string => {
    const filterStr = Object.entries(filters)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${key}:${value}`)
        .join('|')

    return `sessions:${filterStr || 'all'}`
}

// ============================================================================
// 实时更新处理函数
// ============================================================================

export const applySessionUpdate = (
    currentSession: Session,
    updateEvent: {
        type: 'updated' | 'message_added' | 'participant_joined' | 'participant_left'
        data: any
    }
): Session => {
    switch (updateEvent.type) {
        case 'updated':
            return mergeSessionWithClientState(currentSession, updateEvent.data)

        case 'message_added':
            return {
                ...currentSession,
                messageCount: currentSession.messageCount + 1,
                lastMessage: {
                    content: updateEvent.data.content,
                    sender: updateEvent.data.senderName,
                    timestamp: updateEvent.data.createdAt
                },
                updatedAt: updateEvent.data.createdAt
            }

        case 'participant_joined':
            return {
                ...currentSession,
                participants: [
                    ...currentSession.participants,
                    transformApiParticipantToUI(updateEvent.data)
                ]
            }

        case 'participant_left':
            return {
                ...currentSession,
                participants: currentSession.participants.filter(
                    p => p.id !== updateEvent.data.participantId
                )
            }

        default:
            return currentSession
    }
} 