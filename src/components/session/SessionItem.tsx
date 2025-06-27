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
            className={`flex flex-col gap-1 p-3 rounded-lg cursor-pointer transition-all duration-150 border border-transparent relative hover:bg-slate-50 dark:hover:bg-slate-800 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-900 ${isActive
                ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-600 shadow-sm'
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
            {/* Row 1: Title, Pin indicator, and Time */}
            <div className="flex items-center justify-between gap-2">
                <h3
                    className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis flex-1 text-sm"
                    title={session.title || 'Untitled Session'}
                >
                    {session.title || 'Untitled Session'}
                </h3>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                    {session.isPinned && (
                        <span
                            className="text-yellow-500 text-xs"
                            aria-label="Pinned session"
                            title="This session is pinned"
                        >
                            📌
                        </span>
                    )}
                    <span
                        className="text-xs text-slate-500 dark:text-slate-400"
                        title={`Created: ${new Date(session.createdAt).toLocaleString()}`}
                    >
                        {formatTimeAgo(session.createdAt, t)}
                    </span>
                </div>
            </div>

            {/* Row 2: Last Message Preview */}
            <div
                className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-1 overflow-hidden"
                title={session.lastMessage?.content || 'No messages'}
            >
                {renderLastMessage()}
            </div>
        </div>
    )
}

export default SessionItem 