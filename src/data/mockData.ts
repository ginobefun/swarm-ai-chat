import { ChatSection, Message, MentionItem } from '../types'
import { mentionItems, agentChatItems, aiAgentResponses } from './agentsData'

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
        chats: agentChatItems.slice(0, 6) // 显示前 6 个角色
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

// 导出提及项数据（从 agentsData 获取）
export const mockMentionItems: MentionItem[] = mentionItems

// 导出 AI 角色响应数据（从 agentsData 获取）
export { aiAgentResponses } 