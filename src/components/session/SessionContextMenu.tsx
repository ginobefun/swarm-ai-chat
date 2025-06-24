'use client'

import React, { useEffect, useRef } from 'react'
import { SessionContextMenuProps, SessionAction } from '@/types'

const SessionContextMenu: React.FC<SessionContextMenuProps> = ({
    session,
    isOpen,
    position,
    onClose,
    onAction
}) => {
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

    if (!isOpen) return null

    const menuItems = [
        {
            action: 'rename' as SessionAction,
            icon: '✏️',
            label: '重命名',
            description: '修改会话标题'
        },
        {
            action: session.isPinned ? 'unpin' : 'pin' as SessionAction,
            icon: session.isPinned ? '📌' : '📍',
            label: session.isPinned ? '取消置顶' : '置顶',
            description: session.isPinned ? '取消会话置顶' : '将会话置顶显示'
        },
        {
            action: 'duplicate' as SessionAction,
            icon: '📋',
            label: '复制会话',
            description: '创建相同配置的新会话'
        },
        {
            action: 'archive' as SessionAction,
            icon: '📦',
            label: '归档',
            description: '将会话移到归档中'
        },
        null, // 分隔线
        {
            action: 'delete' as SessionAction,
            icon: '🗑️',
            label: '删除',
            description: '永久删除此会话',
            danger: true
        }
    ]

    return (
        <>
            {/* 背景遮罩 */}
            <div className="context-menu-overlay" onClick={onClose} />

            {/* 菜单内容 */}
            <div
                ref={menuRef}
                className="context-menu"
                style={{
                    left: position.x,
                    top: position.y
                }}
            >
                <div className="menu-header">
                    <div className="session-info">
                        <span className="session-name">{session.title}</span>
                        <span className="session-type">
                            {session.type === 'group' ? '群聊' : '单聊'}
                        </span>
                    </div>
                </div>

                <div className="menu-items">
                    {menuItems.map((item, index) => {
                        if (item === null) {
                            return <div key={index} className="menu-divider" />
                        }

                        return (
                            <button
                                key={item.action}
                                className={`menu-item ${item.danger ? 'danger' : ''}`}
                                onClick={() => handleAction(item.action)}
                                title={item.description}
                            >
                                <span className="item-icon">{item.icon}</span>
                                <div className="item-content">
                                    <span className="item-label">{item.label}</span>
                                    <span className="item-description">{item.description}</span>
                                </div>
                            </button>
                        )
                    })}
                </div>

                <div className="menu-footer">
                    <div className="session-stats">
                        <span className="stats-item">
                            👥 {session.participants.filter(p => p.type === 'agent').length} 个AI角色
                        </span>
                        <span className="stats-item">
                            💬 {session.messageCount} 条消息
                        </span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .context-menu-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 1000;
                    background: transparent;
                }

                .context-menu {
                    position: fixed;
                    z-index: 1001;
                    background: var(--background);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    backdrop-filter: blur(12px);
                    min-width: 240px;
                    max-width: 320px;
                    overflow: hidden;
                    animation: menuSlideIn 0.15s ease-out;
                }

                @keyframes menuSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-4px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .menu-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--background-secondary);
                }

                .session-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .session-name {
                    font-weight: 500;
                    color: var(--text-primary);
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .session-type {
                    font-size: 12px;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .menu-items {
                    padding: 8px 0;
                }

                .menu-item {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border: none;
                    background: transparent;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    text-align: left;
                }

                .menu-item:hover {
                    background: var(--background-hover);
                }

                .menu-item.danger {
                    color: var(--danger-color);
                }

                .menu-item.danger:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: var(--danger-color);
                }

                .item-icon {
                    font-size: 16px;
                    flex-shrink: 0;
                    width: 20px;
                    text-align: center;
                }

                .item-content {
                    flex: 1;
                    min-width: 0;
                }

                .item-label {
                    display: block;
                    font-weight: 500;
                    font-size: 14px;
                    margin-bottom: 2px;
                }

                .item-description {
                    display: block;
                    font-size: 12px;
                    color: var(--text-secondary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .menu-item.danger .item-description {
                    color: rgba(239, 68, 68, 0.7);
                }

                .menu-divider {
                    height: 1px;
                    background: var(--border-color);
                    margin: 8px 16px;
                }

                .menu-footer {
                    padding: 12px 16px;
                    border-top: 1px solid var(--border-color);
                    background: var(--background-secondary);
                }

                .session-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .stats-item {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                /* 响应式适配 */
                @media (max-width: 640px) {
                    .context-menu {
                        min-width: 200px;
                        max-width: calc(100vw - 32px);
                    }

                    .menu-item {
                        padding: 10px 12px;
                    }

                    .item-description {
                        display: none;
                    }
                }

                /* 确保菜单不会超出屏幕边界 */
                @media (max-height: 600px) {
                    .context-menu {
                        max-height: 80vh;
                        overflow-y: auto;
                    }
                }
            `}</style>
        </>
    )
}

export default SessionContextMenu 