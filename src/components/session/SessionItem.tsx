'use client'

import React from 'react'
import { Session } from '@/types'
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
 * - WeChat-style flat session item design
 * - Visual session representation with AI agent avatars
 * - Last message preview with sender information  
 * - Time display in compact format
 * - Pin status indicated by background color
 * - Responsive design adapting to different screen sizes
 * - Accessibility support with proper ARIA labels
 * - Dark mode compatible styling
 * - Hover and active state visual feedback
 * 
 * Visual Layout:
 * - Left: Avatar(s) of AI agents in the session
 * - Center: Session title and last message preview
 * - Right: Time and pin indicator
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
     * Get the primary agent avatar for display
     * Prioritizes agents in the session, falls back to default
     */
    const getAgentAvatar = () => {
        const agent = session.participants.find(p => p.type === 'agent')
        if (agent) {
            return agent.avatar || '🤖'
        }
        return '💬'
    }

    /**
     * Get the session display name
     * Uses session title or agent name as fallback
     */
    const getSessionName = () => {
        if (session.title) return session.title
        
        const agent = session.participants.find(p => p.type === 'agent')
        if (agent) return agent.name
        
        return t('session.untitled') || 'Untitled'
    }

    /**
     * Render last message preview
     * Shows sender name and truncated message content
     * 
     * @returns JSX element for the last message display
     */
    const renderLastMessage = () => {
        if (!session.lastMessage) {
            return (
                <span className="text-slate-400 dark:text-slate-500 italic">
                    {t('session.noMessages')}
                </span>
            )
        }

        // For user messages, don't show sender name
        const isUserMessage = session.lastMessage.sender === 'You' || session.lastMessage.sender === '你'
        
        return (
            <>
                {!isUserMessage && (
                    <span className="text-slate-600 dark:text-slate-400">
                        {session.lastMessage.sender}:&nbsp;
                    </span>
                )}
                <span className="text-slate-500 dark:text-slate-400">
                    {session.lastMessage.content}
                </span>
            </>
        )
    }

    return (
        <div
            className={`flex items-center px-3 py-2.5 cursor-pointer transition-all duration-150 relative border-b border-slate-100 dark:border-slate-800 ${
                isActive
                    ? 'bg-slate-100 dark:bg-slate-800'
                    : session.isPinned
                    ? 'bg-slate-50 dark:bg-slate-900'
                    : 'bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
            onClick={onClick}
            onContextMenu={onContextMenu}
            role="button"
            tabIndex={0}
            aria-label={`${getSessionName()} - ${session.type} session${isActive ? ' (active)' : ''}${session.isPinned ? ' (pinned)' : ''}`}
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
            {/* Avatar */}
            <div className="flex-shrink-0 mr-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center text-xl">
                    {getAgentAvatar()}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Title and time row */}
                <div className="flex items-start justify-between mb-0.5">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100 text-[15px] leading-tight truncate pr-2">
                        {getSessionName()}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {session.isPinned && (
                            <span className="text-slate-400 dark:text-slate-500 text-xs">
                                📌
                            </span>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {formatTimeAgo(session.updatedAt, t)}
                        </span>
                    </div>
                </div>

                {/* Last message */}
                <div className="text-sm leading-tight truncate">
                    {renderLastMessage()}
                </div>
            </div>

            {/* Unread indicator (future feature) */}
            {/* {session.unreadCount > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-medium">
                    {session.unreadCount > 99 ? '99+' : session.unreadCount}
                </div>
            )} */}
        </div>
    )
}

export default SessionItem 