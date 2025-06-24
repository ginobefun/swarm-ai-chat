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
        <div className="agent-detail-overlay" onClick={handleBackdropClick}>
            <div className="agent-detail-modal">
                {/* 头部 */}
                <div className="agent-detail-header">
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* 主要内容 */}
                <div className="agent-detail-content">
                    {/* 角色基本信息 */}
                    <div className="agent-info-section">
                        <div className="agent-avatar-large" style={{ background: agent.avatarStyle }}>
                            {agent.avatar}
                        </div>
                        <div className="agent-basic-info">
                            <h2 className="agent-name">{agent.name}</h2>
                            <p className="agent-specialty">{agent.specialty}</p>
                            <p className="agent-description">{agent.description}</p>
                        </div>
                    </div>

                    {/* 性格特点 */}
                    <div className="agent-section">
                        <h3 className="section-title">
                            <span className="section-icon">✨</span>
                            性格特点
                        </h3>
                        <p className="agent-personality">{agent.personality}</p>
                    </div>

                    {/* 技能标签 */}
                    <div className="agent-section">
                        <h3 className="section-title">
                            <span className="section-icon">🏷️</span>
                            核心技能
                        </h3>
                        <div className="skill-tags">
                            {agent.skillTags?.map((skill) => (
                                <span
                                    key={skill.id}
                                    className={`skill-tag skill-tag-${skill.category}`}
                                    style={{ backgroundColor: skill.color }}
                                >
                                    #{skill.name}
                                </span>
                            )) || <p className="empty-state">暂无技能标签</p>}
                        </div>
                    </div>

                    {/* 绑定工具 */}
                    <div className="agent-section">
                        <h3 className="section-title">
                            <span className="section-icon">🛠️</span>
                            绑定工具
                        </h3>
                        <div className="tools-grid">
                            {agent.tools?.map((tool) => (
                                <div key={tool.id} className="tool-item">
                                    <span className="tool-icon">{tool.icon}</span>
                                    <div className="tool-info">
                                        <span className="tool-name">{tool.name}</span>
                                        <span className="tool-description">{tool.description}</span>
                                    </div>
                                </div>
                            )) || <p className="empty-state">暂无绑定工具</p>}
                        </div>
                    </div>

                    {/* 使用示例 */}
                    <div className="agent-section">
                        <h3 className="section-title">
                            <span className="section-icon">💡</span>
                            使用示例
                        </h3>
                        <div className="usage-examples">
                            {agent.usageExamples?.map((example) => (
                                <div key={example.id} className="example-item">
                                    <h4 className="example-title">{example.title}</h4>
                                    <p className="example-description">{example.description}</p>
                                    <div className="example-prompt">
                                        <span className="prompt-label">示例提示：</span>
                                        <code className="prompt-text">&ldquo;{example.prompt}&rdquo;</code>
                                    </div>
                                </div>
                            )) || <p className="empty-state">暂无使用示例</p>}
                        </div>
                    </div>

                    {/* 技术偏好 */}
                    <div className="agent-section">
                        <h3 className="section-title">
                            <span className="section-icon">🔧</span>
                            技术配置
                        </h3>
                        <div className="tech-config">
                            <div className="config-item">
                                <span className="config-label">推荐模型：</span>
                                <span className="config-value">{agent.modelPreference}</span>
                            </div>
                            <div className="config-item">
                                <span className="config-label">状态：</span>
                                <span className={`status-badge ${agent.isActive ? 'active' : 'inactive'}`}>
                                    {agent.isActive ? '可用' : '不可用'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 底部操作 */}
                <div className="agent-detail-footer">
                    <button className="btn-secondary" onClick={onClose}>
                        关闭
                    </button>
                    <button className="btn-primary" onClick={handleStartChat}>
                        <span className="btn-icon">💬</span>
                        开始对话
                    </button>
                </div>
            </div>

            <style jsx>{`
                .agent-detail-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                }

                .agent-detail-modal {
                    background: var(--background);
                    border-radius: var(--radius-lg);
                    width: 100%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow: hidden;
                    box-shadow: var(--shadow-xl);
                    border: 1px solid var(--border-color);
                    display: flex;
                    flex-direction: column;
                }

                .agent-detail-header {
                    display: flex;
                    justify-content: flex-end;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                }

                .close-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: var(--radius-full);
                    border: 1px solid var(--border-color);
                    background: var(--background);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }

                .close-btn:hover {
                    background: var(--background-hover);
                    color: var(--text-primary);
                }

                .agent-detail-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .agent-info-section {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 32px;
                    align-items: flex-start;
                }

                .agent-avatar-large {
                    width: 80px;
                    height: 80px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 36px;
                    flex-shrink: 0;
                    box-shadow: var(--shadow-md);
                }

                .agent-basic-info {
                    flex: 1;
                }

                .agent-name {
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 8px 0;
                }

                .agent-specialty {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--primary-color);
                    margin: 0 0 12px 0;
                }

                .agent-description {
                    font-size: 15px;
                    line-height: 1.6;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .agent-section {
                    margin-bottom: 28px;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 16px 0;
                }

                .section-icon {
                    font-size: 20px;
                }

                .agent-personality {
                    font-size: 15px;
                    line-height: 1.6;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .skill-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .skill-tag {
                    padding: 6px 12px;
                    border-radius: var(--radius-full);
                    font-size: 13px;
                    font-weight: 500;
                    color: white;
                    white-space: nowrap;
                    box-shadow: var(--shadow-sm);
                }

                .tools-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 12px;
                }

                .tool-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: var(--radius-md);
                    background: var(--background-secondary);
                    border: 1px solid var(--border-color);
                    transition: all var(--transition-fast);
                }

                .tool-item:hover {
                    background: var(--background-hover);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-sm);
                }

                .tool-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .tool-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .tool-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .tool-description {
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .usage-examples {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .example-item {
                    padding: 16px;
                    border-radius: var(--radius-md);
                    background: var(--background-secondary);
                    border: 1px solid var(--border-color);
                }

                .example-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 0 0 8px 0;
                }

                .example-description {
                    font-size: 14px;
                    line-height: 1.5;
                    color: var(--text-secondary);
                    margin: 0 0 12px 0;
                }

                .example-prompt {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .prompt-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--text-tertiary);
                }

                .prompt-text {
                    padding: 8px 12px;
                    background: var(--background);
                    border-radius: var(--radius-sm);
                    font-size: 13px;
                    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
                    color: var(--primary-color);
                    border: 1px solid var(--border-color);
                }

                .tech-config {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .config-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .config-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-secondary);
                    min-width: 80px;
                }

                .config-value {
                    font-size: 14px;
                    color: var(--text-primary);
                    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
                    background: var(--background-secondary);
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                }

                .status-badge {
                    padding: 4px 12px;
                    border-radius: var(--radius-full);
                    font-size: 12px;
                    font-weight: 600;
                }

                .status-badge.active {
                    background: #dcfce7;
                    color: #166534;
                }

                .status-badge.inactive {
                    background: #fef2f2;
                    color: #991b1b;
                }

                .agent-detail-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    padding: 20px 24px;
                    border-top: 1px solid var(--border-color);
                    background: var(--background-secondary);
                }

                .btn-secondary, .btn-primary {
                    padding: 10px 20px;
                    border-radius: var(--radius-md);
                    font-size: 14px;
                    font-weight: 600;
                    border: 1px solid var(--border-color);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .btn-secondary {
                    background: var(--background);
                    color: var(--text-secondary);
                }

                .btn-secondary:hover {
                    background: var(--background-hover);
                    color: var(--text-primary);
                }

                .btn-primary {
                    background: var(--primary-color);
                    color: white;
                    border-color: var(--primary-color);
                }

                .btn-primary:hover {
                    background: var(--primary-color-dark);
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }

                .btn-icon {
                    font-size: 16px;
                }

                /* 移动端适配 */
                @media (max-width: 768px) {
                    .agent-detail-overlay {
                        padding: 10px;
                    }

                    .agent-detail-modal {
                        max-height: 95vh;
                    }

                    .agent-info-section {
                        flex-direction: column;
                        text-align: center;
                        gap: 16px;
                    }

                    .agent-avatar-large {
                        align-self: center;
                    }

                    .tools-grid {
                        grid-template-columns: 1fr;
                    }

                    .agent-detail-footer {
                        flex-direction: column-reverse;
                    }

                    .btn-secondary, .btn-primary {
                        width: 100%;
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    )
}

export default AgentDetail
