'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import { List, useDynamicRowHeight, useListRef } from 'react-window'
import { Message, Artifact, TypingAgent } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import AgentTypingIndicator from './AgentTypingIndicator'
import ArtifactMiniPreview from '../artifact/ArtifactMiniPreview'
import SafeMarkdown from './SafeMarkdown'

interface VirtualizedMessageListProps {
    messages: Message[]
    isTyping?: boolean
    typingUser?: string
    typingAvatar?: string
    typingAgents?: TypingAgent[]
    messageArtifacts?: Record<string, Artifact[]>
    onViewArtifact?: (artifactId: string) => void
    height?: number | 'auto' // Support auto height for flex layouts
}

/**
 * VirtualizedMessageList Component
 *
 * Performance-optimized message list using react-window for virtualization.
 * Only renders visible messages for better performance with long conversations.
 *
 * Features:
 * - Virtual scrolling for thousands of messages
 * - Dynamic row heights
 * - Smooth scrolling
 * - Auto-scroll to bottom on new messages
 * - All features from original MessageList
 */
const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
    messages,
    isTyping = false,
    typingUser = "AI 助手",
    typingAvatar = "🤖",
    typingAgents = [],
    messageArtifacts = {},
    onViewArtifact,
    height = 'auto'
}) => {
    const { t } = useTranslation()
    const listRef = useListRef(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerHeight, setContainerHeight] = useState<number>(600)

    // Use dynamic row height hook from react-window
    const rowHeight = useDynamicRowHeight({
        defaultRowHeight: 100
    })

    // Measure container height for auto mode
    useEffect(() => {
        if (height === 'auto' && containerRef.current) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    setContainerHeight(entry.contentRect.height)
                }
            })
            resizeObserver.observe(containerRef.current)
            return () => resizeObserver.disconnect()
        }
    }, [height])

    // Helper function to check if two dates are on the same day
    const isSameDay = (date1: Date, date2: Date) => {
        return date1.toDateString() === date2.toDateString()
    }

    // Format date for separators
    const formatDate = (date: Date) => {
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        if (isSameDay(date, today)) return t('common.today') || 'Today'
        if (isSameDay(date, yesterday)) return t('common.yesterday') || 'Yesterday'

        return date.toLocaleDateString(undefined, {
            month: 'long',
            day: 'numeric'
        })
    }

    // Format time
    const formatTime = (timestamp: Date) => {
        return timestamp.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Render markdown for AI messages
    const renderMessageContent = (content: string, isUser: boolean) => {
        if (isUser) {
            return content.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                    {index < content.split('\n').length - 1 && <br />}
                </React.Fragment>
            ))
        }

        // Safe markdown rendering for AI messages
        return <SafeMarkdown content={content} />
    }

    // Row renderer component
    const RowComponent = ({ index, style, ariaAttributes }: {
        index: number
        style: React.CSSProperties
        ariaAttributes: {
            'aria-posinset': number
            'aria-setsize': number
            role: 'listitem'
        }
    }) => {
        const rowRef = useRef<HTMLDivElement>(null)
        const message = messages[index]
        const artifacts = messageArtifacts[message.id] || []
        const isUser = message.senderType === 'user'
        const showDateSeparator = index === 0 || !isSameDay(message.timestamp, messages[index - 1].timestamp)

        // Use observeRowElements to automatically measure row height
        useEffect(() => {
            if (rowRef.current) {
                const cleanup = rowHeight.observeRowElements([rowRef.current])
                return cleanup
            }
        }, [index, message, artifacts])

        return (
            <div ref={rowRef} style={style} {...ariaAttributes} className="px-4 py-2">
                {showDateSeparator && (
                    <div className="flex items-center justify-center py-2 mb-2">
                        <div className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs px-3 py-1 rounded-full">
                            {formatDate(message.timestamp)}
                        </div>
                    </div>
                )}

                <div className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 shadow-sm ${isUser
                            ? 'bg-linear-to-br from-indigo-500 to-indigo-600'
                            : 'bg-linear-to-br from-emerald-500 to-emerald-600'
                            } text-white ring-2 ring-white dark:ring-slate-800`}
                        style={message.avatarStyle ? { background: message.avatarStyle } : undefined}
                    >
                        {message.avatar || (isUser ? '👤' : '🤖')}
                    </div>

                    {/* Message Content */}
                    <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                        {!isUser && (
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
                                {message.sender}
                            </div>
                        )}

                        <div className={`relative px-3 py-2 sm:px-4 sm:py-3 text-sm wrap-break-word shadow-sm ${isUser
                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-md'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-md'
                            }`}>
                            {renderMessageContent(message.content, isUser)}

                            {/* Message tail */}
                            <div className={`absolute top-0 w-3 h-3 ${isUser
                                ? 'right-0 bg-indigo-600 rounded-tl-full translate-x-2 -translate-y-1'
                                : 'left-0 bg-white dark:bg-slate-800 border-l border-t border-slate-200 dark:border-slate-700 rounded-br-full -translate-x-2 -translate-y-1'
                                }`} />
                        </div>

                        {/* Artifact Preview */}
                        {artifacts.length > 0 && (
                            <div className={`w-full ${isUser ? 'self-end' : 'self-start'}`}>
                                <ArtifactMiniPreview
                                    artifact={artifacts[0]}
                                    onFullscreen={onViewArtifact}
                                />
                                {artifacts.length > 1 && (
                                    <div className="mt-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1.5 font-medium">
                                                <span className="text-base">📦</span>
                                                +{artifacts.length - 1} more artifact{artifacts.length - 1 > 1 ? 's' : ''}
                                            </span>
                                            <button
                                                onClick={() => onViewArtifact?.(artifacts[1].id)}
                                                className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
                                            >
                                                View All →
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={`text-xs text-slate-500 dark:text-slate-400 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (listRef.current && messages.length > 0) {
            listRef.current.scrollToRow({
                index: messages.length - 1,
                align: 'end',
                behavior: 'smooth'
            })
        }
    }, [messages.length])

    if (messages.length === 0 && !isTyping && typingAgents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {t('chat.startConversation')}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                    {t('chat.startConversationDesc')}
                </p>
            </div>
        )
    }

    const actualHeight = height === 'auto' ? containerHeight : height

    return (
        <div ref={containerRef} className="h-full flex flex-col">
            <List
                listRef={listRef}
                style={{ height: actualHeight, width: '100%' }}
                rowCount={messages.length}
                rowHeight={rowHeight}
                rowComponent={RowComponent}
                rowProps={{}}
                className="chat-scrollbar"
            />

            {/* Typing indicators */}
            {(typingAgents.length > 0 || isTyping) && (
                <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700">
                    {typingAgents.length > 0 ? (
                        <AgentTypingIndicator agents={typingAgents} />
                    ) : isTyping ? (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <div className="flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-typing-indicator"
                                        style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                ))}
                            </div>
                            <span>{typingUser} {t('chat.typing')}</span>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}

export default VirtualizedMessageList
