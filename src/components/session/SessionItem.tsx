'use client'

import React from 'react'
import { Session, SessionParticipant } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import { formatTimeAgo } from '@/utils'

/**
 * Props interface for SessionItem component
 * Defines all properties needed to render a session item
 */
interface SessionItemProps {
    session: Session                                    // Session data to display
    isActive?: boolean                                 // Whether this session is currently selected
    onClick: () => void                               // Callback when session is clicked/selected
    onContextMenu?: (e: React.MouseEvent) => void    // Callback for right-click context menu
}

/**
 * SessionItem component - Individual session display in the sidebar
 * 
 * Features:
 * - Visual session representation with AI agent avatars
 * - Session type indicators (direct, group, workflow)
 * - Last message preview with sender information
 * - Responsive design adapting to different screen sizes
 * - Pin status indicator for important sessions
 * - Accessibility support with proper ARIA labels
 * - Dark mode compatible styling
 * - Hover and active state visual feedback
 * 
 * Visual Layout:
 * - Left: Avatar(s) of AI agents in the session
 * - Center: Session title, last message, and metadata
 * - Right: Session type badge for group sessions
 * 
 * @param props - SessionItemProps containing session data and handlers
 * @returns JSX element representing a single session item
 */
const SessionItem: React.FC<SessionItemProps> = ({
    session,
    isActive = false,
    onClick,
    onContextMenu
}) => {
    const { t } = useTranslation()

    /**
     * Get appropriate emoji icon for session type
     * Provides visual differentiation between session types
     * 
     * @returns Emoji string representing session type
     */
    const getSessionTypeIcon = () => {
        switch (session.type) {
            case 'direct':
                return '👤'    // Single person for direct chats
            case 'group':
                return '👥'    // Multiple people for group chats
            case 'workflow':
                return '⚙️'     // Gear for workflow sessions
            default:
                return '💬'    // Generic chat bubble fallback
        }
    }

    /**
     * Render avatar section based on session participants
     * Shows different layouts for single vs multiple AI agents
     * 
     * @returns JSX element for the avatar display area
     */
    const renderAvatar = () => {
        const agents = session.participants.filter((p: SessionParticipant) => p.type === 'agent')

        // No agents - show generic chat icon
        if (agents.length === 0) {
            return (
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    aria-label="Generic chat session"
                >
                    💬
                </div>
            )
        }

        // Single agent - show individual avatar
        if (agents.length === 1) {
            const agent = agents[0]
            return (
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl font-medium text-white bg-gradient-to-br from-indigo-600 to-indigo-700"
                    style={agent.avatar ? { background: agent.avatar } : undefined}
                    aria-label={`Chat with ${agent.name}`}
                >
                    {agent.name.charAt(0).toUpperCase()}
                </div>
            )
        }

        // Multiple agents - show overlapping avatars
        return (
            <div
                className="relative w-12 h-12 bg-transparent"
                aria-label={`Group chat with ${agents.length} AI agents`}
            >
                {agents.slice(0, 3).map((agent: SessionParticipant, index: number) => (
                    <div
                        key={agent.id}
                        className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium text-white border-2 border-white dark:border-slate-900 bg-gradient-to-br from-indigo-600 to-indigo-700 ${index === 0 ? 'top-0 left-0' :
                            index === 1 ? 'top-2 left-4' :
                                'top-4 left-8'
                            }`}
                        style={agent.avatar ? { background: agent.avatar } : undefined}
                        title={agent.name}
                    >
                        {index < 2 ? agent.name.charAt(0).toUpperCase() : `+${agents.length - 2}`}
                    </div>
                ))}
                {/* Overflow indicator for 4+ agents */}
                {agents.length > 3 && (
                    <div
                        className="absolute top-4 left-8 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium bg-slate-600 dark:bg-slate-500 text-white border-2 border-white dark:border-slate-900"
                        title={`${agents.length - 2} more agents`}
                    >
                        +{agents.length - 2}
                    </div>
                )}
            </div>
        )
    }

    /**
     * Render last message preview with sender information
     * Shows either actual last message or empty state message
     * 
     * @returns JSX element for the last message display
     */
    const renderLastMessage = () => {
        if (!session.lastMessage) {
            return (
                <span className="italic opacity-70">
                    {t('session.noMessages')}
                </span>
            )
        }

        return (
            <div className="last-message">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                    {session.lastMessage.sender}:
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-400">
                    {session.lastMessage.content}
                </span>
            </div>
        )
    }

    return (
        <div
            className={`flex items-center gap-3 p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-150 border border-transparent relative hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-px focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 ${isActive
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 shadow-lg shadow-indigo-600/10'
                : ''
                } ${session.isPinned
                    ? 'bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/50'
                    : ''
                }`}
            onClick={onClick}
            onContextMenu={onContextMenu}
            role="button"
            tabIndex={0}
            aria-label={`${session.title} - ${session.type} session${isActive ? ' (active)' : ''}${session.isPinned ? ' (pinned)' : ''}`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClick()
                }
                if (e.key === 'ContextMenu' && onContextMenu) {
                    e.preventDefault()
                    // Simulate context menu at element center
                    const rect = e.currentTarget.getBoundingClientRect()
                    const fakeEvent = {
                        preventDefault: () => { },
                        clientX: rect.left + rect.width / 2,
                        clientY: rect.top + rect.height / 2
                    } as React.MouseEvent
                    onContextMenu(fakeEvent)
                }
            }}
        >
            {/* Avatar Section with Pin Indicator */}
            <div className="relative flex-shrink-0">
                {renderAvatar()}
                {/* Pin indicator overlay */}
                {session.isPinned && (
                    <div
                        className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-xs border-2 border-white dark:border-slate-900"
                        aria-label="Pinned session"
                        title="This session is pinned"
                    >
                        📌
                    </div>
                )}
            </div>

            {/* Main Content Section */}
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                {/* Header Row: Title, Type Icon, and Timestamp */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span
                            className="text-sm opacity-70 flex-shrink-0"
                            aria-label={`Session type: ${session.type}`}
                            title={`${session.type.charAt(0).toUpperCase() + session.type.slice(1)} session`}
                        >
                            {getSessionTypeIcon()}
                        </span>
                        <h3
                            className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis"
                            title={session.title || 'Untitled Session'}
                        >
                            {session.title || 'Untitled Session'}
                        </h3>
                    </div>
                    <span
                        className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap flex-shrink-0"
                        title={`Last updated: ${new Date(session.updatedAt).toLocaleString()}`}
                    >
                        {formatTimeAgo(session.updatedAt, t)}
                    </span>
                </div>

                {/* Last Message Preview */}
                <div
                    className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2 overflow-hidden"
                    title={session.lastMessage?.content || 'No messages'}
                >
                    {renderLastMessage()}
                </div>

                {/* Session Metadata (hidden on mobile for space) */}
                <div className="hidden md:flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <span
                        className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis"
                        title={`${session.participants.filter((p: SessionParticipant) => p.type === 'agent').length} AI agents in this session`}
                    >
                        👥 {session.participants.filter((p: SessionParticipant) => p.type === 'agent').length} {t('session.agentsCount')}
                    </span>
                    <span
                        className="flex-shrink-0"
                        title={`${session.messageCount} messages in this session`}
                    >
                        💬 {session.messageCount} {t('session.messagesCount')}
                    </span>
                </div>
            </div>

            {/* Right Side Indicators */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                {/* Group session participant count badge */}
                {session.type === 'group' && (
                    <div
                        className="bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold"
                        aria-label={`${session.participants.filter((p: SessionParticipant) => p.type === 'agent').length} participants`}
                        title={`${session.participants.filter((p: SessionParticipant) => p.type === 'agent').length} AI agents`}
                    >
                        {session.participants.filter((p: SessionParticipant) => p.type === 'agent').length}
                    </div>
                )}

                {/* TODO: Unread message indicator for future feature */}
                {/* Future: Add unreadCount property to Session type when implemented */}
            </div>
        </div>
    )
}

export default SessionItem 