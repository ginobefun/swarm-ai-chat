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
        // Basic markdown support for AI responses
        const processMarkdown = (text: string) => {
            // Bold text
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
            
            // Code blocks and inline code
            text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto"><code>$1</code></pre>')
            text = text.replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm">$1</code>')
            
            // Lists
            text = text.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4">$1</li>')
            text = text.replace(/^-\s+(.+)$/gm, '<li class="ml-4">$1</li>')
            text = text.replace(/(<li.*<\/li>)/g, '<ul class="list-disc pl-4 space-y-1">$1</ul>')
            
            return text
        }

        const isUser = message.senderType === 'user'
        
        if (isUser) {
            // Simple text for user messages
            return content.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                    {index < content.split('\n').length - 1 && <br />}
                </React.Fragment>
            ))
        } else {
            // Enhanced markdown for AI responses
            const processedContent = processMarkdown(content)
            return (
                <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: processedContent }} 
                />
            )
        }
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
                title={message.sender}
            >
                {message.avatar || (isUser ? '👤' : '🤖')}
            </div>
            <div className={`flex flex-col gap-1 max-w-[75%] min-w-0 ${isUser ? 'items-end' : ''}`}>
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

    // Auto scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isTyping])

    return (
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollBehavior: 'smooth' }}>
            {/* Welcome message for empty chat */}
            {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center mb-4">
                        <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Start your conversation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                        Send a message to begin your chat with the AI assistant. You can ask questions, request help, or start a discussion.
                    </p>
                </div>
            )}

            {/* Display messages */}
            {messages.map((message) => (
                <MessageItem key={message.id} message={message} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
                <TypingIndicator
                    user={typingUser}
                    avatar={typingAvatar}
                    avatarStyle="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                />
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default MessageList 