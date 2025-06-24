'use client'

import React from 'react'
import { Session } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

interface SessionItemProps {
    session: Session
    isActive?: boolean
    onSelect: (sessionId: string) => void
    onContextMenu: (e: React.MouseEvent, session: Session) => void
}

const SessionItem: React.FC<SessionItemProps> = ({
    session,
    isActive = false,
    onSelect,
    onContextMenu
}) => {
    // const { t } = useTranslation()

    const handleClick = () => {
        onSelect(session.id)
    }

    const handleRightClick = (e: React.MouseEvent) => {
        e.preventDefault()
        onContextMenu(e, session)
    }

    // 渲染参与者头像
    const renderParticipants = () => {
        const agentParticipants = session.participants.filter(p => p.type === 'agent')
        const maxVisible = 3

        if (agentParticipants.length === 0) {
            return <div className="session-avatar empty">💬</div>
        }

        if (agentParticipants.length === 1) {
            const agent = agentParticipants[0]
            return (
                <div
                    className="session-avatar single"
                    style={{ background: agent.avatarStyle }}
                    title={agent.name}
                >
                    {agent.avatar}
                </div>
            )
        }

        // 群聊显示多个头像
        return (
            <div className="session-avatar group">
                {agentParticipants.slice(0, maxVisible).map((participant, index) => (
                    <div
                        key={participant.id}
                        className="avatar-item"
                        style={{
                            background: participant.avatarStyle,
                            zIndex: maxVisible - index
                        }}
                        title={participant.name}
                    >
                        {participant.avatar}
                    </div>
                ))}
                {agentParticipants.length > maxVisible && (
                    <div className="avatar-item more" title={`+${agentParticipants.length - maxVisible} 更多`}>
                        +{agentParticipants.length - maxVisible}
                    </div>
                )}
            </div>
        )
    }

    // 格式化时间
    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutes < 1) return '刚刚'
        if (minutes < 60) return `${minutes}分钟前`
        if (hours < 24) return `${hours}小时前`
        if (days < 7) return `${days}天前`

        return date.toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric'
        })
    }

    // 获取会话类型图标
    const getSessionTypeIcon = () => {
        if (session.type === 'group') {
            return '👥'
        }
        return '💬'
    }

    return (
        <div
            className={`session-item ${isActive ? 'active' : ''} ${session.isPinned ? 'pinned' : ''}`}
            onClick={handleClick}
            onContextMenu={handleRightClick}
        >
            {/* 左侧头像 */}
            <div className="session-avatar-container">
                {renderParticipants()}
                {session.isPinned && (
                    <div className="pin-indicator" title="已置顶">
                        📌
                    </div>
                )}
            </div>

            {/* 中间信息 */}
            <div className="session-info">
                <div className="session-header">
                    <div className="session-name">
                        <span className="session-type-icon">{getSessionTypeIcon()}</span>
                        <span className="session-title">{session.title}</span>
                    </div>
                    <div className="session-time">
                        {formatTime(session.updatedAt)}
                    </div>
                </div>

                <div className="session-preview">
                    {session.lastMessage ? (
                        <span className="last-message">
                            <span className="sender">{session.lastMessage.sender}:</span>
                            <span className="content">{session.lastMessage.content}</span>
                        </span>
                    ) : (
                        <span className="no-message">暂无消息</span>
                    )}
                </div>

                <div className="session-meta">
                    <div className="participants-info">
                        {session.participants
                            .filter(p => p.type === 'agent')
                            .map(p => p.name)
                            .join(', ')
                        }
                    </div>
                    {session.messageCount > 0 && (
                        <div className="message-count">
                            {session.messageCount} 条消息
                        </div>
                    )}
                </div>
            </div>

            {/* 右侧状态 */}
            <div className="session-status">
                {session.type === 'group' && (
                    <div className="group-badge" title="群聊">
                        {session.participants.filter(p => p.type === 'agent').length}
                    </div>
                )}
            </div>

            <style jsx>{`
                .session-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    border: 1px solid transparent;
                    position: relative;
                }

                .session-item:hover {
                    background: var(--background-hover);
                    transform: translateY(-1px);
                }

                .session-item.active {
                    background: var(--primary-bg);
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .session-item.pinned {
                    background: rgba(255, 193, 7, 0.05);
                    border-color: rgba(255, 193, 7, 0.2);
                }

                .session-avatar-container {
                    position: relative;
                    flex-shrink: 0;
                }

                .session-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    position: relative;
                }

                .session-avatar.empty {
                    background: var(--background-secondary);
                    color: var(--text-secondary);
                }

                .session-avatar.single {
                    border: 2px solid var(--border-color);
                }

                .session-avatar.group {
                    position: relative;
                    width: 48px;
                    height: 48px;
                }

                .avatar-item {
                    position: absolute;
                    width: 28px;
                    height: 28px;
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    border: 2px solid var(--background);
                    box-shadow: var(--shadow-sm);
                }

                .avatar-item:nth-child(1) {
                    top: 0;
                    left: 0;
                }

                .avatar-item:nth-child(2) {
                    top: 0;
                    right: 0;
                }

                .avatar-item:nth-child(3) {
                    bottom: 0;
                    left: 50%;
                    transform: translateX(-50%);
                }

                .avatar-item.more {
                    background: var(--background-secondary);
                    color: var(--text-secondary);
                    font-size: 10px;
                    font-weight: 600;
                }

                .pin-indicator {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 16px;
                    height: 16px;
                    border-radius: var(--radius-full);
                    background: var(--background);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    box-shadow: var(--shadow-sm);
                }

                .session-info {
                    flex: 1;
                    min-width: 0;
                }

                .session-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .session-name {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    min-width: 0;
                }

                .session-type-icon {
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .session-title {
                    font-weight: 500;
                    color: var(--text-primary);
                    font-size: 14px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .session-time {
                    font-size: 12px;
                    color: var(--text-secondary);
                    flex-shrink: 0;
                }

                .session-preview {
                    margin-bottom: 4px;
                }

                .last-message {
                    font-size: 13px;
                    color: var(--text-secondary);
                    display: block;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .sender {
                    font-weight: 500;
                    color: var(--text-primary);
                }

                .content {
                    margin-left: 4px;
                }

                .no-message {
                    font-size: 13px;
                    color: var(--text-tertiary);
                    font-style: italic;
                }

                .session-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .participants-info {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 150px;
                }

                .message-count {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    flex-shrink: 0;
                }

                .session-status {
                    flex-shrink: 0;
                }

                .group-badge {
                    width: 20px;
                    height: 20px;
                    border-radius: var(--radius-full);
                    background: var(--primary-color);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    font-weight: 600;
                }

                /* 响应式适配 */
                @media (max-width: 640px) {
                    .session-item {
                        padding: 12px;
                    }

                    .session-avatar {
                        width: 40px;
                        height: 40px;
                        font-size: 16px;
                    }

                    .session-meta {
                        display: none;
                    }

                    .participants-info {
                        max-width: 120px;
                    }
                }
            `}</style>
        </div>
    )
}

export default SessionItem 