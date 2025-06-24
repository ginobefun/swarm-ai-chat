import { ChatSection, Message, MentionItem } from '../types'

// 模拟聊天分组数据
export const mockChatSections: ChatSection[] = [
    {
        title: '置顶对话',
        icon: '📌',
        chats: [
            {
                id: 'chat-1',
                name: '产品需求文档',
                preview: '@需求分析师：我已经完成了初步分析...',
                avatar: '📑',
                avatarType: 'group',
                timestamp: '刚刚',
                unreadCount: 3,
                isActive: true,
                isPinned: true
            }
        ]
    },
    {
        title: '最近对话',
        icon: '💬',
        chats: [
            {
                id: 'chat-2',
                name: '@数据分析师',
                preview: '分析结果已生成，请查看工作区',
                avatar: '🤖',
                avatarType: 'ai',
                timestamp: '2 分钟前'
            },
            {
                id: 'chat-3',
                name: '市场调研小组',
                preview: '竞品分析报告已完成',
                avatar: '🎯',
                avatarType: 'group',
                timestamp: '1 小时前'
            },
            {
                id: 'chat-4',
                name: '旅行规划团队',
                preview: '日本 7 日游行程安排',
                avatar: '✈️',
                avatarType: 'group',
                timestamp: '昨天'
            }
        ]
    },
    {
        title: '我的 AI 角色',
        icon: '🤖',
        chats: [
            {
                id: 'agent-1',
                name: '数据分析师',
                preview: '擅长数据处理和可视化',
                avatar: '📊',
                avatarType: 'ai',
                timestamp: ''
            },
            {
                id: 'agent-2',
                name: '创意大师',
                preview: '激发创意灵感',
                avatar: '🎨',
                avatarType: 'ai',
                timestamp: ''
            },
            {
                id: 'agent-3',
                name: '批判思维者',
                preview: '逻辑分析和论证',
                avatar: '🔍',
                avatarType: 'ai',
                timestamp: ''
            }
        ]
    }
]

// 模拟消息数据
export const mockMessages: Message[] = [
    {
        id: 'msg-1',
        content: '请帮我分析一下 SwarmAI.chat 这个产品的核心价值和目标用户群体',
        sender: '我',
        senderType: 'user',
        timestamp: new Date(2024, 0, 1, 10, 23),
        avatar: '我'
    },
    {
        id: 'msg-2',
        content: `我来为您分析 SwarmAI.chat 的核心价值：

1. **多智能体协作**：将 AI 从单一对话升级为团队协作模式
2. **零学习成本**：采用熟悉的 IM 界面，用户即开即用
3. **结果导向**：不仅是对话，更是完整的工作交付

让我邀请用户研究员来详细分析目标用户群体...`,
        sender: '需求分析师',
        senderType: 'ai',
        timestamp: new Date(2024, 0, 1, 10, 24),
        avatar: '📋',
        avatarStyle: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        id: 'msg-3',
        content: `基于市场调研，我识别出四类核心用户群体：

**1. 知识工作者**（25-40 岁）
• 咨询顾问、分析师、产品经理
• 需求：快速处理信息、生成报告

**2. 内容创作者**（22-35 岁）
• 作家、营销人员、自媒体
• 需求：创意激发、内容润色

正在生成详细的用户画像...`,
        sender: '用户研究员',
        senderType: 'ai',
        timestamp: new Date(2024, 0, 1, 10, 25),
        avatar: '👥',
        avatarStyle: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
]

// 模拟@提及项数据
export const mockMentionItems: MentionItem[] = [
    {
        id: 'mention-1',
        name: '需求分析师',
        avatar: '📋',
        type: 'agent'
    },
    {
        id: 'mention-2',
        name: '用户研究员',
        avatar: '👥',
        type: 'agent'
    },
    {
        id: 'mention-3',
        name: '技术评估师',
        avatar: '⚙️',
        type: 'agent'
    },
    {
        id: 'mention-4',
        name: '数据分析师',
        avatar: '📊',
        type: 'agent'
    },
    {
        id: 'mention-5',
        name: '创意大师',
        avatar: '🎨',
        type: 'agent'
    },
    {
        id: 'mention-6',
        name: '批判思维者',
        avatar: '🔍',
        type: 'agent'
    }
]

// 模拟 AI 角色响应
export const aiAgentResponses = {
    '需求分析师': {
        avatar: '📋',
        avatarStyle: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        responses: [
            '让我来分析这个需求的可行性和优先级...',
            '根据市场调研，我建议...',
            '这个功能需要考虑以下技术约束...'
        ]
    },
    '用户研究员': {
        avatar: '👥',
        avatarStyle: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        responses: [
            '基于用户访谈，我发现...',
            '让我分析用户行为模式...',
            '这个设计可能影响用户体验...'
        ]
    },
    '技术评估师': {
        avatar: '⚙️',
        avatarStyle: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        responses: [
            '从技术角度来看...',
            '实现这个功能需要考虑...',
            '我建议采用以下技术方案...'
        ]
    },
    '数据分析师': {
        avatar: '📊',
        avatarStyle: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
        responses: [
            '数据显示...',
            '让我生成相关分析报告...',
            '基于数据趋势，我的建议是...'
        ]
    }
} 