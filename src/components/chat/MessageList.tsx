'use client'

import React, { useEffect, useRef } from 'react'
import { Message } from '@/types'

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
        <div className="flex gap-3 animate-message-slide-in">
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 bg-gradient-to-br from-indigo-400 to-purple-500 text-white"
                style={avatarStyle ? { background: avatarStyle } : undefined}
            >
                {avatar}
            </div>
            <div className="flex flex-col gap-1 max-w-[70%] min-w-0">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 px-1">{user}</div>
                <div className="bg-gray-200 dark:bg-slate-700 rounded-2xl px-4 py-3 flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-typing"></div>
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
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
        return content.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                {index < content.split('\n').length - 1 && <br />}
            </React.Fragment>
        ))
    }

    const isUser = message.senderType === 'user'

    return (
        <div className={`flex gap-3 animate-message-slide-in ${isUser ? 'flex-row-reverse' : ''}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${isUser
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-br from-indigo-400 to-purple-500'
                    } text-white`}
                style={message.avatarStyle ? { background: message.avatarStyle } : undefined}
            >
                {message.avatar || (isUser ? '我' : '🤖')}
            </div>
            <div className={`flex flex-col gap-1 max-w-[70%] min-w-0 ${isUser ? 'items-end' : ''}`}>
                <div className={`text-xs font-medium text-gray-600 dark:text-gray-400 px-1 ${isUser ? 'text-right' : ''}`}>
                    {message.sender}
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm break-words ${isUser
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100'
                    }`}>
                    {renderMessageContent(message.content)}
                </div>
                <div className={`text-xs text-gray-500 dark:text-gray-400 px-1 ${isUser ? 'text-right' : ''}`}>
                    {formatTime(message.timestamp)}
                </div>
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
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