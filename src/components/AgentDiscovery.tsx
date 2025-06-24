'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { AIAgent, SkillTag } from '../types'
import AgentDetail from './AgentDetail'

interface AgentDiscoveryProps {
    onStartChat?: (agentId: string) => void
}

const AgentDiscovery: React.FC<AgentDiscoveryProps> = ({ onStartChat }) => {
    const [agents, setAgents] = useState<AIAgent[]>([])
    const [skillTags, setSkillTags] = useState<SkillTag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedSkillCategory, setSelectedSkillCategory] = useState<'all' | 'core' | 'tool' | 'domain'>('all')

    // 从 API 获取数据
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('/api/agents')
                if (!response.ok) {
                    throw new Error(`API 错误: ${response.status}`)
                }

                const data = await response.json()

                if (data.success) {
                    setAgents(data.agents || [])

                    // 从代理数据中提取技能标签
                    const allSkillTags: SkillTag[] = []
                    const seenTags = new Set<string>()

                    data.agents?.forEach((agent: AIAgent) => {
                        agent.skillTags?.forEach((tag: SkillTag) => {
                            if (!seenTags.has(tag.id)) {
                                seenTags.add(tag.id)
                                allSkillTags.push(tag)
                            }
                        })
                    })

                    setSkillTags(allSkillTags)
                } else {
                    throw new Error(data.message || '获取数据失败')
                }
            } catch (err) {
                console.error('获取 AI 角色数据失败:', err)
                setError(err instanceof Error ? err.message : '获取数据失败')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // 获取所有技能类别
    const skillCategories = useMemo(() => {
        const categories = new Set(['all'])
        skillTags.forEach(tag => categories.add(tag.category))
        return Array.from(categories)
    }, [skillTags])

    // 获取所有专业领域
    const specialties = useMemo(() => {
        const specs = new Set(['all'])
        agents.forEach(agent => specs.add(agent.specialty))
        return Array.from(specs)
    }, [agents])

    // 过滤角色
    const filteredAgents = useMemo(() => {
        return agents.filter(agent => {
            // 搜索过滤
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const matchesSearch =
                    agent.name.toLowerCase().includes(query) ||
                    agent.description.toLowerCase().includes(query) ||
                    agent.specialty.toLowerCase().includes(query) ||
                    (agent.skillTags?.some(tag => tag.name.toLowerCase().includes(query)) || false)

                if (!matchesSearch) return false
            }

            // 专业领域过滤
            if (selectedCategory !== 'all' && agent.specialty !== selectedCategory) {
                return false
            }

            // 技能类别过滤
            if (selectedSkillCategory !== 'all') {
                const hasSkillInCategory = agent.skillTags?.some(tag => tag.category === selectedSkillCategory) || false
                if (!hasSkillInCategory) return false
            }

            return true
        })
    }, [agents, searchQuery, selectedCategory, selectedSkillCategory])

    const handleAgentClick = (agent: AIAgent) => {
        setSelectedAgent(agent)
        setIsDetailOpen(true)
    }

    const handleCloseDetail = () => {
        setIsDetailOpen(false)
        setSelectedAgent(null)
    }

    const handleStartChat = (agentId: string) => {
        if (onStartChat) {
            onStartChat(agentId)
        }
    }

    // 重试函数
    const handleRetry = () => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await fetch('/api/agents')
                if (!response.ok) {
                    throw new Error(`API 错误: ${response.status}`)
                }

                const data = await response.json()

                if (data.success) {
                    setAgents(data.agents || [])

                    // 从代理数据中提取技能标签
                    const allSkillTags: SkillTag[] = []
                    const seenTags = new Set<string>()

                    data.agents?.forEach((agent: AIAgent) => {
                        agent.skillTags?.forEach((tag: SkillTag) => {
                            if (!seenTags.has(tag.id)) {
                                seenTags.add(tag.id)
                                allSkillTags.push(tag)
                            }
                        })
                    })

                    setSkillTags(allSkillTags)
                } else {
                    throw new Error(data.message || '获取数据失败')
                }
            } catch (err) {
                console.error('获取 AI 角色数据失败:', err)
                setError(err instanceof Error ? err.message : '获取数据失败')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }

    // 加载状态
    if (loading) {
        return (
            <div className="agent-discovery">
                <div className="discovery-header">
                    <div className="header-content">
                        <h1 className="page-title">
                            <span className="title-icon">🤖</span>
                            AI 角色中心
                        </h1>
                        <p className="page-subtitle">
                            发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                        </p>
                    </div>
                </div>

                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                    <p className="loading-text">正在加载 AI 角色数据...</p>
                </div>
            </div>
        )
    }

    // 错误状态
    if (error) {
        return (
            <div className="agent-discovery">
                <div className="discovery-header">
                    <div className="header-content">
                        <h1 className="page-title">
                            <span className="title-icon">🤖</span>
                            AI 角色中心
                        </h1>
                        <p className="page-subtitle">
                            发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                        </p>
                    </div>
                </div>

                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3 className="error-title">加载失败</h3>
                    <p className="error-message">{error}</p>
                    <button
                        className="retry-button"
                        onClick={handleRetry}
                    >
                        重试
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="agent-discovery">
            {/* 头部 */}
            <div className="discovery-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <span className="title-icon">🤖</span>
                        AI 角色中心
                    </h1>
                    <p className="page-subtitle">
                        发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                    </p>
                </div>
            </div>

            {/* 搜索和过滤 */}
            <div className="filters-section">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="搜索角色、技能或专业领域..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                className="clear-search"
                                onClick={() => setSearchQuery('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="filter-tabs">
                    <div className="filter-group">
                        <label className="filter-label">专业领域：</label>
                        <div className="tabs">
                            {specialties.map(specialty => (
                                <button
                                    key={specialty}
                                    className={`tab ${selectedCategory === specialty ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(specialty)}
                                >
                                    {specialty === 'all' ? '全部' : specialty}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">技能类型：</label>
                        <div className="tabs">
                            {skillCategories.map(category => (
                                <button
                                    key={category}
                                    className={`tab ${selectedSkillCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedSkillCategory(category as 'all' | 'core' | 'tool' | 'domain')}
                                >
                                    {category === 'all' ? '全部' :
                                        category === 'core' ? '核心能力' :
                                            category === 'tool' ? '工具能力' : '领域专长'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 结果统计 */}
            <div className="results-info">
                <span className="results-count">
                    找到 {filteredAgents.length} 个 AI 角色
                </span>
                {(searchQuery || selectedCategory !== 'all' || selectedSkillCategory !== 'all') && (
                    <button
                        className="clear-filters"
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setSelectedSkillCategory('all')
                        }}
                    >
                        清除筛选
                    </button>
                )}
            </div>

            {/* 角色网格 */}
            <div className="agents-grid">
                {filteredAgents.map(agent => (
                    <div
                        key={agent.id}
                        className="agent-card"
                        onClick={() => handleAgentClick(agent)}
                    >
                        <div className="agent-card-header">
                            <div
                                className="agent-avatar"
                                style={{ background: agent.avatarStyle }}
                            >
                                {agent.avatar}
                            </div>
                            <div className="agent-status">
                                <span className={`status-dot ${agent.isActive ? 'active' : 'inactive'}`} />
                            </div>
                        </div>

                        <div className="agent-card-content">
                            <h3 className="agent-name">{agent.name}</h3>
                            <p className="agent-specialty">{agent.specialty}</p>
                            <p className="agent-description">{agent.description}</p>
                        </div>

                        <div className="agent-card-tags">
                            {agent.skillTags?.slice(0, 3).map(tag => (
                                <span
                                    key={tag.id}
                                    className="skill-tag"
                                    style={{ backgroundColor: tag.color || '#f0f0f0' }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                            {(agent.skillTags?.length || 0) > 3 && (
                                <span className="tag-more">+{(agent.skillTags?.length || 0) - 3}</span>
                            )}
                        </div>

                        <div className="agent-card-footer">
                            <div className="agent-stats">
                                <span className="stat">
                                    <span className="stat-icon">💬</span>
                                    {agent.conversationStarters?.length || 0} 个话题
                                </span>
                                <span className="stat">
                                    <span className="stat-icon">🔧</span>
                                    {agent.tools?.length || 0} 个工具
                                </span>
                            </div>
                            <button
                                className="start-chat-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartChat(agent.id)
                                }}
                            >
                                开始对话
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 无结果状态 */}
            {filteredAgents.length === 0 && !loading && (
                <div className="no-results">
                    <div className="no-results-icon">🤖</div>
                    <h3 className="no-results-title">未找到匹配的角色</h3>
                    <p className="no-results-message">
                        尝试调整搜索关键词或筛选条件
                    </p>
                    <button
                        className="clear-filters"
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setSelectedSkillCategory('all')
                        }}
                    >
                        清除所有筛选
                    </button>
                </div>
            )}

            {/* 角色详情弹窗 */}
            {isDetailOpen && selectedAgent && (
                <AgentDetail
                    agent={selectedAgent}
                    isOpen={isDetailOpen}
                    onClose={handleCloseDetail}
                    onStartChat={handleStartChat}
                />
            )}

            <style jsx>{`
                .agent-discovery {
                    padding: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .discovery-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .header-content {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .title-icon {
                    margin-right: 12px;
                }

                .page-subtitle {
                    font-size: 1.1rem;
                    color: #6b7280;
                    margin: 0;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                }

                .loading-spinner {
                    margin-bottom: 24px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-text {
                    color: #6b7280;
                    font-size: 1.1rem;
                    margin: 0;
                }

                .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                    text-align: center;
                }

                .error-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .error-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #ef4444;
                    margin-bottom: 8px;
                }

                .error-message {
                    color: #6b7280;
                    margin-bottom: 24px;
                }

                .retry-button {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .retry-button:hover {
                    background: #5a67d8;
                }

                .filters-section {
                    margin-bottom: 32px;
                }

                .search-container {
                    margin-bottom: 24px;
                }

                .search-input-wrapper {
                    position: relative;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                }

                .search-input {
                    width: 100%;
                    padding: 12px 16px 12px 48px;
                    border: 2px solid #e5e7eb;
                    border-radius: 25px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .clear-search {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px;
                }

                .filter-tabs {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    align-items: center;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .filter-label {
                    font-weight: 500;
                    color: #374151;
                }

                .tabs {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .tab {
                    padding: 8px 16px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }

                .tab:hover {
                    border-color: #d1d5db;
                }

                .tab.active {
                    background: #667eea;
                    border-color: #667eea;
                    color: white;
                }

                .results-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .results-count {
                    font-weight: 500;
                    color: #374151;
                }

                .clear-filters {
                    background: none;
                    border: 1px solid #d1d5db;
                    color: #6b7280;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .clear-filters:hover {
                    background: #f3f4f6;
                }

                .agents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .agent-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .agent-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border-color: #667eea;
                }

                .agent-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }

                .agent-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                    font-weight: bold;
                }

                .agent-status {
                    position: relative;
                }

                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 0 1px #e5e7eb;
                }

                .status-dot.active {
                    background: #10b981;
                }

                .status-dot.inactive {
                    background: #6b7280;
                }

                .agent-card-content {
                    margin-bottom: 16px;
                }

                .agent-name {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #1f2937;
                }

                .agent-specialty {
                    font-size: 0.9rem;
                    color: #667eea;
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .agent-description {
                    font-size: 0.9rem;
                    color: #6b7280;
                    line-height: 1.4;
                    margin: 0;
                }

                .agent-card-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-bottom: 16px;
                }

                .skill-tag {
                    font-size: 0.75rem;
                    padding: 4px 8px;
                    border-radius: 12px;
                    color: #374151;
                    font-weight: 500;
                }

                .tag-more {
                    font-size: 0.75rem;
                    padding: 4px 8px;
                    background: #f3f4f6;
                    border-radius: 12px;
                    color: #6b7280;
                    font-weight: 500;
                }

                .agent-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .agent-stats {
                    display: flex;
                    gap: 12px;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .stat-icon {
                    font-size: 0.9rem;
                }

                .start-chat-btn {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-weight: 500;
                }

                .start-chat-btn:hover {
                    background: #5a67d8;
                }

                .no-results {
                    text-align: center;
                    padding: 64px 24px;
                }

                .no-results-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .no-results-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                }

                .no-results-message {
                    color: #6b7280;
                    margin-bottom: 24px;
                }

                @media (max-width: 768px) {
                    .agent-discovery {
                        padding: 16px;
                    }

                    .page-title {
                        font-size: 2rem;
                    }

                    .filter-tabs {
                        align-items: stretch;
                    }

                    .filter-group {
                        align-items: stretch;
                    }

                    .tabs {
                        justify-content: flex-start;
                    }

                    .results-info {
                        flex-direction: column;
                        gap: 12px;
                        align-items: stretch;
                    }

                    .agents-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default AgentDiscovery 