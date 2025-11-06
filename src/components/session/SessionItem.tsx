'use client'

import React from 'react'
import { Session, SessionAction } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import { formatTimeAgo } from '@/utils'
import {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { Edit, Pin, PinOff, Copy, Download, Trash2 } from 'lucide-react'

/**
 * Props interface for SessionItem component
 * Defines all properties needed to render a session item
 */
interface SessionItemProps {
    session: Session                                    // Session data to display
    isActive?: boolean                                 // Whether this session is currently selected
    onClick: () => void                               // Callback when session is clicked/selected
    onAction: (action: SessionAction) => void         // Callback for context menu actions
}

/**
 * SessionItem component - Individual session display in the sidebar
 * 
 * Features:
 * - WeChat-style flat session item design with enhanced visual hierarchy
 * - Visual session representation with AI agent avatars
 * - Last message preview with sender information  
 * - Time display in compact format with responsive sizing
 * - Pin status indicated by background color and icon
 * - Fully responsive design adapting to different screen sizes
 * - Enhanced accessibility support with comprehensive ARIA labels
 * - Dark mode compatible styling with proper contrast ratios
 * - Smooth hover and active state visual feedback
 * - Right-click context menu with session actions
 * - Complete international text support with next-intl
 * - Performance optimized with minimal re-renders
 * 
 * Visual Layout:
 * - Left: Enhanced avatar with subtle shadows and borders
 * - Center: Session title and last message preview with clear hierarchy
 * - Right: Time display and pin indicator with proper spacing
 * - Active indicator: Left border highlight for active sessions
 * 
 * Design Principles Applied:
 * - User-centered design: Intuitive layout with quick access to actions
 * - Clarity & Simplicity: Clean, organized structure with clear information hierarchy
 * - Consistency: Seamless integration with Shadcn UI design system
 * - Feedback: Rich visual feedback for all interaction states
 * - Efficiency: Fast access to session operations via accessible context menu
 * - Forgiveness: Clear action labels with descriptive icons
 * - Accessibility: Full screen reader support and keyboard navigation
 * - Responsive: Mobile-first design with optimal touch targets
 * 
 * @param props - SessionItemProps containing session data and handlers
 * @returns JSX element representing a single session item with full accessibility
 */
const SessionItem: React.FC<SessionItemProps> = React.memo(({
    session,
    isActive = false,
    onClick,
    onAction
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
     * Get the session display name with fallback hierarchy
     * Uses session title or agent name as fallback
     */
    const getSessionName = () => {
        if (session.title) return session.title

        const agent = session.participants.find(p => p.type === 'agent')
        if (agent) return agent.name

        return t('session.untitled') || 'Untitled'
    }

    /**
     * Generate comprehensive ARIA label for accessibility
     */
    const getAriaLabel = () => {
        const name = getSessionName()
        const status = isActive ? `, ${t('chat.currentSession') || 'current session'}` : ''
        const pinned = session.isPinned ? `, ${t('session.pinned') || 'pinned'}` : ''
        const messageCount = session.lastMessage ? `, ${session.messageCount || 1} ${t('session.messages') || 'messages'}` : `, ${t('session.noMessages') || 'no messages'}`
        const time = `, ${t('sidebar.lastActivity') || 'last activity'} ${formatTimeAgo(session.updatedAt, t)}`

        return `${name}${status}${pinned}${messageCount}${time}`
    }

    /**
     * Render last message preview with enhanced typography
     * Shows sender name and truncated message content
     */
    const renderLastMessage = () => {
        if (!session.lastMessage) {
            return (
                <span className="text-slate-500 dark:text-slate-400 italic text-sm">
                    {t('session.noMessages') || 'No messages yet'}
                </span>
            )
        }

        // For user messages, don't show sender name to reduce clutter
        const isUserMessage = session.lastMessage.sender === 'You' || session.lastMessage.sender === '你'

        return (
            <div className="flex items-start gap-1">
                {!isUserMessage && (
                    <span className="text-slate-600 dark:text-slate-400 font-medium text-sm flex-shrink-0">
                        {session.lastMessage.sender}:
                    </span>
                )}
                <span className="text-slate-600 dark:text-slate-300 text-sm truncate">
                    {session.lastMessage.content}
                </span>
            </div>
        )
    }

    /**
     * Render context menu content with all session actions
     * Built with Shadcn UI components for consistency and accessibility
     */
    const renderContextMenu = () => (
        <ContextMenuContent
            className="w-56 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/80 shadow-lg"
            aria-label={`${t('session.sessionMenu') || 'Session menu'} for ${getSessionName()}`}
        >
            {/* Session title header with enhanced styling */}
            <div className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 mb-1 bg-slate-50 dark:bg-slate-800/50">
                <div className="truncate" title={session.title || t('session.untitled')}>
                    {session.title || t('session.untitled') || 'Untitled Session'}
                </div>
            </div>

            {/* Rename action */}
            <ContextMenuItem
                onClick={() => onAction('rename')}
                className="gap-3 cursor-pointer py-2.5 px-3 focus:bg-slate-100 dark:focus:bg-slate-800"
                aria-label={`${t('session.rename')} ${getSessionName()}`}
            >
                <Edit className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                <span className="font-medium">{t('session.rename') || 'Rename'}</span>
            </ContextMenuItem>

            {/* Pin/Unpin action */}
            <ContextMenuItem
                onClick={() => onAction(session.isPinned ? 'unpin' : 'pin')}
                className="gap-3 cursor-pointer py-2.5 px-3 focus:bg-slate-100 dark:focus:bg-slate-800"
                aria-label={session.isPinned
                    ? `${t('session.unpin')} ${getSessionName()}`
                    : `${t('session.pin')} ${getSessionName()}`
                }
            >
                {session.isPinned ? (
                    <PinOff className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                ) : (
                    <Pin className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                )}
                <span className="font-medium">
                    {session.isPinned
                        ? (t('session.unpin') || 'Unpin')
                        : (t('session.pin') || 'Pin')
                    }
                </span>
            </ContextMenuItem>

            {/* Duplicate action */}
            <ContextMenuItem
                onClick={() => onAction('duplicate')}
                className="gap-3 cursor-pointer py-2.5 px-3 focus:bg-slate-100 dark:focus:bg-slate-800"
                aria-label={`${t('session.duplicate')} ${getSessionName()}`}
            >
                <Copy className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                <span className="font-medium">{t('session.duplicate') || 'Duplicate'}</span>
            </ContextMenuItem>

            {/* Export action */}
            <ContextMenuItem
                onClick={() => onAction('export')}
                className="gap-3 cursor-pointer py-2.5 px-3 focus:bg-slate-100 dark:focus:bg-slate-800"
                aria-label={`${t('session.export')} ${getSessionName()}`}
            >
                <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                <span className="font-medium">{t('session.export') || 'Export'}</span>
            </ContextMenuItem>

            <ContextMenuSeparator className="my-1" />

            {/* Delete action - destructive styling with enhanced accessibility */}
            <ContextMenuItem
                onClick={() => onAction('delete')}
                className="gap-3 cursor-pointer py-2.5 px-3 text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300"
                variant="destructive"
                aria-label={`${t('session.delete')} ${getSessionName()} (${t('common.destructive') || 'destructive action'})`}
            >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span className="font-medium">{t('session.delete') || 'Delete'}</span>
            </ContextMenuItem>
        </ContextMenuContent>
    )

    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                <article
                    className={`
                        group relative flex items-center px-3 sm:px-4 py-3 cursor-pointer 
                        transition-all duration-200 ease-in-out
                        border-b border-slate-100 dark:border-slate-700/50
                        hover:bg-slate-50 dark:hover:bg-slate-900/60
                        focus-within:bg-slate-100 dark:focus-within:bg-slate-800
                        ${isActive
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50'
                            : session.isPinned
                                ? 'bg-slate-50/80 dark:bg-slate-900/40'
                                : 'bg-white dark:bg-slate-950'
                        }
                    `}
                    onClick={onClick}
                    role="button"
                    tabIndex={0}
                    aria-label={getAriaLabel()}
                    aria-current={isActive ? 'page' : undefined}
                    aria-describedby={`session-${session.id}-details`}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onClick()
                        }
                    }}
                >
                    {/* Enhanced avatar with better visual hierarchy */}
                    <div className="flex-shrink-0 mr-3 sm:mr-4">
                        <div
                            className={`
                                w-11 h-11 sm:w-12 sm:h-12 rounded-xl 
                                bg-gradient-to-br from-indigo-100 to-purple-100 
                                dark:from-indigo-900/40 dark:to-purple-900/40 
                                flex items-center justify-center text-lg sm:text-xl 
                                shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-700/50
                                transition-transform duration-200 group-hover:scale-105
                                ${isActive ? 'ring-indigo-300 dark:ring-indigo-600 shadow-md' : ''}
                            `}
                            aria-hidden="true"
                        >
                            {getAgentAvatar()}
                        </div>
                    </div>

                    {/* Content with improved responsive typography */}
                    <div className="flex-1 min-w-0" id={`session-${session.id}-details`}>
                        {/* Title and time row with better spacing */}
                        <div className="flex items-start justify-between mb-1 gap-2">
                            <h3 className={`
                                font-semibold text-[15px] sm:text-base leading-tight truncate
                                transition-colors duration-200
                                ${isActive
                                    ? 'text-indigo-900 dark:text-indigo-100'
                                    : 'text-slate-900 dark:text-slate-100 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                                }
                            `}>
                                {getSessionName()}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {session.isPinned && (
                                    <span
                                        className="text-indigo-500 dark:text-indigo-400 text-xs transition-transform duration-200 group-hover:scale-110"
                                        aria-label={t('session.pinned') || 'Pinned session'}
                                        title={t('session.pinned') || 'Pinned session'}
                                    >
                                        📌
                                    </span>
                                )}
                                <time
                                    className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium"
                                    dateTime={new Date(session.updatedAt).toISOString()}
                                    title={new Date(session.updatedAt).toLocaleString()}
                                >
                                    {formatTimeAgo(session.updatedAt, t)}
                                </time>
                            </div>
                        </div>

                        {/* Last message with improved readability */}
                        <div className="text-sm leading-relaxed truncate">
                            {renderLastMessage()}
                        </div>
                    </div>

                    {/* Enhanced active indicator with animation */}
                    {isActive && (
                        <div
                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500 rounded-r-full"
                            aria-hidden="true"
                        />
                    )}

                    {/* Focus ring for accessibility */}
                    <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-focus-within:ring-indigo-500/20 dark:group-focus-within:ring-indigo-400/20 pointer-events-none" />
                </article>
            </ContextMenuTrigger>
            {renderContextMenu()}
        </ContextMenu>
    )
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if these props change
    return (
        prevProps.session.id === nextProps.session.id &&
        prevProps.session.title === nextProps.session.title &&
        prevProps.session.updatedAt === nextProps.session.updatedAt &&
        prevProps.session.isPinned === nextProps.session.isPinned &&
        prevProps.session.messageCount === nextProps.session.messageCount &&
        prevProps.session.lastMessage?.content === nextProps.session.lastMessage?.content &&
        prevProps.session.lastMessage?.sender === nextProps.session.lastMessage?.sender &&
        prevProps.isActive === nextProps.isActive
        // Note: We don't compare callbacks (onClick, onAction) as they should be memoized by parent
    )
})

export default SessionItem 