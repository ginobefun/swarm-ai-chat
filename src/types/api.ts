/* eslint-disable @typescript-eslint/no-explicit-any */
// API 层类型定义 - 处理前端、服务端、数据库字段差异
import {
    Session as PrismaSession,
    SessionType,
    SessionStatus,
    ParticipantRole,
    SenderType,
    ContentType,
    MessageStatus
} from '@prisma/client'

// ============================================================================
// API 响应类型 - 基于数据库类型扩展
// ============================================================================

export interface SessionResponse extends Omit<PrismaSession, 'configuration' | 'totalCost'> {
    // API 层计算字段
    participantCount: number
    lastActivityAt: Date

    // 简化的配置字段
    settings: {
        isPublic: boolean
        allowInvites: boolean
        maxParticipants: number
    }

    // 格式化的成本字段
    cost: {
        total: number
        currency: string
        formatted: string
    }
}

export interface MessageResponse {
    id: string
    sessionId: string
    senderType: SenderType
    senderId: string
    content: string
    contentType: ContentType
    status: MessageStatus
    createdAt: Date

    // API 层扩展字段
    senderName: string
    senderAvatar?: string
    isEdited: boolean
    reactions: {
        emoji: string
        count: number
        userReacted: boolean
    }[]
}

export interface ParticipantResponse {
    id: string
    sessionId: string
    userId?: string
    agentId?: string
    role: ParticipantRole
    isActive: boolean
    joinedAt: Date

    // API 层扩展字段
    name: string
    avatar?: string
    type: 'user' | 'agent'
    lastSeenAt?: Date
}

// ============================================================================
// API 请求类型
// ============================================================================

export interface CreateSessionRequest {
    title?: string
    type?: SessionType
    description?: string
    agentIds?: string[]
    settings?: {
        isPublic?: boolean
        allowInvites?: boolean
        maxParticipants?: number
    }
}

export interface UpdateSessionRequest {
    title?: string
    description?: string
    status?: SessionStatus
    settings?: {
        isPublic?: boolean
        allowInvites?: boolean
        maxParticipants?: number
    }
}

export interface SendMessageRequest {
    content: string
    contentType?: ContentType
    replyToId?: string
    mentions?: string[]
}

export interface UpdateMessageRequest {
    content: string
    contentType?: ContentType
}

// ============================================================================
// 分页和过滤类型
// ============================================================================

export interface PaginationParams {
    page?: number
    limit?: number
    cursor?: string
}

export interface SessionsQuery extends PaginationParams {
    type?: SessionType
    status?: SessionStatus
    search?: string
    agentId?: string
    userId?: string
    sortBy?: 'createdAt' | 'updatedAt' | 'messageCount'
    sortOrder?: 'asc' | 'desc'
}

export interface MessagesQuery extends PaginationParams {
    sessionId: string
    before?: Date
    after?: Date
    senderType?: SenderType
    contentType?: ContentType
}

// ============================================================================
// API 响应包装类型
// ============================================================================

export interface ApiResponse<T> {
    data: T
    success: boolean
    message?: string
    timestamp: Date
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
        cursor?: string
    }
    success: boolean
    message?: string
    timestamp: Date
}

// ============================================================================
// 错误类型
// ============================================================================

export interface ApiError {
    code: string
    message: string
    details?: Record<string, any>
    timestamp: Date
}

export interface ValidationError extends ApiError {
    code: 'VALIDATION_ERROR'
    details: {
        field: string
        message: string
    }[]
}

// ============================================================================
// 实时事件类型
// ============================================================================

export interface SessionEvent {
    type: 'session_created' | 'session_updated' | 'session_deleted'
    sessionId: string
    data: SessionResponse
    timestamp: Date
}

export interface MessageEvent {
    type: 'message_sent' | 'message_updated' | 'message_deleted'
    sessionId: string
    messageId: string
    data: MessageResponse
    timestamp: Date
}

export interface ParticipantEvent {
    type: 'participant_joined' | 'participant_left' | 'participant_updated'
    sessionId: string
    participantId: string
    data: ParticipantResponse
    timestamp: Date
}

export type WebSocketEvent = SessionEvent | MessageEvent | ParticipantEvent

// ============================================================================
// 类型守卫
// ============================================================================

export const isSessionEvent = (event: WebSocketEvent): event is SessionEvent => {
    return event.type.startsWith('session_')
}

export const isMessageEvent = (event: WebSocketEvent): event is MessageEvent => {
    return event.type.startsWith('message_')
}

export const isParticipantEvent = (event: WebSocketEvent): event is ParticipantEvent => {
    return event.type.startsWith('participant_')
} 