'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { AIAgent, SkillTag } from '../types'
import AgentDetail from './AgentDetail'

interface AgentDiscoveryProps {
    isOpen?: boolean
    onStartChat?: (agentId: string) => void
    onClose?: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const AgentDiscovery: React.FC<AgentDiscoveryProps> = ({ isOpen = true, onStartChat, onClose }) => {
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
                    throw new Error(`API 错误：${response.status}`)
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
                console.error('获取 AI 角色数据失败：', err)
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
                    throw new Error(`API 错误：${response.status}`)
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
                console.error('获取 AI 角色数据失败：', err)
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
            <div className="p-6 max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            <span className="mr-3">🤖</span>
                            AI 角色中心
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 m-0">
                            发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="mb-6">
                        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg m-0">正在加载 AI 角色数据...</p>
                </div>
            </div>
        )
    }

    // 错误状态
    if (error) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            <span className="mr-3">🤖</span>
                            AI 角色中心
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 m-0">
                            发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                        </p>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="text-5xl mb-4">😵</div>
                    <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">加载失败</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg text-base cursor-pointer transition-colors hover:bg-indigo-700"
                    >
                        重试
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* 页面头部 */}
            <div className="text-center mb-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        <span className="mr-3">🤖</span>
                        AI 角色中心
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 m-0">
                        发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                    </p>
                </div>
            </div>

            {/* 筛选器部分 */}
            <div className="mb-8">
                {/* 搜索框 */}
                <div className="mb-6">
                    <div className="relative max-w-lg mx-auto">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                            🔍
                        </div>
                        <input
                            type="text"
                            placeholder="搜索 AI 角色..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 pl-12 pr-12 border-2 border-slate-200 dark:border-slate-600 rounded-full text-base bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors focus:outline-none focus:border-indigo-600"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-none border-none text-slate-400 cursor-pointer p-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* 筛选标签 */}
                <div className="flex flex-col gap-4 items-center">
                    {/* 专业领域筛选 */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">专业领域</span>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {specialties.map(specialty => (
                                <button
                                    key={specialty}
                                    onClick={() => setSelectedCategory(specialty)}
                                    className={`px-4 py-2 border-2 rounded-full cursor-pointer transition-all text-sm ${selectedCategory === specialty
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                                        }`}
                                >
                                    {specialty === 'all' ? '全部' : specialty}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 技能类别筛选 */}
                    <div className="flex flex-col items-center gap-2">
                        <span className="font-medium text-slate-700 dark:text-slate-300">技能类别</span>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {skillCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedSkillCategory(category as never)}
                                    className={`px-4 py-2 border-2 rounded-full cursor-pointer transition-all text-sm ${selectedSkillCategory === category
                                        ? 'bg-indigo-600 border-indigo-600 text-white'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                                        }`}
                                >
                                    {category === 'all' ? '全部' : category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 结果信息 */}
            {(searchQuery || selectedCategory !== 'all' || selectedSkillCategory !== 'all') && (
                <div className="flex justify-between items-center mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                        找到 {filteredAgents.length} 个 AI 角色
                    </span>
                    <button
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setSelectedSkillCategory('all')
                        }}
                        className="bg-none border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 px-3 py-1.5 rounded-md cursor-pointer text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                        清除所有筛选
                    </button>
                </div>
            )}

            {/* 角色网格 */}
            {filteredAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                    {filteredAgents.map(agent => (
                        <div
                            key={agent.id}
                            onClick={() => handleAgentClick(agent)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-indigo-600"
                        >
                            {/* 卡片头部 */}
                            <div className="flex justify-between items-start mb-4">
                                <div
                                    className="w-15 h-15 rounded-full flex items-center justify-center text-2xl text-white font-bold"
                                    style={{ background: agent.avatarStyle || '#667eea' }}
                                >
                                    {agent.avatar}
                                </div>
                                <div className="relative">
                                    <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${agent.isActive ? 'bg-green-500' : 'bg-slate-400'
                                        }`}></div>
                                </div>
                            </div>

                            {/* 卡片内容 */}
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold mb-1 text-slate-900 dark:text-slate-100">
                                    {agent.name}
                                </h3>
                                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                                    {agent.specialty}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed m-0">
                                    {agent.description}
                                </p>
                            </div>

                            {/* 技能标签 */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {agent.skillTags?.slice(0, 3).map(tag => (
                                    <span
                                        key={tag.id}
                                        className="text-xs px-2 py-1 rounded-full text-slate-700 dark:text-slate-300 font-medium"
                                        style={{ backgroundColor: tag.color || '#f3f4f6' }}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                                {(agent.skillTags?.length || 0) > 3 && (
                                    <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 font-medium">
                                        +{(agent.skillTags?.length || 0) - 3}
                                    </span>
                                )}
                            </div>

                            {/* 卡片底部 */}
                            <div className="flex justify-between items-center">
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                        <span className="text-sm">⭐</span>
                                        {/* {agent.rating || 5.0} */}
                                        5.0
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                        <span className="text-sm">💬</span>
                                        {/* {agent.conversationCount || 0} */}
                                        0
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleStartChat(agent.id)
                                    }}
                                    className="bg-indigo-600 text-white border-none px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors font-medium hover:bg-indigo-700"
                                >
                                    开始对话
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6">
                    <div className="text-6xl mb-4 opacity-50">🔍</div>
                    <h3 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        未找到匹配的 AI 角色
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        尝试调整搜索条件或清除筛选器
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setSelectedSkillCategory('all')
                        }}
                        className="bg-indigo-600 text-white border-none px-6 py-3 rounded-lg text-base cursor-pointer transition-colors hover:bg-indigo-700"
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
        </div>
    )
}

export default AgentDiscovery 