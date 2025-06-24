'use client'

import React, { useState, useEffect } from 'react'
import { Session, SessionFilter, SessionAction, AIAgent, CreateSessionRequest } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import SessionItem from './SessionItem'
import SessionContextMenu from './SessionContextMenu'
import CreateSessionDialog from './CreateSessionDialog'

interface SessionListProps {
    onSessionSelect: (sessionId: string) => void
    activeSessionId?: string
}

const SessionList: React.FC<SessionListProps> = ({
    onSessionSelect,
    activeSessionId
}) => {
    // const { t } = useTranslation()
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<SessionFilter>({ type: 'all' })
    const [sessionGroups, setSessionGroups] = useState<{
        pinned: Session[]
        recent: Session[]
        byAgent: Record<string, Session[]>
    }>({
        pinned: [],
        recent: [],
        byAgent: {}
    })

    // 右键菜单状态
    const [contextMenu, setContextMenu] = useState<{
        session: Session | null
        position: { x: number; y: number }
        isOpen: boolean
    }>({
        session: null,
        position: { x: 0, y: 0 },
        isOpen: false
    })

    // 创建会话对话框状态
    const [createDialog, setCreateDialog] = useState({
        isOpen: false,
        availableAgents: [] as AIAgent[]
    })

    // 获取会话列表
    const fetchSessions = async () => {
        try {
            setLoading(true)
            const queryParams = new URLSearchParams()
            if (filter.type && filter.type !== 'all') queryParams.set('type', filter.type)
            if (filter.pinned !== undefined) queryParams.set('pinned', filter.pinned.toString())
            if (filter.agentId) queryParams.set('agentId', filter.agentId)
            if (searchQuery) queryParams.set('q', searchQuery)

            const response = await fetch(`/api/sessions?${queryParams}`)
            if (!response.ok) {
                throw new Error('Failed to fetch sessions')
            }

            const data = await response.json()
            if (data.success) {
                setSessions(data.sessions)
                setSessionGroups(data.groups)
            } else {
                throw new Error(data.error || 'Failed to fetch sessions')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }

    // 获取可用的AI角色
    const fetchAgents = async () => {
        try {
            const response = await fetch('/api/agents')
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setCreateDialog(prev => ({ ...prev, availableAgents: data.agents }))
                }
            }
        } catch (error) {
            console.error('Error fetching agents:', error)
        }
    }

    useEffect(() => {
        fetchSessions()
        fetchAgents()
    }, [filter, searchQuery])

    // 处理会话右键菜单
    const handleContextMenu = (e: React.MouseEvent, session: Session) => {
        e.preventDefault()
        setContextMenu({
            session,
            position: { x: e.clientX, y: e.clientY },
            isOpen: true
        })
    }

    // 处理会话操作
    const handleSessionAction = async (action: SessionAction) => {
        if (!contextMenu.session) return

        try {
            const sessionId = contextMenu.session.id

            switch (action) {
                case 'rename':
                    const newTitle = prompt('请输入新的会话名称:', contextMenu.session.title)
                    if (newTitle && newTitle !== contextMenu.session.title) {
                        await updateSession(sessionId, { title: newTitle })
                    }
                    break

                case 'pin':
                case 'unpin':
                    await updateSession(sessionId, { isPinned: action === 'pin' })
                    break

                case 'archive':
                    await updateSession(sessionId, { isArchived: true })
                    break

                case 'delete':
                    if (confirm('确定要删除这个会话吗？此操作不可撤销。')) {
                        await deleteSession(sessionId)
                    }
                    break

                case 'duplicate':
                    await duplicateSession(contextMenu.session)
                    break

                default:
                    console.warn('Unknown action:', action)
            }
        } catch (error) {
            console.error('Error handling session action:', error)
            alert('操作失败，请稍后重试')
        }
    }

    // 更新会话
    const updateSession = async (sessionId: string, updates: any) => {
        const response = await fetch(`/api/sessions?id=${sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        })

        if (!response.ok) {
            throw new Error('Failed to update session')
        }

        await fetchSessions() // 刷新列表
    }

    // 删除会话
    const deleteSession = async (sessionId: string) => {
        const response = await fetch(`/api/sessions?id=${sessionId}`, {
            method: 'DELETE'
        })

        if (!response.ok) {
            throw new Error('Failed to delete session')
        }

        await fetchSessions() // 刷新列表
    }

    // 复制会话
    const duplicateSession = async (session: Session) => {
        const agentIds = session.participants
            .filter(p => p.type === 'agent')
            .map(p => p.id)

        await createSession({
            title: `${session.title} (副本)`,
            type: session.type,
            agentIds,
            description: session.description
        })
    }

    // 创建会话
    const createSession = async (request: CreateSessionRequest) => {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        })

        if (!response.ok) {
            throw new Error('Failed to create session')
        }

        const data = await response.json()
        if (data.success) {
            await fetchSessions() // 刷新列表
            onSessionSelect(data.session.id) // 切换到新会话
        } else {
            throw new Error(data.error || 'Failed to create session')
        }
    }

    // 渲染会话分组
    const renderSessionGroup = (title: string, icon: string, sessions: Session[]) => {
        if (sessions.length === 0) return null

        return (
            <div className="session-group">
                <div className="group-header">
                    <span className="group-icon">{icon}</span>
                    <span className="group-title">{title}</span>
                    <span className="group-count">({sessions.length})</span>
                </div>
                <div className="group-sessions">
                    {sessions.map(session => (
                        <SessionItem
                            key={session.id}
                            session={session}
                            isActive={session.id === activeSessionId}
                            onSelect={onSessionSelect}
                            onContextMenu={handleContextMenu}
                        />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="session-list">
            {/* 顶部工具栏 */}
            <div className="session-toolbar">
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="搜索会话..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filter-section">
                    <select
                        value={filter.type || 'all'}
                        onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as any }))}
                        className="filter-select"
                    >
                        <option value="all">全部会话</option>
                        <option value="single">单聊</option>
                        <option value="group">群聊</option>
                    </select>
                </div>

                <div className="action-section">
                    <button
                        className="create-session-btn"
                        onClick={() => setCreateDialog(prev => ({ ...prev, isOpen: true }))}
                        title="创建新会话"
                    >
                        <span className="btn-icon">➕</span>
                        <span className="btn-text">新建会话</span>
                    </button>
                </div>
            </div>

            {/* 会话列表内容 */}
            <div className="session-content">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>加载会话中...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <span className="error-icon">⚠️</span>
                        <p className="error-message">{error}</p>
                        <button className="retry-btn" onClick={fetchSessions}>
                            重试
                        </button>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">💬</span>
                        <h3>还没有会话</h3>
                        <p>点击「新建会话」开始与AI角色对话</p>
                        <button
                            className="create-first-session-btn"
                            onClick={() => setCreateDialog(prev => ({ ...prev, isOpen: true }))}
                        >
                            创建第一个会话
                        </button>
                    </div>
                ) : (
                    <div className="session-groups">
                        {renderSessionGroup('置顶会话', '📌', sessionGroups.pinned)}
                        {renderSessionGroup('最近会话', '🕒', sessionGroups.recent)}
                    </div>
                )}
            </div>

            {/* 右键菜单 */}
            {contextMenu.session && (
                <SessionContextMenu
                    session={contextMenu.session}
                    isOpen={contextMenu.isOpen}
                    position={contextMenu.position}
                    onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
                    onAction={handleSessionAction}
                />
            )}

            {/* 创建会话对话框 */}
            <CreateSessionDialog
                isOpen={createDialog.isOpen}
                onClose={() => setCreateDialog(prev => ({ ...prev, isOpen: false }))}
                onCreateSession={createSession}
                availableAgents={createDialog.availableAgents}
            />

            <style jsx>{`
                .session-list {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    background: var(--background);
                }

                .session-toolbar {
                    padding: 16px;
                    border-bottom: 1px solid var(--border-color);
                    background: var(--background-secondary);
                }

                .search-section {
                    margin-bottom: 12px;
                }

                .search-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--background);
                    color: var(--text-primary);
                    font-size: 14px;
                    transition: all var(--transition-fast);
                }

                .search-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .filter-section {
                    margin-bottom: 12px;
                }

                .filter-select {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--background);
                    color: var(--text-primary);
                    font-size: 14px;
                    cursor: pointer;
                }

                .action-section {
                    display: flex;
                    gap: 8px;
                }

                .create-session-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .create-session-btn:hover {
                    background: var(--primary-color-hover);
                    transform: translateY(-1px);
                }

                .btn-icon {
                    font-size: 16px;
                }

                .btn-text {
                    font-size: 14px;
                }

                .session-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .session-groups {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .session-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .group-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    color: var(--text-secondary);
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .group-icon {
                    font-size: 14px;
                }

                .group-title {
                    flex: 1;
                }

                .group-count {
                    color: var(--text-tertiary);
                }

                .group-sessions {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                /* 状态样式 */
                .loading-state, .error-state, .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-secondary);
                }

                .loading-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid var(--border-color);
                    border-top: 3px solid var(--primary-color);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 16px;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .error-message {
                    margin-bottom: 16px;
                    color: var(--danger-color);
                }

                .retry-btn {
                    padding: 8px 16px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                }

                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }

                .empty-state h3 {
                    margin: 0 0 8px 0;
                    color: var(--text-primary);
                    font-size: 18px;
                }

                .empty-state p {
                    margin: 0 0 20px 0;
                    color: var(--text-secondary);
                }

                .create-first-session-btn {
                    padding: 12px 24px;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .create-first-session-btn:hover {
                    background: var(--primary-color-hover);
                }

                /* 响应式适配 */
                @media (max-width: 640px) {
                    .session-toolbar {
                        padding: 12px;
                    }

                    .session-content {
                        padding: 12px;
                    }

                    .btn-text {
                        display: none;
                    }
                }
            `}</style>
        </div>
    )
}

export default SessionList 