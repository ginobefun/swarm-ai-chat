'use client'

import React, { useEffect, useRef } from 'react'
import { Message } from '../types'

interface MessageListProps {
    messages: Message[]
    isTyping?: boolean
    typingUser?: string
    typingAvatar?: string
}

const TypingIndicator: React.FC<{
    user: string
    avatar: string
    avatarStyle?: string
}> = ({ user, avatar, avatarStyle }) => {
    return (
        <div className="message">
            <div
                className="message-avatar"
                style={avatarStyle ? { background: avatarStyle } : undefined}
            >
                {avatar}
            </div>
            <div className="message-content">
                <div className="message-name">{user}</div>
                <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                </div>
            </div>
        </div>
    )
}

const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const renderMessageContent = (content: string) => {
        // 处理换行和基本格式
        return content.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < content.split('\n').length - 1 && <br />}
            </React.Fragment>
        ))
    }

    return (
        <div className={`message ${message.senderType}`}>
            <div
                className="message-avatar"
                style={message.avatarStyle ? { background: message.avatarStyle } : undefined}
            >
                {message.avatar || (message.senderType === 'user' ? '我' : '🤖')}
            </div>
            <div className="message-content">
                <div className="message-name">{message.sender}</div>
                <div className="message-bubble">
                    {renderMessageContent(message.content)}
                </div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
            </div>
        </div>
    )
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    isTyping = false,
    typingUser = "AI 助手",
    typingAvatar = "🤖"
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // 自动滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    return (
        <div className="messages-container">
            {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
            ))}

            {isTyping && (
                <TypingIndicator
                    user={typingUser}
                    avatar={typingAvatar}
                    avatarStyle="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                />
            )}

            <div ref={messagesEndRef} />
        </div>
    )
}

export default MessageList 