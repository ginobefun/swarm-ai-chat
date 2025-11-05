/* eslint-disable @typescript-eslint/no-explicit-any */
// 直接导入和复用 Prisma 生成的枚举类型
import {
    SwarmSessionType,
    SwarmSessionStatus,
    SwarmParticipantRole,
    SwarmSenderType,
    SwarmContentType,
    SwarmMessageStatus,
    SwarmSkillCategory,
    SwarmRole,
    SubscriptionStatus
} from '@prisma/client'

// 导出枚举供前端使用 - 直接复用 Prisma 枚举
export {
    SwarmSessionType as SessionType,
    SwarmSessionStatus as SessionStatus,
    SwarmParticipantRole as ParticipantRole,
    SwarmSenderType as SenderType,
    SwarmContentType as ContentType,
    SwarmMessageStatus as MessageStatus,
    SwarmSkillCategory as SkillCategory,
    SwarmRole as Role,
    SubscriptionStatus
}

// 导出类型（注意：Prisma 生成的枚举值实际上是映射后的小写值）
export type SessionTypeValue = SwarmSessionType // 实际值：'direct' | 'group' | 'workflow'
export type SessionStatusValue = SwarmSessionStatus // 实际值：'active' | 'paused' | 'completed' | 'archived'
export type ParticipantRoleValue = SwarmParticipantRole // 实际值：'owner' | 'admin' | 'participant' | 'observer'
export type SenderTypeValue = SwarmSenderType // 实际值：'user' | 'agent' | 'system'
export type ContentTypeValue = SwarmContentType // 实际值：'text' | 'file' | 'image' | 'code' | 'system'
export type MessageStatusValue = SwarmMessageStatus // 实际值：'sending' | 'sent' | 'delivered' | 'read' | 'failed'

// 消息类型
export interface Message {
    id: string
    content: string
    sender: string
    senderType: 'user' | 'ai'
    timestamp: Date
    avatar?: string
    avatarStyle?: string
    hasArtifacts?: boolean
    artifactCount?: number
}

// Artifact类型
export interface Artifact {
    id: string
    messageId: string
    sessionId: string
    type: 'DOCUMENT' | 'CODE' | 'MARKDOWN' | 'HTML' | 'SVG' | 'CHART' | 'IMAGE' | 'MERMAID' | 'REACT'
    title: string
    content: string
    language?: string | null
    metadata?: Record<string, any>
    version?: number
    isPinned?: boolean
    isPublished?: boolean
    createdAt?: Date
    updatedAt?: Date
}

// 会话参与者类型
export interface SessionParticipant {
    id: string
    type: 'user' | 'agent'
    name: string
    avatar: string
    avatarStyle?: string
}

// 会话配置类型
export interface SessionConfiguration {
    orchestrationMode?: 'DYNAMIC' | 'SEQUENTIAL' | 'PARALLEL'
    [key: string]: any
}

// 会话类型 (统一与数据库模型一致，使用大写枚举)
export interface Session {
    id: string
    title?: string | null
    description?: string | null
    type: 'DIRECT' | 'GROUP' | 'WORKFLOW'
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
    createdById: string
    primaryAgentId?: string | null
    configuration?: SessionConfiguration
    isPublic?: boolean
    isTemplate?: boolean
    messageCount: number
    totalCost?: number
    createdAt: Date
    updatedAt: Date
    // 客户端扩展字段
    participants: SessionParticipant[]
    lastMessage?: {
        content: string
        sender: string
        timestamp: Date
    }
    isPinned?: boolean
    isArchived?: boolean
}

// 会话过滤选项
export interface SessionFilter {
    type?: 'all' | 'DIRECT' | 'GROUP' | 'WORKFLOW'
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
    pinned?: boolean
    agentId?: string
    searchQuery?: string
}

// 会话分组
export interface SessionGroup {
    title: string
    icon: string
    sessions: Session[]
    count: number
}

// 会话操作类型
export type SessionAction = 'rename' | 'pin' | 'unpin' | 'archive' | 'delete' | 'duplicate' | 'export'

// 工作区模块类型
export interface WorkspaceModule {
    id: string
    title: string
    icon: string
    content: React.ReactNode
    isPinned?: boolean
    isExpandable?: boolean
}

// 角色能力标签类型
export interface SkillTag {
    id: string
    name: string
    category: 'core' | 'tool' | 'domain'
    color: string
}

// 使用示例类型
export interface UsageExample {
    id: string
    title: string
    prompt: string
    description: string
}

// 工具绑定类型
export interface Tool {
    id: string
    name: string
    icon: string
    description: string
    category: string
}

// AI 角色类型 (扩展版)
export interface AIAgent {
    id: string
    name: string
    avatar: string
    avatarStyle?: string
    description: string
    specialty: string
    personality: string
    skillTags?: SkillTag[]
    tools?: Tool[]
    usageExamples?: UsageExample[]
    conversationStarters?: UsageExample[]
    modelPreference?: string
    systemPrompt: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

// @提及项类型
export interface MentionItem {
    id: string
    name: string
    avatar: string
    type: 'agent' | 'user'
}

// 正在输入的智能体类型
export interface TypingAgent {
    id: string
    name: string
    avatar: string
    avatarStyle?: string
}

// 角色详情页 Props 类型
export interface AgentDetailProps {
    agent: AIAgent
    isOpen: boolean
    onClose: () => void
    onStartChat?: (agentId: string) => void
}

// 创建会话请求类型
export interface CreateSessionRequest {
    title?: string
    type?: 'DIRECT' | 'GROUP' | 'WORKFLOW'
    description?: string
    createdById?: string
    primaryAgentId?: string
    agentIds?: string[]
}

// 更新会话请求类型
export interface UpdateSessionRequest {
    title?: string
    description?: string
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED'
    isPinned?: boolean
    isArchived?: boolean
}

// 会话上下文菜单 Props
export interface SessionContextMenuProps {
    session: Session
    isOpen: boolean
    position: { x: number; y: number }
    onClose: () => void
    onAction: (action: SessionAction) => void
}

// 创建会话对话框 Props
export interface CreateSessionDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreateSession: (request: CreateSessionRequest) => void
    availableAgents: AIAgent[]
}

// 确认对话框 Props
export interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    onCancel: () => void
    isDanger?: boolean
    isLoading?: boolean
}

// 内联重命名输入框 Props
export interface InlineRenameInputProps {
    isOpen: boolean
    currentName: string
    onSave: (newName: string) => void
    onCancel: () => void
    maxLength?: number
} 