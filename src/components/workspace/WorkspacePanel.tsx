'use client'

import React, { useState } from 'react'
import { WorkspaceModule, Session } from '@/types'

/**
 * Props interface for Workspace component
 * Defines the required properties for workspace functionality
 */
interface WorkspaceProps {
    session?: Session | null // Session data to display workspace information for
    isVisible?: boolean // Whether the workspace panel is visible
    onClose?: () => void // Callback function when workspace is closed
}

/**
 * Individual task item interface for the task list module
 */
interface TaskItem {
    id: string
    text: string
    completed: boolean
}

/**
 * TaskList component renders an interactive checklist of tasks
 * Allows users to mark tasks as completed or pending
 * 
 * @returns JSX element containing the task list
 */
const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<TaskItem[]>([
        { id: '1', text: '完成核心价值定义', completed: true },
        { id: '2', text: '确定目标用户群体', completed: true },
        { id: '3', text: '制定 MVP 功能列表', completed: false },
        { id: '4', text: '设计技术架构方案', completed: false },
    ])

    /**
     * Toggle the completion status of a specific task
     * @param id - The unique identifier of the task to toggle
     */
    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ))
    }

    return (
        <div className="space-y-3">
            {tasks.map(task => (
                <div key={task.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors duration-150">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className={`text-sm ${task.completed
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-700 dark:text-gray-300'
                            }`}>
                            {task.text}
                        </span>
                    </label>
                </div>
            ))}
        </div>
    )
}

/**
 * Individual workspace module component
 * Renders a single module with header, controls, and content
 * 
 * @param module - The workspace module data to render
 * @param onPin - Callback function for pinning/unpinning modules
 * @param onExpand - Callback function for expanding modules
 * @returns JSX element representing a workspace module
 */
const WorkspaceModuleComponent: React.FC<{
    module: WorkspaceModule
    onPin?: (id: string) => void
    onExpand?: (id: string) => void
}> = ({ module, onPin, onExpand }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                <h4 className="flex items-center gap-3 text-sm font-semibold text-gray-900 dark:text-white">
                    <span className="text-lg">{module.icon}</span>
                    <span>{module.title}</span>
                </h4>
                <div className="flex items-center gap-1">
                    {module.isPinned !== undefined && (
                        <button
                            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors duration-150"
                            onClick={() => onPin?.(module.id)}
                            title={module.isPinned ? '取消置顶' : '置顶'}
                            aria-label={module.isPinned ? 'Unpin module' : 'Pin module'}
                        >
                            <span className={`text-sm ${module.isPinned ? 'text-indigo-500' : ''}`}>📌</span>
                        </button>
                    )}
                    {module.isExpandable && (
                        <button
                            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors duration-150"
                            onClick={() => onExpand?.(module.id)}
                            title="展开"
                            aria-label="Expand module"
                        >
                            <span className="text-sm">⤢</span>
                        </button>
                    )}
                </div>
            </div>
            <div className="p-4 text-sm text-gray-700 dark:text-gray-300">
                {module.content}
            </div>
        </div>
    )
}

/**
 * Main Workspace component (exported as WorkspacePanel for consistency)
 * Displays various workspace modules including summary, key points, mind map, and tasks
 * Provides a structured view of conversation insights and actionable items
 * 
 * @param props - WorkspaceProps containing session data and display options
 * @returns JSX element representing the complete workspace panel
 */
const Workspace: React.FC<WorkspaceProps> = ({
    session, // Now properly typed and used
    isVisible = true,
    onClose
}) => {
    // Workspace modules with dynamic content based on session
    const [modules] = useState<WorkspaceModule[]>([
        {
            id: 'summary',
            title: '对话概要',
            icon: '📝',
            isPinned: false,
            content: (
                <div className="space-y-3">
                    {session ? (
                        <>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2">会话：{session.title || '无标题会话'}</h5>
                                <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                    <p>参与者：{session.participants?.length || 0} 人</p>
                                    <p>消息数：{session.messageCount || 0}</p>
                                </div>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p>SwarmAI.chat 是一个革命性的 AI 协作平台，通过多智能体系统让用户能够像管理团队一样调度 AI 完成复杂任务。核心价值在于将 AI 从工具升级为协作伙伴。</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <div className="text-2xl mb-2">📋</div>
                            <p>请选择一个会话以查看对话概要</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'keypoints',
            title: '关键要点',
            icon: '🎯',
            content: (
                <ul className="space-y-2">
                    {[
                        '多智能体协作是核心差异化特征',
                        '目标用户为知识密集型工作者',
                        'IM 界面降低了用户学习成本',
                        '工作区实现了结构化输出',
                        '预计 6 个月内达到 5 万 MAU'
                    ].map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            id: 'mindmap',
            title: '思维导图',
            icon: '🧠',
            isExpandable: true,
            content: (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800 text-center cursor-pointer hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-colors duration-200">
                    <div className="text-3xl mb-3">🗺️</div>
                    <div className="font-medium text-purple-900 dark:text-purple-300 mb-1">知识结构可视化</div>
                    <div className="text-sm text-purple-700 dark:text-purple-400">点击查看完整思维导图</div>
                </div>
            )
        },
        {
            id: 'tasks',
            title: '后续行动',
            icon: '✅',
            content: <TaskList />
        }
    ])

    /**
     * Handle module pin/unpin action
     * @param id - The module ID to pin/unpin
     */
    const handleModulePin = (id: string) => {
        console.log('置顶模块：', id)
        // TODO: Implement actual pin functionality
    }

    /**
     * Handle module expand action
     * @param id - The module ID to expand
     */
    const handleModuleExpand = (id: string) => {
        console.log('展开模块：', id)
        // TODO: Implement actual expand functionality
    }

    if (!isVisible) return null

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
            {/* 工作区头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📊</span>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">工作区</h2>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors duration-150"
                        title="关闭工作区"
                        aria-label="Close workspace"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* 工作区内容 */}
            <div className="flex-1 overflow-y-auto p-4">
                {modules.map(module => (
                    <WorkspaceModuleComponent
                        key={module.id}
                        module={module}
                        onPin={handleModulePin}
                        onExpand={handleModuleExpand}
                    />
                ))}
            </div>
        </div>
    )
}

// Export as WorkspacePanel for consistency with import in page.tsx
export default Workspace 