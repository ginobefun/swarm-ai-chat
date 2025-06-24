'use client'

import React, { useState } from 'react'
import { ChatSection, ChatItem } from '../types'

interface SidebarProps {
    chatSections: ChatSection[]
    onChatSelect: (chatId: string) => void
    activeChatId?: string
}

const ChatItemComponent: React.FC<{
    chat: ChatItem
    onSelect: (chatId: string) => void
    isActive: boolean
}> = ({ chat, onSelect, isActive }) => {
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

    return (
        <div
            className={`chat-item ${isActive ? 'active' : ''}`}
            onClick={() => onSelect(chat.id)}
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
            </div>
        </div>
    )
}

const Sidebar: React.FC<SidebarProps> = ({
    chatSections,
    onChatSelect,
    activeChatId
}) => {
    const [searchValue, setSearchValue] = useState('')

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    const filteredSections = chatSections.map(section => ({
        ...section,
        chats: section.chats.filter(chat =>
            chat.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            chat.preview.toLowerCase().includes(searchValue.toLowerCase())
        )
    })).filter(section => section.chats.length > 0)

    return (
        <aside className="sidebar">
            <div className="sidebar-search">
                <input
                    type="text"
                    placeholder="搜索对话..."
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
                            />
                        ))}
                    </div>
                ))}
            </div>
        </aside>
    )
}

export default Sidebar 