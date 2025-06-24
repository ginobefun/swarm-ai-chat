'use client'

import React, { useState, useCallback } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import ChatArea from '../components/ChatArea'
import Workspace from '../components/Workspace'
import AgentDiscovery from '../components/AgentDiscovery'
import { Message } from '../types'
import { mockChatSections, mockMessages, mockMentionItems, aiAgentResponses } from '../data/mockData'
import { useTranslation } from '../contexts/AppContext'

export default function Home() {
    const { t } = useTranslation()

    const [activeChatId, setActiveChatId] = useState('chat-1')
    const [messages, setMessages] = useState<Message[]>(mockMessages)
    const [isWorkspaceVisible, setIsWorkspaceVisible] = useState(true)
    const [isTyping, setIsTyping] = useState(false)
    const [typingUser, setTypingUser] = useState('')
    const [showAgentDiscovery, setShowAgentDiscovery] = useState(false)

    // 处理聊天选择
    const handleChatSelect = useCallback((chatId: string) => {
        setActiveChatId(chatId)
        // 这里可以加载对应聊天的消息
    }, [])

    // 处理发送消息
    const handleSendMessage = useCallback((messageContent: string) => {
        // 添加用户消息
        const userMessage: Message = {
            id: `msg-${Date.now()}`,
            content: messageContent,
            sender: '我',
            senderType: 'user',
            timestamp: new Date(),
            avatar: '我'
        }

        setMessages(prev => [...prev, userMessage])

        // 检查是否提及了 AI 角色
        const mentionedAgents = mockMentionItems.filter(item =>
            messageContent.includes(`@${item.name}`)
        )

        if (mentionedAgents.length > 0) {
            // 模拟 AI 响应
            const agent = mentionedAgents[0]
            setIsTyping(true)
            setTypingUser(agent.name)

            setTimeout(() => {
                const agentResponse = aiAgentResponses[agent.name as keyof typeof aiAgentResponses]
                const response = agentResponse?.responses[
                    Math.floor(Math.random() * agentResponse.responses.length)
                ] || t('messages.processing')

                const aiMessage: Message = {
                    id: `msg-${Date.now()}-ai`,
                    content: response,
                    sender: agent.name,
                    senderType: 'ai',
                    timestamp: new Date(),
                    avatar: agent.avatar,
                    avatarStyle: agentResponse?.avatarStyle
                }

                setMessages(prev => [...prev, aiMessage])
                setIsTyping(false)
                setTypingUser('')
            }, 2000)
        } else {
            // 没有提及特定 AI 角色，随机选择一个响应
            const randomAgent = mockMentionItems[Math.floor(Math.random() * mockMentionItems.length)]
            setIsTyping(true)
            setTypingUser(randomAgent.name)

            setTimeout(() => {
                const agentResponse = aiAgentResponses[randomAgent.name as keyof typeof aiAgentResponses]
                if (agentResponse) {
                    const response = agentResponse.responses[
                        Math.floor(Math.random() * agentResponse.responses.length)
                    ]

                    const aiMessage: Message = {
                        id: `msg-${Date.now()}-ai`,
                        content: response,
                        sender: randomAgent.name,
                        senderType: 'ai',
                        timestamp: new Date(),
                        avatar: randomAgent.avatar,
                        avatarStyle: agentResponse.avatarStyle
                    }

                    setMessages(prev => [...prev, aiMessage])
                }
                setIsTyping(false)
                setTypingUser('')
            }, 2000)
        }
    }, [t])

    // 切换工作区显示
    const handleToggleWorkspace = useCallback(() => {
        setIsWorkspaceVisible(prev => !prev)
    }, [])

    // 获取当前聊天信息
    const getCurrentChat = () => {
        for (const section of mockChatSections) {
            const chat = section.chats.find(c => c.id === activeChatId)
            if (chat) return chat
        }
        return null
    }

    const currentChat = getCurrentChat()

    // 处理导航栏操作
    const handleMenuClick = () => {
        console.log('打开菜单')
    }

    const handleCreateNew = () => {
        console.log('创建新对话')
    }

    const handleNotificationClick = () => {
        console.log('打开通知')
    }

    const handleUserClick = () => {
        console.log('打开用户菜单')
    }

    const handleAgentDiscovery = () => {
        setShowAgentDiscovery(true)
    }

    const handleStartChatWithAgent = (agentId: string) => {
        // 创建新的聊天会话或切换到已存在的会话
        console.log('开始与 AI 角色对话：', agentId)
        setShowAgentDiscovery(false)
        // 这里可以添加创建新聊天的逻辑
    }

    const handleAddMember = () => {
        console.log('添加成员')
    }

    const handleOpenSettings = () => {
        console.log('打开设置')
    }

    return (
        <div>
            <Navbar
                onMenuClick={handleMenuClick}
                onCreateNew={handleCreateNew}
                onNotificationClick={handleNotificationClick}
                onUserClick={handleUserClick}
                onAgentDiscovery={handleAgentDiscovery}
            />

            <div className="main-container">
                <Sidebar
                    chatSections={mockChatSections}
                    onChatSelect={handleChatSelect}
                    activeChatId={activeChatId}
                    onStartChat={handleStartChatWithAgent}
                />

                <ChatArea
                    chatTitle={currentChat?.name || '产品需求文档'}
                    chatMembers={t('chat.members')}
                    messages={messages}
                    mentionItems={mockMentionItems}
                    isTyping={isTyping}
                    typingUser={typingUser}
                    onSendMessage={handleSendMessage}
                    onAddMember={handleAddMember}
                    onOpenSettings={handleOpenSettings}
                    onToggleWorkspace={handleToggleWorkspace}
                />

                <Workspace
                    isVisible={isWorkspaceVisible}
                    onClose={() => setIsWorkspaceVisible(false)}
                />
            </div>

            {/* 角色发现页面 */}
            {showAgentDiscovery && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--background)',
                    zIndex: 999,
                    overflow: 'auto'
                }}>
                    <div style={{
                        position: 'sticky',
                        top: 0,
                        zIndex: 1000,
                        background: 'var(--background)',
                        borderBottom: '1px solid var(--border-color)',
                        padding: '16px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                            AI 角色发现
                        </h1>
                        <button
                            onClick={() => setShowAgentDiscovery(false)}
                            style={{
                                background: 'none',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '8px 16px',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)'
                            }}
                        >
                            关闭
                        </button>
                    </div>
                    <AgentDiscovery onStartChat={handleStartChatWithAgent} />
                </div>
            )}
        </div>
    )
} 