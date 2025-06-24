'use client'

import React, { useState, useEffect } from 'react'

interface DatabaseStats {
    agents_count: string
    skill_tags_count: string
    tools_count: string
    examples_count: string
    agent_skills_count: string
    agent_tools_count: string
    users_count: string
    sessions_count: string
    messages_count: string
}

interface DatabaseStatus {
    connected: boolean
    tables: string[]
    stats: DatabaseStats
}

export default function DatabaseAdminPage() {
    const [status, setStatus] = useState<DatabaseStatus | null>(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const fetchStatus = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/database?action=status')
            const result = await response.json()

            if (result.success) {
                setStatus(result.data)
                setMessage('Database status loaded')
            } else {
                setMessage(`Error: ${result.error}`)
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const performAction = async (action: string) => {
        try {
            setLoading(true)
            setMessage(`Performing ${action}...`)

            const response = await fetch('/api/admin/database', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action })
            })

            const result = await response.json()

            if (result.success) {
                setMessage(result.message)
                // 重新获取状态
                setTimeout(fetchStatus, 1000)
            } else {
                setMessage(`Error: ${result.error}`)
            }
        } catch (error) {
            setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>数据库管理</h1>

            {message && (
                <div style={{
                    padding: '12px',
                    marginBottom: '20px',
                    borderRadius: '8px',
                    backgroundColor: message.includes('Error') ? '#fee' : '#efe',
                    color: message.includes('Error') ? '#c33' : '#363',
                    border: `1px solid ${message.includes('Error') ? '#fcc' : '#cfc'}`
                }}>
                    {message}
                </div>
            )}

            <div style={{ marginBottom: '24px' }}>
                <h2>数据库状态</h2>
                {status ? (
                    <div>
                        <p><strong>连接状态：</strong> {status.connected ? '✅ 已连接' : '❌ 未连接'}</p>
                        <p><strong>数据表数量：</strong> {status.tables.length}</p>
                        <details>
                            <summary>表列表</summary>
                            <ul>
                                {status.tables.map(table => (
                                    <li key={table}>{table}</li>
                                ))}
                            </ul>
                        </details>
                    </div>
                ) : (
                    <p>加载中...</p>
                )}
            </div>

            {status?.stats && (
                <div style={{ marginBottom: '24px' }}>
                    <h2>数据统计</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <strong>AI 角色：</strong> {status.stats.agents_count}
                        </div>
                        <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <strong>技能标签：</strong> {status.stats.skill_tags_count}
                        </div>
                        <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <strong>工具：</strong> {status.stats.tools_count}
                        </div>
                        <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <strong>使用示例：</strong> {status.stats.examples_count}
                        </div>
                        <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <strong>角色技能关联：</strong> {status.stats.agent_skills_count}
                        </div>
                        <div style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <strong>角色工具关联：</strong> {status.stats.agent_tools_count}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginBottom: '24px' }}>
                <h2>数据库操作</h2>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => performAction('migrate')}
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        创建表结构
                    </button>

                    <button
                        onClick={() => performAction('seed')}
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        导入初始数据
                    </button>

                    <button
                        onClick={() => performAction('setup')}
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#17a2b8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        完整设置（创建 + 导入）
                    </button>

                    <button
                        onClick={() => {
                            if (confirm('确定要重置数据库吗？这将删除所有数据并重新创建表结构。')) {
                                performAction('reset')
                            }
                        }}
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        重置数据库
                    </button>

                    <button
                        onClick={fetchStatus}
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        刷新状态
                    </button>
                </div>
            </div>

            <div style={{
                padding: '16px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                fontSize: '14px'
            }}>
                <strong>使用说明：</strong>
                <ol>
                    <li>确保已设置 DATABASE_URL 环境变量</li>
                    <li>点击&ldquo;完整设置&rdquo;进行一键配置</li>
                    <li>或者分别点击&ldquo;创建表结构&rdquo;和&ldquo;导入初始数据&rdquo;</li>
                    <li>使用&ldquo;刷新状态&rdquo;查看最新的数据库状态</li>
                </ol>
            </div>
        </div>
    )
} 