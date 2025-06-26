/* eslint-disable @typescript-eslint/no-explicit-any */
// API 层类型定义 - 处理前端、服务端、数据库字段差异
import {
    SwarmChatSession as PrismaSession,
    SwarmSessionType as SessionType,
    SwarmSessionStatus as SessionStatus,
    SwarmParticipantRole as ParticipantRole,
    SwarmSenderType as SenderType,
    SwarmContentType as ContentType,
    SwarmMessageStatus as MessageStatus
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

// ============================================================================
// API 响应基础类型 (移除重复定义，使用上面的统一版本)
// ============================================================================

// ============================================================================
// 认证相关类型
// ============================================================================
export interface AuthUser {
    id: string
    email: string
    name?: string
    image?: string
    username?: string
    role?: 'ADMIN' | 'USER' | 'ENTERPRISE'
    subscriptionStatus?: 'FREE' | 'PRO' | 'ENTERPRISE'
}

export interface LoginRequest {
    email: string
    password: string
}

export interface SignupRequest {
    email: string
    password: string
    name?: string
    username?: string
}

export interface AuthResponse {
    user: AuthUser
    token?: string
}

// ============================================================================
// Swarm 业务模型类型 (基于 Prisma 模型)
// ============================================================================

// SwarmUser 扩展信息
export interface SwarmUserProfile {
    id: string
    userId: string
    username?: string
    avatarUrl?: string
    role: 'ADMIN' | 'USER' | 'ENTERPRISE'
    subscriptionStatus: 'FREE' | 'PRO' | 'ENTERPRISE'
    preferences: Record<string, any>
    createdAt: string
    updatedAt: string
}

// SwarmAIAgent 智能体
export interface SwarmAgent {
    id: string
    name: string
    avatar?: string
    avatarStyle?: string
    description?: string
    specialty?: string
    personality?: string
    modelPreference: string
    systemPrompt?: string
    tags: string[]
    capabilityLevel: number
    averageResponseTime: number
    costPerMessage: number
    isActive: boolean
    isPublic: boolean
    isFeatured: boolean
    createdById?: string
    version: string
    usageCount: number
    rating: number
    createdAt: string
    updatedAt: string

    // 关联数据
    createdBy?: SwarmUserProfile
    agentSkills?: SwarmAgentSkill[]
    agentTools?: SwarmAgentTool[]
    usageExamples?: SwarmAgentUsageExample[]
}

// SwarmSkillTag 技能标签
export interface SwarmSkill {
    id: string
    name: string
    category: 'CORE' | 'TOOL' | 'DOMAIN'
    color: string
    description?: string
    isActive: boolean
    sortOrder: number
    createdAt: string
    updatedAt: string
}

// SwarmTool 工具
export interface SwarmTool {
    id: string
    name: string
    icon?: string
    description?: string
    category: string
    version: string
    apiEndpoint?: string
    configurationSchema: Record<string, any>
    defaultConfig: Record<string, any>
    isActive: boolean
    requiresAuth: boolean
    costPerUse: number
    rateLimit: number
    createdAt: string
    updatedAt: string
}

// SwarmAIAgentSkill 智能体技能关联
export interface SwarmAgentSkill {
    id: string
    agentId: string
    skillId: string
    isPrimary: boolean
    proficiencyLevel: number
    createdAt: string

    // 关联数据
    agent?: SwarmAgent
    skill?: SwarmSkill
}

// SwarmAIAgentTool 智能体工具关联
export interface SwarmAgentTool {
    id: string
    agentId: string
    toolId: string
    isPrimary: boolean
    customConfig: Record<string, any>
    isEnabled: boolean
    createdAt: string

    // 关联数据
    agent?: SwarmAgent
    tool?: SwarmTool
}

// SwarmAIAgentUsageExample 智能体使用示例
export interface SwarmAgentUsageExample {
    id: string
    agentId: string
    title: string
    prompt: string
    description?: string
    category: string
    difficultyLevel: number
    expectedOutput?: string
    successRate: number
    orderIndex: number
    createdAt: string

    // 关联数据
    agent?: SwarmAgent
}

// SwarmChatSession 对话会话
export interface SwarmChatSession {
    id: string
    title?: string
    description?: string
    type: 'DIRECT' | 'GROUP' | 'WORKFLOW'
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
    createdById: string
    primaryAgentId?: string
    configuration: Record<string, any>
    isPublic: boolean
    isTemplate: boolean
    messageCount: number
    totalCost: number
    createdAt: string
    updatedAt: string

    // 关联数据
    createdBy?: SwarmUserProfile
    primaryAgent?: SwarmAgent
    participants?: SwarmChatSessionParticipant[]
    messages?: SwarmChatMessage[]
}

// SwarmChatSessionParticipant 对话参与者
export interface SwarmChatSessionParticipant {
    id: string
    sessionId: string
    userId?: string
    agentId?: string
    role: 'OWNER' | 'ADMIN' | 'PARTICIPANT' | 'OBSERVER'
    isActive: boolean
    joinedAt: string

    // 关联数据
    session?: SwarmChatSession
    user?: SwarmUserProfile
    agent?: SwarmAgent
}

// SwarmChatMessage 对话消息
export interface SwarmChatMessage {
    id: string
    sessionId: string
    senderType: 'USER' | 'AGENT' | 'SYSTEM'
    senderId: string
    replyToId?: string
    content: string
    contentType: 'TEXT' | 'FILE' | 'IMAGE' | 'CODE' | 'SYSTEM'
    status: 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
    metadata: Record<string, any>
    tokenCount: number
    processingTime: number
    confidenceScore?: number
    cost: number
    createdAt: string

    // 关联数据
    session?: SwarmChatSession
    replyTo?: SwarmChatMessage
    replies?: SwarmChatMessage[]
}

// ============================================================================
// API 请求和响应类型
// ============================================================================

// 智能体相关
export interface CreateAgentRequest {
    name: string
    avatar?: string
    description?: string
    specialty?: string
    personality?: string
    systemPrompt?: string
    tags?: string[]
    skills?: string[]
    tools?: string[]
}

export interface UpdateAgentRequest extends Partial<CreateAgentRequest> {
    isActive?: boolean
    isPublic?: boolean
}

export interface AgentListResponse extends PaginatedResponse<SwarmAgent> {
    // 扩展智能体列表响应
    filters?: {
        category?: string
        tags?: string[]
        isActive?: boolean
        isFeatured?: boolean
    }
}

// 会话相关
export interface CreateSessionRequest {
    title?: string
    description?: string
    type?: 'DIRECT' | 'GROUP' | 'WORKFLOW'
    primaryAgentId?: string
    configuration?: Record<string, any>
    isPublic?: boolean
}

export interface UpdateSessionRequest {
    title?: string
    description?: string
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
}

export interface SessionListResponse extends PaginatedResponse<SwarmChatSession> {
    // 扩展会话列表响应
    stats?: {
        total: number
        active: number
        completed: number
        archived: number
    }
}

// 消息相关 (使用前面已定义的版本)

export interface MessageListResponse extends PaginatedResponse<SwarmChatMessage> {
    // 扩展消息列表响应
    hasMore?: boolean
    nextCursor?: string
}

// 搜索相关
export interface SearchRequest {
    query: string
    type?: 'agents' | 'sessions' | 'all'
    filters?: {
        category?: string
        tags?: string[]
        isActive?: boolean
        isPublic?: boolean
    }
    pagination?: {
        page?: number
        pageSize?: number
    }
}

export interface SearchResponse {
    agents?: SwarmAgent[]
    sessions?: SwarmChatSession[]
    total: {
        agents: number
        sessions: number
    }
}

// ============================================================================
// 实用工具类型
// ============================================================================
export type SwarmModelType =
    | 'SwarmUser'
    | 'SwarmAIAgent'
    | 'SwarmSkillTag'
    | 'SwarmTool'
    | 'SwarmChatSession'
    | 'SwarmChatMessage'

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface ApiRequestConfig {
    method: ApiMethod
    url: string
    data?: any
    params?: Record<string, any>
    headers?: Record<string, string>
}

// ============================================================================
// 兼容性类型（用于平滑迁移）
// ============================================================================

// 会话兼容类型
export interface Session {
    id: string
    title?: string
    description?: string
    type: 'direct' | 'group' | 'workflow'
    status: 'active' | 'paused' | 'completed' | 'archived'
    createdBy: string
    primaryAgentId?: string
    configuration: Record<string, any>
    isPublic: boolean
    isTemplate: boolean
    messageCount: number
    totalCost: number
    createdAt: Date
    updatedAt: Date
}

// 消息兼容类型
export interface Message {
    id: string
    sessionId: string
    senderType: 'user' | 'agent' | 'system'
    senderId: string
    content: string
    contentType: 'text' | 'file' | 'image' | 'code' | 'system'
    status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
    metadata: Record<string, any>
    tokenCount: number
    processingTime: number
    cost: number
    createdAt: Date
} 