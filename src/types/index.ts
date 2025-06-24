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

// AI 角色类型
export interface AIAgent {
    id: string
    name: string
    avatar: string
    description: string
    specialty: string
}

// @提及项类型
export interface MentionItem {
    id: string
    name: string
    avatar: string
    type: 'agent' | 'user'
} 