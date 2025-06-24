'use client'

import React, { useState, useEffect } from 'react'
import { CreateSessionDialogProps } from '@/types'

const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({
    isOpen,
    onClose,
    onCreateSession,
    availableAgents
}) => {
    const [selectedAgents, setSelectedAgents] = useState<string[]>([])
    const [sessionTitle, setSessionTitle] = useState('')
    const [sessionDescription, setSessionDescription] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    // 重置表单当对话框打开/关闭时
    useEffect(() => {
        if (isOpen) {
            setSelectedAgents([])
            setSessionTitle('')
            setSessionDescription('')
            setSearchQuery('')
        }
    }, [isOpen])

    // 过滤可用的AI角色
    const filteredAgents = availableAgents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleAgentToggle = (agentId: string) => {
        setSelectedAgents(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        )
    }

    const handleCreate = async () => {
        if (selectedAgents.length === 0) return

        setIsCreating(true)
        try {
            await onCreateSession({
                title: sessionTitle || undefined,
                type: selectedAgents.length === 1 ? 'single' : 'group',
                agentIds: selectedAgents,
                description: sessionDescription || undefined
            })
            onClose()
        } catch (error) {
            console.error('创建会话失败:', error)
        } finally {
            setIsCreating(false)
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="create-session-overlay" onClick={handleBackdropClick}>
            <div className="create-session-dialog">
                {/* 头部 */}
                <div className="dialog-header">
                    <h2 className="dialog-title">
                        <span className="title-icon">💬</span>
                        创建新会话
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* 内容 */}
                <div className="dialog-content">
                    {/* 会话信息 */}
                    <div className="session-info-section">
                        <div className="form-group">
                            <label htmlFor="session-title">会话标题（可选）</label>
                            <input
                                id="session-title"
                                type="text"
                                placeholder="不填写将自动生成"
                                value={sessionTitle}
                                onChange={(e) => setSessionTitle(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="session-description">会话描述（可选）</label>
                            <textarea
                                id="session-description"
                                placeholder="描述这个会话的目的或用途"
                                value={sessionDescription}
                                onChange={(e) => setSessionDescription(e.target.value)}
                                className="form-textarea"
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* AI角色选择 */}
                    <div className="agent-selection-section">
                        <div className="section-header">
                            <h3 className="section-title">
                                选择AI角色 ({selectedAgents.length} 个已选择)
                            </h3>
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="搜索AI角色..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>

                        <div className="agents-grid">
                            {filteredAgents.map(agent => (
                                <div
                                    key={agent.id}
                                    className={`agent-card ${selectedAgents.includes(agent.id) ? 'selected' : ''}`}
                                    onClick={() => handleAgentToggle(agent.id)}
                                >
                                    <div
                                        className="agent-avatar"
                                        style={{ background: agent.avatarStyle }}
                                    >
                                        {agent.avatar}
                                    </div>
                                    <div className="agent-info">
                                        <div className="agent-name">{agent.name}</div>
                                        <div className="agent-specialty">{agent.specialty}</div>
                                    </div>
                                    <div className="selection-indicator">
                                        {selectedAgents.includes(agent.id) ? '✓' : '+'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredAgents.length === 0 && (
                            <div className="empty-state">
                                <span className="empty-icon">🔍</span>
                                <p>未找到匹配的AI角色</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 底部操作 */}
                <div className="dialog-footer">
                    <button
                        className="btn-secondary"
                        onClick={onClose}
                        disabled={isCreating}
                    >
                        取消
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleCreate}
                        disabled={selectedAgents.length === 0 || isCreating}
                    >
                        {isCreating ? (
                            <>
                                <span className="loading-spinner"></span>
                                创建中...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">💬</span>
                                创建会话
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .create-session-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .create-session-dialog {
                    background: var(--background);
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 720px;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: var(--shadow-xl);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                }

                .dialog-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid var(--border-color);
                }

                .dialog-title {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .title-icon {
                    font-size: 20px;
                }

                .close-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-full);
                    border: 1px solid var(--border-color);
                    background: var(--background);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .close-btn:hover {
                    background: var(--background-hover);
                    color: var(--text-primary);
                }

                .dialog-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .session-info-section {
                    margin-bottom: 32px;
                }

                .form-group {
                    margin-bottom: 20px;
                }

                .form-group label {
                    display: block;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .form-input, .form-textarea {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--background);
                    color: var(--text-primary);
                    font-size: 14px;
                    transition: all var(--transition-fast);
                }

                .form-input:focus, .form-textarea:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .form-textarea {
                    resize: vertical;
                    min-height: 60px;
                }

                .agent-selection-section {
                    border-top: 1px solid var(--border-color);
                    padding-top: 24px;
                }

                .section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 16px;
                }

                .section-title {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .search-box {
                    flex: 0 0 240px;
                }

                .search-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--background);
                    color: var(--text-primary);
                    font-size: 14px;
                }

                .agents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 12px;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .agent-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    background: var(--background);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .agent-card:hover {
                    background: var(--background-hover);
                    transform: translateY(-1px);
                }

                .agent-card.selected {
                    border-color: var(--primary-color);
                    background: rgba(99, 102, 241, 0.05);
                }

                .agent-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .agent-info {
                    flex: 1;
                    min-width: 0;
                }

                .agent-name {
                    font-weight: 500;
                    color: var(--text-primary);
                    font-size: 14px;
                    margin-bottom: 2px;
                }

                .agent-specialty {
                    font-size: 12px;
                    color: var(--text-secondary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .selection-indicator {
                    width: 24px;
                    height: 24px;
                    border-radius: var(--radius-full);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    font-weight: 600;
                    flex-shrink: 0;
                }

                .agent-card.selected .selection-indicator {
                    background: var(--primary-color);
                    color: white;
                }

                .agent-card:not(.selected) .selection-indicator {
                    border: 2px solid var(--border-color);
                    color: var(--text-secondary);
                }

                .empty-state {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-secondary);
                }

                .empty-icon {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 12px;
                }

                .dialog-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 20px 24px;
                    border-top: 1px solid var(--border-color);
                }

                .btn-secondary, .btn-primary {
                    padding: 12px 24px;
                    border-radius: var(--radius-md);
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }

                .btn-secondary {
                    background: var(--background);
                    color: var(--text-primary);
                    border: 1px solid var(--border-color);
                }

                .btn-secondary:hover:not(:disabled) {
                    background: var(--background-hover);
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                    border: 1px solid var(--primary-color);
                }

                .btn-primary:hover:not(:disabled) {
                    background: var(--primary-color-hover);
                }

                .btn-primary:disabled, .btn-secondary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-top: 2px solid white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (max-width: 640px) {
                    .create-session-dialog {
                        max-width: 100%;
                        margin: 0;
                        height: 100vh;
                        border-radius: 0;
                    }

                    .section-header {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }

                    .search-box {
                        flex: none;
                    }

                    .agents-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default CreateSessionDialog 