'use client'

import React from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Session } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

interface ChatAreaProps {
    session: Session | null
    onSessionUpdate?: (sessionId: string, updates: Partial<Session>) => void
}

const ChatArea: React.FC<ChatAreaProps> = ({
    session,
    onSessionUpdate
}) => {
    const { t } = useTranslation()

    const handleSendMessage = (message: string) => {
        if (session && onSessionUpdate) {
            // 这里应该添加发送消息的逻辑
            console.log('Sending message:', message)
        }
    }

    if (!session) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-slate-900">
                <div className="max-w-2xl mx-auto px-8 text-center">
                    {/* 主标题区域 */}
                    <div className="mb-8">
                        <div className="text-6xl mb-6 animate-bounce">🤖</div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            欢迎使用 SwarmAI.chat
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                            多智能体协作平台，让 AI 团队为您服务
                        </p>
                    </div>

                    {/* 特色功能介绍 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                            <div className="text-3xl mb-3">💬</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">多智能体协作</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                将不同专业领域的 AI 智能体组成团队，协同完成复杂任务
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                            <div className="text-3xl mb-3">🎯</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">专业角色扮演</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                每个 AI 都有专业背景，如分析师、创意师、技术专家等
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
                            <div className="text-3xl mb-3">📊</div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">结构化输出</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                智能整理对话内容，生成摘要、待办事项等结构化文档
                            </p>
                        </div>
                    </div>

                    {/* 快速开始指引 */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-indigo-200 dark:border-indigo-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            如何开始？
                        </h2>
                        <div className="text-left max-w-md mx-auto space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</span>
                                <p className="text-gray-700 dark:text-gray-300">点击左侧&quot;创建新会话&quot;开始对话</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</span>
                                <p className="text-gray-700 dark:text-gray-300">选择适合的 AI 智能体加入讨论</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</span>
                                <p className="text-gray-700 dark:text-gray-300">使用@符号指定特定 AI 回答问题</p>
                            </div>
                        </div>
                    </div>

                    {/* 预设 AI 角色展示 */}
                    <div className="mt-10">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">热门 AI 智能体</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {[
                                { name: "需求分析师", emoji: "📋", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
                                { name: "用户研究员", emoji: "🔍", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
                                { name: "技术评估师", emoji: "⚙️", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
                                { name: "创意大师", emoji: "💡", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
                                { name: "数据分析师", emoji: "📊", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" }
                            ].map((agent, index) => (
                                <div key={index} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${agent.color} border`}>
                                    <span>{agent.emoji}</span>
                                    <span className="text-sm font-medium">{agent.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <main className="flex flex-col flex-1 bg-white dark:bg-slate-900">
            {/* 对话头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {session.participants.filter(p => p.type === 'agent').slice(0, 3).map((participant) => (
                            <div
                                key={participant.id}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-slate-900"
                                title={participant.name}
                            >
                                {participant.avatar || '🤖'}
                            </div>
                        ))}
                        {session.participants.filter(p => p.type === 'agent').length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs font-medium border-2 border-white dark:border-slate-900">
                                +{session.participants.filter(p => p.type === 'agent').length - 3}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {session.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {session.participants.filter(p => p.type === 'agent').length} 个 AI 智能体 · {session.messageCount || 0} 条消息
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors duration-200"
                        title={t('chat.addMember')}
                    >
                        <span className="text-lg">➕</span>
                        添加成员
                    </button>
                    <button
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors duration-200"
                        title={t('chat.settings')}
                    >
                        <span className="text-lg">⚙️</span>
                    </button>
                </div>
            </div>

            {/* 消息列表 */}
            <MessageList
                messages={[]}
                isTyping={false}
                typingUser=""
            />

            {/* 输入区 */}
            <MessageInput
                onSendMessage={handleSendMessage}
                mentionItems={[]}
            />
        </main>
    )
}

export default ChatArea 