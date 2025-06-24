'use client'

import React, { useState } from 'react'
import { WorkspaceModule } from '../types'

interface WorkspaceProps {
    isVisible?: boolean
    onClose?: () => void
}

interface TaskItem {
    id: string
    text: string
    completed: boolean
}

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<TaskItem[]>([
        { id: '1', text: '完成核心价值定义', completed: true },
        { id: '2', text: '确定目标用户群体', completed: true },
        { id: '3', text: '制定 MVP 功能列表', completed: false },
        { id: '4', text: '设计技术架构方案', completed: false },
    ])

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ))
    }

    return (
        <div>
            {tasks.map(task => (
                <div key={task.id} style={{ padding: '8px 0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                        />
                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                            {task.text}
                        </span>
                    </label>
                </div>
            ))}
        </div>
    )
}

const WorkspaceModuleComponent: React.FC<{
    module: WorkspaceModule
    onPin?: (id: string) => void
    onExpand?: (id: string) => void
}> = ({ module, onPin, onExpand }) => {
    return (
        <div className="workspace-module">
            <div className="module-header">
                <h4 className="module-title">
                    <span>{module.icon}</span>
                    <span>{module.title}</span>
                </h4>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {module.isPinned !== undefined && (
                        <button
                            className="nav-btn"
                            onClick={() => onPin?.(module.id)}
                            title={module.isPinned ? '取消置顶' : '置顶'}
                        >
                            📌
                        </button>
                    )}
                    {module.isExpandable && (
                        <button
                            className="nav-btn"
                            onClick={() => onExpand?.(module.id)}
                            title="展开"
                        >
                            ⤢
                        </button>
                    )}
                </div>
            </div>
            <div className="module-content">
                {module.content}
            </div>
        </div>
    )
}

const Workspace: React.FC<WorkspaceProps> = ({
    isVisible = true,
    onClose
}) => {
    const [modules] = useState<WorkspaceModule[]>([
        {
            id: 'summary',
            title: '对话概要',
            icon: '📝',
            isPinned: false,
            content: (
                <div>
                    SwarmAI.chat 是一个革命性的 AI 协作平台，通过多智能体系统让用户能够像管理团队一样调度 AI 完成复杂任务。核心价值在于将 AI 从工具升级为协作伙伴。
                </div>
            )
        },
        {
            id: 'keypoints',
            title: '关键要点',
            icon: '🎯',
            content: (
                <ul className="key-points">
                    <li>多智能体协作是核心差异化特征</li>
                    <li>目标用户为知识密集型工作者</li>
                    <li>IM 界面降低了用户学习成本</li>
                    <li>工作区实现了结构化输出</li>
                    <li>预计 6 个月内达到 5 万 MAU</li>
                </ul>
            )
        },
        {
            id: 'mindmap',
            title: '思维导图',
            icon: '🧠',
            isExpandable: true,
            content: (
                <div className="mind-map">
                    <div className="mind-map-content">
                        <span className="mind-map-icon">🗺️</span>
                        <div className="mind-map-title">知识结构可视化</div>
                        <div className="mind-map-subtitle">点击查看完整思维导图</div>
                    </div>
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

    const handleModulePin = (id: string) => {
        console.log('置顶模块：', id)
    }

    const handleModuleExpand = (id: string) => {
        console.log('展开模块：', id)
    }

    return (
        <aside className={`workspace ${isVisible ? 'active' : ''}`}>
            <div className="workspace-header">
                <h3 className="workspace-title">📊 工作区</h3>
                <div className="workspace-actions">
                    <button className="nav-btn" title="设置">
                        ⚙️
                    </button>
                    <button className="nav-btn" title="导出">
                        📥
                    </button>
                    {onClose && (
                        <button className="nav-btn" onClick={onClose} title="关闭">
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="workspace-content">
                {modules.map(module => (
                    <WorkspaceModuleComponent
                        key={module.id}
                        module={module}
                        onPin={handleModulePin}
                        onExpand={handleModuleExpand}
                    />
                ))}
            </div>
        </aside>
    )
}

export default Workspace 