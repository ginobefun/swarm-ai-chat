'use client'

import React, { useState, useEffect } from 'react'
import { ChatSection, ChatItem, AIAgent } from '../types'
import { useTranslation } from '../contexts/AppContext'
import AgentDetail from './AgentDetail'

interface SidebarProps {
    chatSections: ChatSection[]
    onChatSelect: (chatId: string) => void
    activeChatId?: string
    onStartChat?: (agentId: string) => void
}

const ChatItemComponent: React.FC<{
    chat: ChatItem
    onSelect: (chatId: string) => void
    isActive: boolean
    onAgentDetail?: (agentId: string) => void
}> = ({ chat, onSelect, isActive, onAgentDetail }) => {
    const getAvatarClass = () => {
        switch (chat.avatarType) {
            case 'group':
                return 'chat-avatar group'
            case 'ai':
                return 'chat-avatar ai'
            default:
                return 'chat-avatar'
        }
    }

    const handleClick = () => {
        onSelect(chat.id)
    }

    const handleAgentDetail = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (chat.avatarType === 'ai' && onAgentDetail) {
            onAgentDetail(chat.id)
        }
    }

    return (
        <div
            className={`chat-item ${isActive ? 'active' : ''}`}
            onClick={handleClick}
        >
            <div className={getAvatarClass()}>
                {chat.avatar}
            </div>
            <div className="chat-info">
                <div className="chat-name">{chat.name}</div>
                <div className="chat-preview">{chat.preview}</div>
            </div>
            <div className="chat-meta">
                <div className="chat-time">{chat.timestamp}</div>
                {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="unread-badge">{chat.unreadCount}</div>
                )}
                {chat.avatarType === 'ai' && (
                    <button
                        className="agent-detail-btn"
                        onClick={handleAgentDetail}
                        title="查看角色详情"
                    >
                        ℹ️
                    </button>
                )}
            </div>
        </div>
    )
}

const Sidebar: React.FC<SidebarProps> = ({
    chatSections,
    onChatSelect,
    activeChatId,
    onStartChat
}) => {
    const { t } = useTranslation()
    const [searchValue, setSearchValue] = useState('')
    const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [agents, setAgents] = useState<AIAgent[]>([])

    // 从 API 获取 AI 角色数据
    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await fetch('/api/agents')
                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setAgents(data.agents || [])
                    }
                }
            } catch (error) {
                console.error('获取 AI 角色数据失败:', error)
            }
        }

        fetchAgents()
    }, [])

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    const handleAgentDetail = (agentId: string) => {
        const agent = agents.find((a: AIAgent) => a.id === agentId)
        if (agent) {
            setSelectedAgent(agent)
            setIsDetailOpen(true)
        }
    }

    const handleCloseDetail = () => {
        setIsDetailOpen(false)
        setSelectedAgent(null)
    }

    const handleStartChat = (agentId: string) => {
        if (onStartChat) {
            onStartChat(agentId)
        }
    }

    const filteredSections = chatSections.map(section => ({
        ...section,
        chats: section.chats.filter(chat =>
            chat.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            chat.preview.toLowerCase().includes(searchValue.toLowerCase())
        )
    })).filter(section => section.chats.length > 0)

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-search">
                    <input
                        type="text"
                        placeholder={t('sidebar.searchPlaceholder')}
                        value={searchValue}
                        onChange={handleSearchChange}
                    />
                </div>

                <div className="chat-list">
                    {filteredSections.map((section, index) => (
                        <div key={index} className="chat-section">
                            <div className="section-title">
                                <span>{section.icon}</span>
                                <span>{section.title}</span>
                            </div>
                            {section.chats.map(chat => (
                                <ChatItemComponent
                                    key={chat.id}
                                    chat={chat}
                                    onSelect={onChatSelect}
                                    isActive={chat.id === activeChatId}
                                    onAgentDetail={handleAgentDetail}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </aside>

            {/* 角色详情弹窗 */}
            {selectedAgent && (
                <AgentDetail
                    agent={selectedAgent}
                    isOpen={isDetailOpen}
                    onClose={handleCloseDetail}
                    onStartChat={handleStartChat}
                />
            )}
        </>
    )
}

export default Sidebar 