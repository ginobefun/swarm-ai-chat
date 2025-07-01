'use client'

import React, { useState } from 'react'
import { WorkspaceModule, Session } from '@/types'
import { EnhancedOrchestratorResponse, WorkspaceData } from '@/types/chat'



/**
 * Props interface for Workspace component
 * Defines the required properties for workspace functionality
 */
interface WorkspaceProps {
    session?: Session | null // Session data to display workspace information for
    orchestratorResponse?: EnhancedOrchestratorResponse | null // Enhanced collaboration state data
    workspaceData?: WorkspaceData // Real-time workspace data
    isVisible?: boolean // Whether the workspace panel is visible
    onClose?: () => void // Callback function when workspace is closed
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
    orchestratorResponse,
    workspaceData,
    isVisible = true,
    onClose
}) => {
    // Workspace modules with dynamic content based on session and collaboration state
    const [modules] = useState<WorkspaceModule[]>([
        {
            id: 'summary',
            title: '协作概要',
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
                                    {orchestratorResponse && (
                                        <>
                                            <p>协作轮次：#{orchestratorResponse.turnIndex}</p>
                                            <p>任务数：{orchestratorResponse.tasks?.length || 0}</p>
                                            <p>完成结果：{orchestratorResponse.results?.length || 0}</p>
                                            <p>成本：${orchestratorResponse.costUSD?.toFixed(4) || '0.0000'}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            {workspaceData?.taskSummary ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <h6 className="text-blue-700 dark:text-blue-300 font-medium mb-2">任务理解</h6>
                                    <p className="text-sm">{workspaceData.taskSummary}</p>
                                </div>
                            ) : orchestratorResponse?.summary ? (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <h6 className="text-green-700 dark:text-green-300 font-medium mb-2">协作总结</h6>
                                    <p className="text-sm">{orchestratorResponse.summary}</p>
                                </div>
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <p>多智能体协作正在进行中，实时显示任务分配和执行进度。</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <div className="text-2xl mb-2">📋</div>
                            <p>请选择一个会话以查看协作概要</p>
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
                <div>
                    {workspaceData?.finalResults?.keyPoints ? (
                        <ul className="space-y-2">
                            {workspaceData.finalResults.keyPoints.map((point, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{point}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">等待智能体分析...</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'criticalThoughts',
            title: '批判性思考',
            icon: '💭',
            content: (
                <div>
                    {workspaceData?.finalResults?.criticalThoughts ? (
                        <ul className="space-y-2">
                            {workspaceData.finalResults.criticalThoughts.map((thought, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-amber-500">⚠️</span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{thought}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">等待批判性分析...</p>
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'tasks',
            title: '任务进度',
            icon: '✅',
            content: (
                <div className="space-y-3">
                    {workspaceData?.taskList?.length ? (
                        <>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                协作任务 ({workspaceData.taskList.length} 个)
                            </div>
                            {workspaceData.taskList.map((task, index: number) => (
                                <div key={task.id || index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {task.title || `任务 ${index + 1}`}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : task.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            }`}>
                                            {task.status === 'completed' ? '已完成' :
                                                task.status === 'in_progress' ? '进行中' : '待处理'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        分配给：{task.assignedTo || '未分配'}
                                    </div>
                                    {task.progress !== undefined && (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${task.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {task.progress}%
                                            </span>
                                        </div>
                                    )}
                                    {task.description && (
                                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                            {task.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : orchestratorResponse?.tasks?.length ? (
                        <>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                协作任务 ({orchestratorResponse.tasks.length} 个)
                            </div>
                            {orchestratorResponse.tasks.map((task, index: number) => (
                                <div key={task.id || index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {task.title || `任务 ${index + 1}`}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${task.status === 'completed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                            : task.status === 'in_progress'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            }`}>
                                            {task.status === 'completed' ? '已完成' :
                                                task.status === 'in_progress' ? '进行中' : '待处理'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        分配给：{task.assignedTo || '未分配'}
                                    </div>
                                    {task.description && (
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            {task.description}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <div className="text-2xl mb-2">📋</div>
                            <p>暂无协作任务</p>
                            <p className="text-sm mt-1">发送消息开始多智能体协作</p>
                        </div>
                    )}
                </div>
            )
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