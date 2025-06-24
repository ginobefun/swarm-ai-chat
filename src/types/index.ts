// 消息类型
export interface Message {
    id: string
    content: string
    sender: string
    senderType: 'user' | 'ai'
    timestamp: Date
    avatar?: string
    avatarStyle?: string
}

// 会话参与者类型
export interface SessionParticipant {
    id: string
    type: 'user' | 'agent'
    name: string
    avatar: string
    avatarStyle?: string
}

// 会话类型
export interface Session {
    id: string
    title: string
    type: 'single' | 'group'
    description?: string
    participants: SessionParticipant[]
    lastMessage?: {
        content: string
        sender: string
        timestamp: Date
    }
    messageCount: number
    isPinned: boolean
    isArchived: boolean
    createdBy: string
    createdAt: Date
    updatedAt: Date
}

// 会话过滤选项
export interface SessionFilter {
    type?: 'all' | 'single' | 'group'
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
export type SessionAction = 'rename' | 'pin' | 'unpin' | 'archive' | 'delete' | 'duplicate'

// 聊天项类型
export interface ChatItem {
    id: string
    name: string
    preview: string
    avatar: string
    avatarType: 'user' | 'group' | 'ai'
    timestamp: string
    unreadCount?: number
    isActive?: boolean
    isPinned?: boolean
}

// 聊天分组类型
export interface ChatSection {
    title: string
    icon: string
    chats: ChatItem[]
}

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
    type: 'single' | 'group'
    agentIds: string[]
    description?: string
}

// 更新会话请求类型
export interface UpdateSessionRequest {
    title?: string
    description?: string
    isPinned?: boolean
    isArchived?: boolean
}

// 会话上下文菜单Props
export interface SessionContextMenuProps {
    session: Session
    isOpen: boolean
    position: { x: number; y: number }
    onClose: () => void
    onAction: (action: SessionAction) => void
}

// 创建会话对话框Props
export interface CreateSessionDialogProps {
    isOpen: boolean
    onClose: () => void
    onCreateSession: (request: CreateSessionRequest) => void
    availableAgents: AIAgent[]
} 