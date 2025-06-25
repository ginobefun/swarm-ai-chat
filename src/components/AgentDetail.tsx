'use client'

import React from 'react'
import { AgentDetailProps } from '../types'

const AgentDetail: React.FC<AgentDetailProps> = ({
    agent,
    isOpen,
    onClose,
    onStartChat
}) => {
    if (!isOpen) return null

    const handleStartChat = () => {
        if (onStartChat) {
            onStartChat(agent.id)
        }
        onClose()
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
            onClick={handleBackdropClick}
        >
            <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col">
                {/* 头部 */}
                <div className="flex justify-end p-4 border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                    >
                        ✕
                    </button>
                </div>

                {/* 主要内容 */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* 角色基本信息 */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div
                            className="w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-4xl md:text-5xl text-white font-bold flex-shrink-0"
                            style={{ background: agent.avatarStyle || '#667eea' }}
                        >
                            {agent.avatar}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                                {agent.name}
                            </h2>
                            <p className="text-lg text-indigo-600 dark:text-indigo-400 font-medium mb-3">
                                {agent.specialty}
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {agent.description}
                            </p>
                        </div>
                    </div>

                    {/* 性格特点 */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span className="text-2xl">✨</span>
                            性格特点
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {agent.personality}
                        </p>
                    </div>

                    {/* 技能标签 */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span className="text-2xl">🏷️</span>
                            核心技能
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {agent.skillTags?.map((skill) => (
                                <span
                                    key={skill.id}
                                    className="px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300"
                                    style={{ backgroundColor: skill.color || '#f3f4f6' }}
                                >
                                    #{skill.name}
                                </span>
                            )) || (
                                    <p className="text-slate-500 dark:text-slate-400 italic">
                                        暂无技能标签
                                    </p>
                                )}
                        </div>
                    </div>

                    {/* 绑定工具 */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span className="text-2xl">🛠️</span>
                            绑定工具
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {agent.tools?.map((tool) => (
                                <div
                                    key={tool.id}
                                    className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                >
                                    <span className="text-2xl flex-shrink-0">{tool.icon}</span>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                                            {tool.name}
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {tool.description}
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-slate-500 dark:text-slate-400 italic col-span-full">
                                        暂无绑定工具
                                    </p>
                                )}
                        </div>
                    </div>

                    {/* 使用示例 */}
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span className="text-2xl">💡</span>
                            使用示例
                        </h3>
                        <div className="space-y-4">
                            {agent.usageExamples?.map((example) => (
                                <div
                                    key={example.id}
                                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                >
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                                        {example.title}
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                                        {example.description}
                                    </p>
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-md border border-slate-200 dark:border-slate-600">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                                            示例提示：
                                        </span>
                                        <code className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                                            &quot;{example.prompt}&quot;
                                        </code>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-slate-500 dark:text-slate-400 italic">
                                        暂无使用示例
                                    </p>
                                )}
                        </div>
                    </div>

                    {/* 技术配置 */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                            <span className="text-2xl">🔧</span>
                            技术配置
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="font-medium text-slate-700 dark:text-slate-300">推荐模型：</span>
                                <span className="text-slate-900 dark:text-slate-100">
                                    {agent.modelPreference || 'GPT-4'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                <span className="font-medium text-slate-700 dark:text-slate-300">状态：</span>
                                <span className={`px-2 py-1 rounded-full text-sm font-medium ${agent.isActive
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                    }`}>
                                    {agent.isActive ? '可用' : '不可用'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 底部操作 */}
                <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                        关闭
                    </button>
                    <button
                        onClick={handleStartChat}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium transition-colors hover:bg-indigo-700"
                    >
                        <span className="text-lg">💬</span>
                        开始对话
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AgentDetail
