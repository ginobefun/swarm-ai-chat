'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/contexts/AppContext'
import { Plus, X, Search } from 'lucide-react'
import { aiAgents } from '@/constants/agents'

interface Agent {
    id: string
    name: string
    description: string
    avatar: string
    category: string
}

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
 * 1. 展示可添加的智能体列表
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

    // 获取智能体分类的函数
    const getAgentCategory = (specialty: string): string => {
        const specialtyLower = specialty.toLowerCase()
        if (specialtyLower.includes('分析') || specialtyLower.includes('研究')) {
            return 'analysis'
        } else if (specialtyLower.includes('创意') || specialtyLower.includes('设计')) {
            return 'creative'
        } else if (specialtyLower.includes('技术') || specialtyLower.includes('代码')) {
            return 'technical'
        } else if (specialtyLower.includes('商业') || specialtyLower.includes('市场')) {
            return 'business'
        } else {
            return 'general'
        }
    }

    // 转换 aiAgents 常量为组件需要的格式
    const availableAgents: Agent[] = aiAgents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        avatar: agent.avatar,
        category: getAgentCategory(agent.specialty)
    }))

    // 过滤已添加的智能体和搜索结果
    const filteredAgents = availableAgents.filter(agent => {
        const matchesSearch = !searchQuery ||
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchQuery.toLowerCase())

        const notAlreadyAdded = !currentAgentIds.includes(agent.id)

        return matchesSearch && notAlreadyAdded
    })

    // 按分类分组
    const groupedAgents = filteredAgents.reduce((acc, agent) => {
        const category = agent.category || 'general'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(agent)
        return acc
    }, {} as Record<string, Agent[]>)

    const handleAddAgent = (agentId: string) => {
        onAddAgent(agentId)
        onClose()
    }

    // 分类标题映射
    const categoryTitles: Record<string, string> = {
        analysis: t('agents.category.analysis') || '分析类',
        creative: t('agents.category.creative') || '创意类',
        technical: t('agents.category.technical') || '技术类',
        business: t('agents.category.business') || '商务类',
        general: t('agents.category.general') || '通用类'
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
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 
                                             border border-slate-200 dark:border-slate-600 rounded-xl
                                             text-sm text-slate-900 dark:text-slate-100 
                                             placeholder-slate-500 dark:placeholder-slate-400
                                             focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                             transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* 智能体列表 */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {Object.keys(groupedAgents).length === 0 ? (
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
                                            </h3>

                                            {/* 智能体网格 */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {agents.map((agent) => (
                                                    <motion.div
                                                        key={agent.id}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        className="p-4 border border-slate-200 dark:border-slate-600 
                                                                 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500
                                                                 bg-white dark:bg-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700
                                                                 cursor-pointer transition-all duration-200 group"
                                                        onClick={() => handleAddAgent(agent.id)}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {/* 智能体头像 */}
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 
                                                                          flex items-center justify-center text-white text-lg flex-shrink-0">
                                                                {agent.avatar}
                                                            </div>

                                                            {/* 智能体信息 */}
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                                    {agent.name}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                                    {agent.description}
                                                                </p>
                                                            </div>

                                                            {/* 添加按钮 */}
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 
                                                                              flex items-center justify-center">
                                                                    <Plus className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 底部 */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <Button
                                variant="ghost"
                                onClick={onClose}
                                className="px-6"
                            >
                                {t('common.cancel') || '取消'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default AddAgentDialog 