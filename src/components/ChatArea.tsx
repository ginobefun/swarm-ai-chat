'use client'

import React from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Message, MentionItem } from '../types'

interface ChatAreaProps {
    chatTitle: string
    chatMembers: string
    messages: Message[]
    mentionItems: MentionItem[]
    isTyping?: boolean
    typingUser?: string
    onSendMessage: (message: string) => void
    onAddMember?: () => void
    onOpenSettings?: () => void
    onToggleWorkspace?: () => void
}

const ChatArea: React.FC<ChatAreaProps> = ({
    chatTitle,
    chatMembers,
    messages,
    mentionItems,
    isTyping = false,
    typingUser,
    onSendMessage,
    onAddMember,
    onOpenSettings,
    onToggleWorkspace
}) => {
    return (
        <main className="chat-area">
            {/* 对话头部 */}
            <div className="chat-header">
                <div>
                    <div className="chat-title">{chatTitle}</div>
                    <div className="chat-members">{chatMembers}</div>
                </div>
                <div className="chat-actions">
                    <button
                        className="nav-btn"
                        onClick={onAddMember}
                        title="添加成员"
                    >
                        ➕
                    </button>
                    <button
                        className="nav-btn"
                        onClick={onOpenSettings}
                        title="设置"
                    >
                        ⚙️
                    </button>
                    <button
                        className="nav-btn"
                        onClick={onToggleWorkspace}
                        title="工作区"
                    >
                        📊
                    </button>
                </div>
            </div>

            {/* 消息列表 */}
            <MessageList
                messages={messages}
                isTyping={isTyping}
                typingUser={typingUser}
            />

            {/* 输入区 */}
            <MessageInput
                onSendMessage={onSendMessage}
                mentionItems={mentionItems}
            />
        </main>
    )
}

export default ChatArea 