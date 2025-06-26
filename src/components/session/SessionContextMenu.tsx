'use client'

import React, { useEffect, useRef } from 'react'
import { SessionContextMenuProps, SessionAction } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

const SessionContextMenu: React.FC<SessionContextMenuProps> = ({
    session,
    isOpen,
    position,
    onClose,
    onAction
}) => {
    const { t } = useTranslation()
    const menuRef = useRef<HTMLDivElement>(null)

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

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            document.addEventListener('keydown', handleEscape)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onClose])

    const handleAction = (action: SessionAction) => {
        onAction(action)
        onClose()
    }

    if (!isOpen || !session) return null

    const menuItems = [
        {
            key: 'rename',
            icon: '✏️',
            label: t('session.rename'),
            action: () => handleAction('rename')
        },
        {
            key: 'pin',
            icon: session.isPinned ? '📌' : '📌',
            label: session.isPinned ? t('session.unpin') : t('session.pin'),
            action: () => handleAction('pin')
        },
        {
            key: 'duplicate',
            icon: '📋',
            label: t('session.duplicate'),
            action: () => handleAction('duplicate')
        },
        {
            key: 'export',
            icon: '📤',
            label: t('session.export'),
            action: () => handleAction('export')
        },
        { key: 'divider' },
        {
            key: 'delete',
            icon: '🗑️',
            label: t('session.delete'),
            action: () => handleAction('delete'),
            danger: true
        }
    ]

    return (
        <>
            <div
                className="fixed inset-0 z-[1000] bg-transparent"
                onClick={onClose}
            />
            <div
                className="fixed z-[1001] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl backdrop-blur-xl min-w-60 max-w-80 overflow-hidden animate-menu-slide-in"
                style={{
                    left: position.x,
                    top: position.y
                }}
            >
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <div className="flex flex-col gap-0.5">
                        <div className="font-medium text-slate-900 dark:text-slate-100 text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                            {session.title}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 uppercase font-medium">
                            {session.type === 'GROUP' ? t('session.groupChat') : t('session.singleChat')}
                        </div>
                    </div>
                </div>

                <div className="py-1">
                    {menuItems.map((item) => {
                        if (item.key === 'divider') {
                            return (
                                <div
                                    key={item.key}
                                    className="h-px bg-slate-200 dark:bg-slate-700 my-1"
                                />
                            )
                        }

                        return (
                            <button
                                key={item.key}
                                onClick={item.action}
                                className={`w-full flex items-center gap-3 px-4 py-2 border-none bg-none cursor-pointer transition-all duration-150 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 ${item.danger
                                    ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'text-slate-900 dark:text-slate-100'
                                    }`}
                            >
                                <span className="text-base flex-shrink-0 w-5 text-center">
                                    {item.icon}
                                </span>
                                <div className="flex-1 flex flex-col gap-0.5">
                                    <span className="font-medium leading-tight">
                                        {item.label}
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className="px-4 py-2 pt-2 pb-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            👥 {session.participants.filter(p => p.type === 'agent').length} {t('session.agentsCount')}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            💬 {session.messageCount} {t('session.messagesCount')}
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SessionContextMenu 