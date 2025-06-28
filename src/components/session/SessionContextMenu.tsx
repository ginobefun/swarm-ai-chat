'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { SessionContextMenuProps, SessionAction } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

/**
 * SessionContextMenu - Compact right-click context menu for session items
 * 
 * Features:
 * - Smart positioning with boundary detection
 * - Optimized z-index layering system
 * - Smooth animations and transitions
 * - Keyboard navigation support
 * - Accessibility compliance
 * - Dark mode compatible
 * - International text support
 * - Compact design for better interaction
 * 
 * Design Principles Applied:
 * - User-centered design: Quick access to common actions
 * - Clarity & Simplicity: Clean, organized menu structure
 * - Consistency: Matches overall design system
 * - Feedback: Visual feedback for interactions
 * - Efficiency: Fast access to session operations
 * - Forgiveness: Confirmation for destructive actions
 */
const SessionContextMenu: React.FC<SessionContextMenuProps> = ({
    session,
    isOpen,
    position,
    onClose,
    onAction
}) => {
    const { t } = useTranslation()
    const menuRef = useRef<HTMLDivElement>(null)
    const [adjustedPosition, setAdjustedPosition] = useState(position)

    /**
     * Smart positioning algorithm with boundary detection
     * Ensures menu stays within viewport bounds
     */
    const calculatePosition = useCallback(() => {
        if (!menuRef.current || !isOpen) return

        const menu = menuRef.current
        const menuRect = menu.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let { x, y } = position

        // Check right boundary - if menu would overflow, position to the left
        if (x + menuRect.width > viewportWidth - 16) {
            x = viewportWidth - menuRect.width - 16
        }

        // Check left boundary
        if (x < 16) {
            x = 16
        }

        // Check bottom boundary - if menu would overflow, position above
        if (y + menuRect.height > viewportHeight - 16) {
            y = viewportHeight - menuRect.height - 16
        }

        // Check top boundary
        if (y < 16) {
            y = 16
        }

        setAdjustedPosition({ x, y })
    }, [position, isOpen])

    /**
     * Handle clicks outside menu to close
     */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        const handleResize = () => {
            if (isOpen) {
                calculatePosition()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
            window.addEventListener('resize', handleResize)

            // Calculate position after menu is rendered
            setTimeout(calculatePosition, 0)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
            window.removeEventListener('resize', handleResize)
        }
    }, [isOpen, onClose, calculatePosition])

    /**
     * Handle menu action with automatic close
     */
    const handleAction = (action: SessionAction) => {
        onAction(action)
        onClose()
    }

    /**
     * Handle keyboard navigation within menu
     */
    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose()
        }
    }

    if (!isOpen || !session) return null

    // Define menu items with compact design
    const menuItems = [
        {
            key: 'rename',
            icon: '✏️',
            label: t('session.rename') || 'Rename',
            action: () => handleAction('rename')
        },
        {
            key: 'pin',
            icon: session.isPinned ? '📌' : '📌',
            label: session.isPinned ? (t('session.unpin') || 'Unpin') : (t('session.pin') || 'Pin'),
            action: () => handleAction(session.isPinned ? 'unpin' : 'pin')
        },
        {
            key: 'duplicate',
            icon: '📋',
            label: t('session.duplicate') || 'Duplicate',
            action: () => handleAction('duplicate')
        },
        {
            key: 'export',
            icon: '📤',
            label: t('session.export') || 'Export',
            action: () => handleAction('export')
        },
        { key: 'divider' },
        {
            key: 'delete',
            icon: '🗑️',
            label: t('session.delete') || 'Delete',
            action: () => handleAction('delete'),
            danger: true
        }
    ]

    return (
        <>
            {/* Backdrop overlay with higher z-index for proper layering */}
            <div
                className="fixed inset-0 z-[9998] bg-transparent"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Context menu with compact design */}
            <div
                ref={menuRef}
                className="fixed z-[9998] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/80 rounded-lg shadow-lg shadow-black/10 dark:shadow-black/20 min-w-48 max-w-64 overflow-hidden animate-menu-slide-in"
                style={{
                    left: adjustedPosition.x,
                    top: adjustedPosition.y,
                }}
                role="menu"
                aria-label={`Context menu for ${session.title}`}
                onKeyDown={handleKeyDown}
                tabIndex={-1}
            >
                {/* Compact session header */}
                <div className="px-3 py-2 border-b border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="font-medium text-slate-900 dark:text-slate-100 text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                        {session.title || t('session.untitled') || 'Untitled Session'}
                    </div>
                </div>

                {/* Menu items with reduced padding */}
                <div className="py-1" role="none">
                    {menuItems.map((item, index) => {
                        if (item.key === 'divider') {
                            return (
                                <div
                                    key={`divider-${index}`}
                                    className="h-px bg-slate-200/60 dark:bg-slate-700/60 my-1"
                                    role="separator"
                                />
                            )
                        }

                        return (
                            <button
                                key={item.key}
                                onClick={item.action}
                                className={`w-full flex items-center gap-2.5 px-3 py-1.5 border-none bg-none cursor-pointer transition-all duration-150 text-sm text-left group hover:bg-slate-100/80 dark:hover:bg-slate-800/60 focus:bg-slate-100/80 dark:focus:bg-slate-800/60 focus:outline-none ${item.danger
                                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 focus:bg-red-50/80 dark:focus:bg-red-900/20'
                                    : 'text-slate-700 dark:text-slate-200'
                                    }`}
                                role="menuitem"
                                aria-label={item.label}
                            >
                                <span className="text-sm flex-shrink-0 w-4 text-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    {item.icon}
                                </span>
                                <span className="font-medium leading-tight">
                                    {item.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    )
}

export default SessionContextMenu 