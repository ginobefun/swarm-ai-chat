'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Message } from '@/types'
import { StreamEvent, UserActionType } from '@/types/chat'
import { useTranslation } from '@/contexts/AppContext'
import { MessageActions } from '@/components/ui/message-actions'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'
import { Badge } from '@/components/ui/badge'
import { Bot, CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface MessageListProps {
    messages: Message[]
    isTyping?: boolean
    typingUser?: string
    typingAvatar?: string
    streamEvents?: StreamEvent[]
    onUserAction?: (action: UserActionType, metadata?: Record<string, unknown>) => void
}

const TypingIndicator: React.FC<{
    user: string
    avatar: string
    avatarStyle?: string
}> = ({ user, avatar, avatarStyle }) => {
    const { t } = useTranslation()

    // Render avatar (image or text)
    const renderAvatar = () => {
        const isImageUrl = avatar.startsWith('http://') || avatar.startsWith('https://')

        if (isImageUrl) {
            return (
                <Image
                    src={avatar}
                    alt={user}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                />
            )
        }
        return avatar
    }

    return (
        <div className="flex gap-3 group animate-pulse">
            <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white ring-2 ring-white dark:ring-slate-800 overflow-hidden"
                style={avatarStyle ? { background: avatarStyle } : undefined}
            >
                {renderAvatar()}
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
    const { t } = useTranslation()
    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Message metadata interface
    interface MessageMetadata {
        senderType?: string
        senderId?: string
        contentType?: string
        rawMetadata?: {
            taskId?: string
            assignedTo?: string
            turnIndex?: number
            originalContent?: string
            [key: string]: string | number | boolean | undefined
        }
    }

    // Extended message interface for collaboration
    interface ExtendedMessage extends Message {
        metadata?: MessageMetadata
    }

    // Check if this is a collaboration message
    const isCollaborationMessage = (message: ExtendedMessage) => {
        return message.metadata?.contentType === 'SYSTEM' && message.metadata?.senderId === 'orchestrator'
    }

    const isTaskMessage = (message: ExtendedMessage) => {
        return message.metadata?.rawMetadata?.taskId
    }

    const isResultMessage = (message: ExtendedMessage) => {
        return message.metadata?.senderType === 'AGENT' && message.metadata?.contentType === 'TEXT' && message.metadata?.rawMetadata?.taskId
    }

    // Render collaboration-specific message styles
    const renderCollaborationMessage = (content: string, message: ExtendedMessage) => {
        if (isTaskMessage(message)) {
            const metadata = message.metadata?.rawMetadata
            return (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600 dark:text-blue-400">🎯</span>
                        <span className="font-medium text-blue-900 dark:text-blue-300">{t('collaboration.newTaskAssigned')}</span>
                        {metadata?.assignedTo && (
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                                {metadata.assignedTo}
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">{content}</div>
                </div>
            )
        }

        if (isResultMessage(message)) {
            const metadata = message.metadata?.rawMetadata
            return (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 dark:text-green-400">✅</span>
                        <span className="font-medium text-green-900 dark:text-green-300">{t('collaboration.taskCompleted')}</span>
                        {metadata?.taskId && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                                {metadata.taskId.substring(0, 8)}
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">{content}</div>
                </div>
            )
        }

        // Default system message styling
        return (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-600 dark:text-amber-400">🔄</span>
                    <span className="font-medium text-amber-900 dark:text-amber-300">{t('collaboration.progress')}</span>
                </div>
                <div className="text-sm text-amber-800 dark:text-amber-200 whitespace-pre-wrap">{content}</div>
            </div>
        )
    }

    // Enhanced markdown rendering with react-markdown
    const renderMessageContent = (content: string) => {
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
            // Use enhanced MarkdownRenderer for AI responses
            return <MarkdownRenderer content={content} />
        }
    }

    // Render avatar (image or text)
    const renderAvatar = () => {
        const avatarContent = message.avatar || (message.senderType === 'user' ? '👤' : '🤖')
        const isImageUrl = avatarContent.startsWith('http://') || avatarContent.startsWith('https://')

        if (isImageUrl) {
            return (
                <Image
                    src={avatarContent}
                    alt={message.sender}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                />
            )
        }
        return avatarContent
    }

    // Message action handlers
    const handleLike = (messageId: string) => {
        console.log('Liked message:', messageId)
        // TODO: Implement like functionality
    }

    const handleDislike = (messageId: string) => {
        console.log('Disliked message:', messageId)
        // TODO: Implement dislike functionality
    }

    const handleCopy = () => {
        console.log('Copied message content')
        // Message actions component handles the clipboard operation
    }

    const isUser = message.senderType === 'user'

    return (
        <div className={`flex gap-3 group animate-message-slide-in ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar - only show for AI messages or first user message */}
            <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 shadow-sm ${isUser
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600'
                    : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                    } text-white ring-2 ring-white dark:ring-slate-800 overflow-hidden`}
                style={message.avatarStyle ? { background: message.avatarStyle } : undefined}
                title={message.sender}
            >
                {renderAvatar()}
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
                {/* Check for collaboration messages and render accordingly */}
                {isCollaborationMessage(message) || isTaskMessage(message) || isResultMessage(message) ? (
                    // Collaboration message (no bubble, special styling)
                    <div className="w-full">
                        {renderCollaborationMessage(message.content, message)}
                    </div>
                ) : (
                    // Regular message bubble
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
                )}

                {/* Message actions - only show for AI messages */}
                {!isUser && (
                    <div className={`px-2 ${isUser ? 'text-right' : 'text-left'}`}>
                        <MessageActions
                            messageId={message.id}
                            content={message.content}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onCopy={handleCopy}
                        />
                    </div>
                )}

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
    typingAvatar = "🤖",
    streamEvents
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

                {/* Stream Events Display */}
                {streamEvents && streamEvents.length > 0 && (
                    <div className="space-y-2 px-4">
                        {streamEvents.map((event, index) => {
                            const showEvent = index === streamEvents.length - 1 ||
                                ['task_created', 'task_started', 'task_completed', 'task_failed'].includes(event.type)

                            if (!showEvent) return null

                            return (
                                <div key={event.id} className="flex items-center gap-2 text-sm animate-message-slide-in">
                                    {event.type === 'task_planning' && (
                                        <>
                                            <Bot className="w-4 h-4 text-blue-500" />
                                            <span className="text-slate-600 dark:text-slate-400">{event.content}</span>
                                        </>
                                    )}
                                    {event.type === 'task_created' && (
                                        <>
                                            <Badge variant="secondary" className="text-xs">
                                                {t('chat.taskCreated')}
                                            </Badge>
                                            <span className="text-slate-600 dark:text-slate-400">{event.content}</span>
                                        </>
                                    )}
                                    {event.type === 'task_started' && (
                                        <>
                                            <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                                            <span className="text-slate-600 dark:text-slate-400">{event.content}</span>
                                        </>
                                    )}
                                    {event.type === 'task_completed' && (
                                        <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-slate-600 dark:text-slate-400">{event.content}</span>
                                        </>
                                    )}
                                    {event.type === 'task_failed' && (
                                        <>
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                            <span className="text-slate-600 dark:text-slate-400">{event.content}</span>
                                        </>
                                    )}
                                </div>
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