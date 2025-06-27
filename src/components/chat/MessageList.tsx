'use client'

import React, { useEffect, useRef } from 'react'
import { Message } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

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
    const { t } = useTranslation()
    return (
        <div className="flex gap-3 group animate-pulse">
            <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ring-2 ring-white dark:ring-slate-800"
                style={avatarStyle ? { background: avatarStyle } : undefined}
            >
                {avatar}
            </div>
            <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] min-w-0">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2">{user}</div>
                <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-md px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-typing-indicator"></div>
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-typing-indicator" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-typing-indicator" style={{ animationDelay: '0.4s' }}></div>
                    </div>

                    {/* Message tail for bubble effect */}
                    <div className="absolute top-0 left-0 w-3 h-3 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 rounded-br-full transform -translate-x-2 -translate-y-1" />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 px-2">
                    {t('chat.typing')}
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
        // Enhanced markdown support for AI responses
        const processMarkdown = (text: string) => {
            // Bold text
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
            text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

            // Code blocks with syntax highlighting style
            text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm font-mono my-3 border border-slate-700"><code>$1</code></pre>')
            text = text.replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-1 rounded-md text-sm font-mono">$1</code>')

            // Lists with better styling
            text = text.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
            text = text.replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 mb-1">$1</li>')
            text = text.replace(/(<li.*?<\/li>)/g, '<ul class="list-disc pl-4 space-y-1 my-2">$1</ul>')

            // Line breaks
            text = text.replace(/\n/g, '<br />')

            return text
        }

        const isUser = message.senderType === 'user'

        if (isUser) {
            // Simple text for user messages with line breaks
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
                    className="prose prose-sm max-w-none dark:prose-invert prose-pre:bg-slate-900 prose-pre:text-slate-100 
                              prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 
                              prose-headings:my-2 prose-h1:my-2 prose-h2:my-2 prose-h3:my-2 
                              prose-h4:my-1 prose-h5:my-1 prose-h6:my-1"
                    dangerouslySetInnerHTML={{ __html: processedContent }}
                />
            )
        }
    }

    const isUser = message.senderType === 'user'

    return (
        <div className={`flex gap-3 group animate-message-slide-in ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar - only show for AI messages or first user message */}
            <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 shadow-sm ${isUser
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    } text-white ring-2 ring-white dark:ring-slate-800`}
                style={message.avatarStyle ? { background: message.avatarStyle } : undefined}
                title={message.sender}
            >
                {message.avatar || (isUser ? '👤' : '🤖')}
            </div>

            {/* Message Content - Responsive */}
            <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Sender name - only show for AI messages */}
                {!isUser && (
                    <div className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
                        {message.sender}
                    </div>
                )}

                {/* Message bubble - Responsive */}
                <div className={`relative px-3 py-2 sm:px-4 sm:py-3 text-sm break-words shadow-sm ${isUser
                    ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-md'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-md'
                    }`}>
                    {renderMessageContent(message.content)}

                    {/* Message tail for bubble effect */}
                    <div className={`absolute top-0 w-3 h-3 ${isUser
                        ? 'right-0 bg-indigo-600 rounded-tl-full'
                        : 'left-0 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 rounded-br-full'
                        } transform ${isUser ? 'translate-x-2 -translate-y-1' : '-translate-x-2 -translate-y-1'}`}
                    />
                </div>

                {/* Timestamp - show on hover */}
                <div className={`text-xs text-slate-500 dark:text-slate-400 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${isUser ? 'text-right' : 'text-left'}`}>
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
    const { t } = useTranslation()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    // Date formatting with locale support
    const formatDate = (date: Date) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (isSameDay(date, today)) return t('common.today')
        if (isSameDay(date, yesterday)) return t('common.yesterday')

        // Use locale-aware date formatting
        return date.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric'
        })
    }

    // Enhanced auto scroll logic with smooth behavior
    const scrollToBottom = () => {
        // Use requestAnimationFrame for better performance
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            })
        })
    }

    // Smart scrolling: only auto-scroll if user is near bottom
    const shouldAutoScroll = () => {
        if (!scrollContainerRef.current) return true

        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
        const threshold = 100 // px from bottom
        return scrollHeight - scrollTop - clientHeight < threshold
    }

    useEffect(() => {
        if (shouldAutoScroll()) {
            scrollToBottom()
        }
    }, [messages, isTyping])

    return (
        <div
            ref={scrollContainerRef}
            className="h-full overflow-y-auto overscroll-behavior-contain chat-scrollbar smooth-scroll"
        >
            {/* Message Container with responsive padding and spacing */}
            <div className="flex flex-col gap-3 p-3 sm:p-4 pb-4 sm:pb-6 min-h-full">
                {/* Welcome message for empty chat */}
                {messages.length === 0 && !isTyping && (
                    <div className="flex flex-col items-center justify-center flex-1 text-center px-8">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6 shadow-lg">
                            <span className="text-3xl">💬</span>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                            {t('chat.startConversation')}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                            {t('chat.startConversationDesc')}
                        </p>
                    </div>
                )}

                {/* Messages with date grouping */}
                {messages.length > 0 && (
                    <div className="space-y-3">
                        {messages.map((message, index) => {
                            // Show date separator for new days
                            const showDateSeparator = index === 0 ||
                                !isSameDay(message.timestamp, messages[index - 1].timestamp)

                            return (
                                <React.Fragment key={message.id}>
                                    {showDateSeparator && (
                                        <div className="flex items-center justify-center py-2">
                                            <div className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs px-3 py-1 rounded-full">
                                                {formatDate(message.timestamp)}
                                            </div>
                                        </div>
                                    )}
                                    <MessageItem message={message} />
                                </React.Fragment>
                            )
                        })}
                    </div>
                )}

                {/* Typing indicator - only show if no pending assistant message */}
                {isTyping && !messages.some(msg => msg.senderType === 'ai' && msg.content === '') && (
                    <div className="mt-2">
                        <TypingIndicator
                            user={typingUser}
                            avatar={typingAvatar}
                            avatarStyle="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        />
                    </div>
                )}

                {/* Scroll anchor - maintains scroll position */}
                <div ref={messagesEndRef} className="h-1" />
            </div>
        </div>
    )
}

// Helper functions for date formatting  
const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString()
}

export default MessageList 