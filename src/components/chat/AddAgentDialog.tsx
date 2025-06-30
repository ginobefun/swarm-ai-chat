'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/contexts/AppContext'
import { Plus, X, Search, Loader2 } from 'lucide-react'
import { databaseConfigAdapter, type LegacyAgent } from '@/lib/services/DatabaseConfigAdapter'

interface AddAgentDialogProps {
    isOpen: boolean
    onClose: () => void
    onAddAgent: (agentId: string) => void
    currentAgentIds: string[]
    className?: string
}

/**
 * 添加智能体弹窗组件
 * 
 * 功能：
 * 1. 展示可添加的智能体列表（从数据库加载）
 * 2. 搜索过滤功能
 * 3. 分类展示
 * 4. 防止重复添加
 */
const AddAgentDialog: React.FC<AddAgentDialogProps> = ({
    isOpen,
    onClose,
    onAddAgent,
    currentAgentIds,
    className = ""
}) => {
    const { t } = useTranslation()
    const [searchQuery, setSearchQuery] = useState('')
    const [availableAgents, setAvailableAgents] = useState<LegacyAgent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>('')

    const loadAgents = useCallback(async () => {
        setIsLoading(true)
        setError('')
        try {
            const agents = await databaseConfigAdapter.getAgents()
            setAvailableAgents(agents)
            console.log('📊 Loaded agents for dialog:', agents.length)
        } catch (error) {
            console.error('Error loading agents:', error)
            setError(t('chat.failedToLoadAgents') || 'Failed to load agents')
        } finally {
            setIsLoading(false)
        }
    }, [t])

    // Load agents from database when dialog opens
    useEffect(() => {
        if (isOpen) {
            loadAgents()
        }
    }, [isOpen, loadAgents])

    // 获取智能体分类的函数
    const getAgentCategory = (category: string): string => {
        return category.toLowerCase()
    }

    // 过滤已添加的智能体和搜索结果
    const filteredAgents = availableAgents.filter(agent => {
        const matchesSearch = !searchQuery ||
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const notAlreadyAdded = !currentAgentIds.includes(agent.id)

        return matchesSearch && notAlreadyAdded
    })

    // 按分类分组
    const groupedAgents = filteredAgents.reduce((acc, agent) => {
        const category = getAgentCategory(agent.category) || 'general'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(agent)
        return acc
    }, {} as Record<string, LegacyAgent[]>)

    const handleAddAgent = (agentId: string) => {
        onAddAgent(agentId)
        onClose()
    }

    // 分类标题映射
    const categoryTitles: Record<string, string> = {
        analysis: t('agents.category.analysis') || '分析类',
        creative: t('agents.category.creative') || '创意类',
        coding: t('agents.category.coding') || '编程类',
        research: t('agents.category.research') || '研究类',
        business: t('agents.category.business') || '商务类',
        education: t('agents.category.education') || '教育类',
        general: t('agents.category.general') || '通用类',
        specialized: t('agents.category.specialized') || '专业类'
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* 背景遮罩 */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* 弹窗内容 */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                   w-full max-w-2xl max-h-[80vh] bg-white dark:bg-slate-800 
                                   rounded-2xl shadow-2xl z-50 overflow-hidden ${className}`}
                    >
                        {/* 头部 */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                        {t('chat.addAgent') || '添加智能体'}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {t('chat.addAgentDesc') || '选择专业的 AI 智能体加入对话'}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="h-8 w-8 p-0 rounded-full"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* 搜索栏 */}
                        <div className="p-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={t('session.searchAgents') || '搜索智能体...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 
                                             border border-slate-200 dark:border-slate-600 rounded-xl
                                             text-sm text-slate-900 dark:text-slate-100 
                                             placeholder-slate-500 dark:placeholder-slate-400
                                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* 智能体列表 */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                                        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        {t('common.loading') || '加载中...'}
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                        <X className="w-6 h-6 text-red-500" />
                                    </div>
                                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={loadAgents}
                                        className="text-sm"
                                    >
                                        {t('common.retry') || '重试'}
                                    </Button>
                                </div>
                            ) : Object.keys(groupedAgents).length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        {searchQuery ?
                                            (t('session.noAgentsFound') || '未找到匹配的智能体') :
                                            (t('session.allAgentsAdded') || '所有智能体都已添加')
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {Object.entries(groupedAgents).map(([category, agents]) => (
                                        <div key={category}>
                                            {/* 分类标题 */}
                                            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                                {categoryTitles[category] || category}
                                                <span className="ml-2 text-xs text-slate-500">({agents.length})</span>
                                            </h3>

                                            {/* 智能体网格 */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {agents.map((agent) => (
                                                    <motion.div
                                                        key={agent.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="group p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 cursor-pointer"
                                                        onClick={() => handleAddAgent(agent.id)}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* 智能体头像 */}
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                                                                {agent.avatar}
                                                            </div>

                                                            {/* 智能体信息 */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm mb-1 truncate">
                                                                    {agent.name}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                                    {agent.description}
                                                                </p>
                                                                {agent.tags && agent.tags.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                                        {agent.tags.slice(0, 3).map((tag, index) => (
                                                                            <span key={index} className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-600 text-xs text-slate-600 dark:text-slate-300 rounded">
                                                                                {tag}
                                                                            </span>
                                                                        ))}
                                                                        {agent.tags.length > 3 && (
                                                                            <span className="text-xs text-slate-400">+{agent.tags.length - 3}</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* 添加按钮 */}
                                                            <motion.div
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                            >
                                                                <Plus className="w-3 h-3 text-white" />
                                                            </motion.div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AddAgentDialog 