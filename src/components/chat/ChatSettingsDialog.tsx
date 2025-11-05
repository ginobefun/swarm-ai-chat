'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/contexts/AppContext'
import { Settings, X, Users, MessageSquare, Archive, Trash2, Edit3 } from 'lucide-react'
import { Session } from '@/types'

interface ChatSettingsDialogProps {
    isOpen: boolean
    onClose: () => void
    session: Session
    onUpdateSession?: (sessionId: string, updates: Partial<Session>) => void
    onDeleteSession?: (sessionId: string) => void
    className?: string
}

/**
 * 聊天设置弹窗组件
 * 
 * 功能：
 * 1. 会话基本信息管理
 * 2. 参与者管理
 * 3. 会话操作（重命名、归档、删除）
 * 4. 聊天偏好设置
 */
const ChatSettingsDialog: React.FC<ChatSettingsDialogProps> = ({
    isOpen,
    onClose,
    session,
    onUpdateSession,
    onDeleteSession,
    className = ""
}) => {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<'info' | 'participants' | 'preferences'>('info')
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(session?.title || '')
    const [editDescription, setEditDescription] = useState(session?.description || '')

    // 标签页配置
    const tabs = [
        {
            id: 'info' as const,
            label: t('chat.sessionInfo') || '会话信息',
            icon: MessageSquare
        },
        {
            id: 'participants' as const,
            label: t('chat.participants') || '参与者',
            icon: Users
        },
        {
            id: 'preferences' as const,
            label: t('chat.preferences') || '偏好设置',
            icon: Settings
        }
    ]

    // 保存会话信息
    const handleSaveInfo = () => {
        if (onUpdateSession && session) {
            onUpdateSession(session.id, {
                title: editTitle.trim() || '未命名会话',
                description: editDescription.trim()
            })
        }
        setIsEditing(false)
    }

    // 取消编辑
    const handleCancelEdit = () => {
        setEditTitle(session?.title || '')
        setEditDescription(session?.description || '')
        setIsEditing(false)
    }

    // 删除会话
    const handleDeleteSession = () => {
        if (onDeleteSession && session && confirm(t('session.confirmDelete') || '确定要删除这个会话吗？')) {
            onDeleteSession(session.id)
            onClose()
        }
    }

    // 归档会话
    const handleArchiveSession = () => {
        if (onUpdateSession && session) {
            onUpdateSession(session.id, {
                isArchived: !session.isArchived
            })
        }
    }

    if (!session) return null

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
                                   w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-800 
                                   rounded-2xl shadow-2xl z-50 overflow-hidden ${className}`}
                    >
                        {/* 头部 */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                        {t('chat.chatSettings') || '聊天设置'}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {session.title}
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

                        {/* 标签页导航 */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                                              ${activeTab === tab.id
                                            ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* 内容区域 */}
                        <div className="flex-1 overflow-y-auto">
                            {/* 会话信息标签页 */}
                            {activeTab === 'info' && (
                                <div className="p-6 space-y-6">
                                    {/* 基本信息 */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                            {t('chat.basicInfo') || '基本信息'}
                                        </h3>

                                        {/* 会话标题 */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('session.sessionTitle') || '会话标题'}
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 
                                                             rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                                                             focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    placeholder={t('session.enterSessionName') || '请输入会话名称'}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                    <span className="text-slate-900 dark:text-slate-100">{session.title}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setIsEditing(true)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        <Edit3 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* 会话描述 */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                {t('session.description') || '描述'}
                                            </label>
                                            {isEditing ? (
                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 
                                                             rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100
                                                             focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                                    placeholder={t('session.enterDescription') || '请输入描述（可选）'}
                                                />
                                            ) : (
                                                <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg min-h-[80px]">
                                                    <span className="text-slate-600 dark:text-slate-400">
                                                        {session.description || t('session.noDescription') || '暂无描述'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* 编辑按钮 */}
                                        {isEditing && (
                                            <div className="flex gap-3">
                                                <Button onClick={handleSaveInfo} className="flex-1">
                                                    {t('common.save') || '保存'}
                                                </Button>
                                                <Button variant="outline" onClick={handleCancelEdit} className="flex-1">
                                                    {t('common.cancel') || '取消'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* 会话统计 */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                            {t('chat.statistics') || '统计信息'}
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                                    {session.messageCount || 0}
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {t('chat.messages') || '消息数'}
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                    {session.participants?.length || 0}
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {t('chat.participants') || '参与者'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 参与者标签页 */}
                            {activeTab === 'participants' && (
                                <div className="p-6 space-y-4">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                        {t('chat.currentParticipants') || '当前参与者'}
                                    </h3>

                                    <div className="space-y-3">
                                        {session.participants?.map((participant) => (
                                            <div key={participant.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm">
                                                    {participant.avatar || (participant.type === 'user' ? '👤' : '🤖')}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-slate-900 dark:text-slate-100">
                                                        {participant.name}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {participant.type === 'user' ? t('chat.user') : t('chat.aiAgent')}
                                                    </div>
                                                </div>
                                                {participant.type === 'agent' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 偏好设置标签页 */}
                            {activeTab === 'preferences' && (
                                <div className="p-6 space-y-6">
                                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
                                        {t('chat.chatPreferences') || '聊天偏好'}
                                    </h3>

                                    {/* 编排模式选择 */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                                {t('chat.orchestrationMode') || '协作模式'}
                                            </label>
                                            <div className="space-y-3">
                                                {/* DYNAMIC 模式 */}
                                                <div
                                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${session.configuration?.orchestrationMode === 'DYNAMIC' || !session.configuration?.orchestrationMode
                                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                    onClick={() => {
                                                        if (onUpdateSession) {
                                                            onUpdateSession(session.id, {
                                                                configuration: {
                                                                    ...session.configuration,
                                                                    orchestrationMode: 'DYNAMIC'
                                                                }
                                                            })
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                                                            🤖
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                                                {t('chat.dynamicMode') || '智能决策模式 (DYNAMIC)'}
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {t('chat.dynamicModeDesc') || 'AI 自动选择最合适的智能体响应。适合复杂问题和多领域协作。'}
                                                            </p>
                                                        </div>
                                                        {(session.configuration?.orchestrationMode === 'DYNAMIC' || !session.configuration?.orchestrationMode) && (
                                                            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* SEQUENTIAL 模式 */}
                                                <div
                                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${session.configuration?.orchestrationMode === 'SEQUENTIAL'
                                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                    onClick={() => {
                                                        if (onUpdateSession) {
                                                            onUpdateSession(session.id, {
                                                                configuration: {
                                                                    ...session.configuration,
                                                                    orchestrationMode: 'SEQUENTIAL'
                                                                }
                                                            })
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                                                            ⏭️
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                                                {t('chat.sequentialMode') || '顺序执行模式 (SEQUENTIAL)'}
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {t('chat.sequentialModeDesc') || '智能体按照 @提及 的顺序依次响应。适合需要明确步骤和顺序的任务。'}
                                                            </p>
                                                        </div>
                                                        {session.configuration?.orchestrationMode === 'SEQUENTIAL' && (
                                                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* PARALLEL 模式 */}
                                                <div
                                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${session.configuration?.orchestrationMode === 'PARALLEL'
                                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                        }`}
                                                    onClick={() => {
                                                        if (onUpdateSession) {
                                                            onUpdateSession(session.id, {
                                                                configuration: {
                                                                    ...session.configuration,
                                                                    orchestrationMode: 'PARALLEL'
                                                                }
                                                            })
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-lg flex-shrink-0">
                                                            ⚡
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                                                {t('chat.parallelMode') || '并行处理模式 (PARALLEL)'}
                                                            </h4>
                                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                                {t('chat.parallelModeDesc') || '所有 @提及 的智能体同时响应。适合需要多个视角和快速反馈的场景。'}
                                                            </p>
                                                        </div>
                                                        {session.configuration?.orchestrationMode === 'PARALLEL' && (
                                                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 当前模式指示器 */}
                                        <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">
                                                    {t('chat.currentMode') || '当前模式：'}
                                                </span>
                                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {session.configuration?.orchestrationMode === 'SEQUENTIAL' && (t('chat.sequential') || '顺序执行')}
                                                    {session.configuration?.orchestrationMode === 'PARALLEL' && (t('chat.parallel') || '并行处理')}
                                                    {(!session.configuration?.orchestrationMode || session.configuration?.orchestrationMode === 'DYNAMIC') && (t('chat.dynamic') || '智能决策')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 底部操作区域 */}
                        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            {/* 危险操作 */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleArchiveSession}
                                    className="text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300"
                                >
                                    <Archive className="w-4 h-4 mr-2" />
                                    {session.isArchived ? (t('session.unarchive') || '取消归档') : (t('session.archive') || '归档')}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleDeleteSession}
                                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('common.delete') || '删除'}
                                </Button>
                            </div>

                            {/* 关闭按钮 */}
                            <Button onClick={onClose}>
                                {t('common.confirm') || '确认'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default ChatSettingsDialog 