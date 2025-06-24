import { sql } from './connection'
import { skillTags, tools, aiAgents } from '@/data/agentsData'

export async function runSeedData() {
    try {
        console.log('Starting database seeding...')

        // 插入技能标签
        console.log('Seeding skill tags...')
        for (const tag of skillTags) {
            await sql`
        INSERT INTO skill_tags (id, name, category, color, description)
        VALUES (${tag.id}, ${tag.name}, ${tag.category}, ${tag.color}, ${tag.name})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          color = EXCLUDED.color,
          description = EXCLUDED.description
      `
        }

        // 插入工具
        console.log('Seeding tools...')
        for (const tool of tools) {
            await sql`
        INSERT INTO tools (id, name, icon, description, category)
        VALUES (${tool.id}, ${tool.name}, ${tool.icon}, ${tool.description}, ${tool.category})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          icon = EXCLUDED.icon,
          description = EXCLUDED.description,
          category = EXCLUDED.category
      `
        }

        // 插入 AI 角色
        console.log('Seeding AI agents...')
        for (const agent of aiAgents) {
            // 插入角色基本信息
            await sql`
        INSERT INTO ai_agents (
          id, name, avatar, avatar_style, description, specialty, 
          personality, model_preference, system_prompt, is_active
        )
        VALUES (
          ${agent.id}, ${agent.name}, ${agent.avatar}, ${agent.avatarStyle}, 
          ${agent.description}, ${agent.specialty}, ${agent.personality},
          ${agent.modelPreference}, ${agent.systemPrompt}, ${agent.isActive}
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          avatar = EXCLUDED.avatar,
          avatar_style = EXCLUDED.avatar_style,
          description = EXCLUDED.description,
          specialty = EXCLUDED.specialty,
          personality = EXCLUDED.personality,
          model_preference = EXCLUDED.model_preference,
          system_prompt = EXCLUDED.system_prompt,
          is_active = EXCLUDED.is_active,
          updated_at = CURRENT_TIMESTAMP
      `

            // 删除现有的技能关联（以便重新插入）
            await sql`DELETE FROM agent_skills WHERE agent_id = ${agent.id}`

            // 插入技能关联
            if (agent.skillTags) {
                for (const [index, skill] of agent.skillTags.entries()) {
                    await sql`
              INSERT INTO agent_skills (agent_id, skill_id, is_primary)
              VALUES (${agent.id}, ${skill.id}, ${index === 0})
            `
                }
            }

            // 删除现有的工具关联
            await sql`DELETE FROM agent_tools WHERE agent_id = ${agent.id}`

            // 插入工具关联
            if (agent.tools) {
                for (const [index, tool] of agent.tools.entries()) {
                    await sql`
              INSERT INTO agent_tools (agent_id, tool_id, is_primary)
              VALUES (${agent.id}, ${tool.id}, ${index === 0})
            `
                }
            }

            // 删除现有的使用示例
            await sql`DELETE FROM usage_examples WHERE agent_id = ${agent.id}`

            // 插入使用示例
            if (agent.usageExamples) {
                for (const [index, example] of agent.usageExamples.entries()) {
                    await sql`
              INSERT INTO usage_examples (agent_id, title, prompt, description, order_index)
              VALUES (${agent.id}, ${example.title}, ${example.prompt}, ${example.description}, ${index + 1})
            `
                }
            }
        }

        // 更新统计数据
        console.log('Updating statistics...')
        await sql`
      UPDATE ai_agents 
      SET usage_count = FLOOR(RANDOM() * 100) + 10,
          rating = ROUND((RANDOM() * 2 + 3)::numeric, 2)
      WHERE usage_count = 0
    `

        console.log('Database seeding completed successfully!')
        return true

    } catch (error) {
        console.error('Seeding failed:', error)
        throw error
    }
}

export async function clearAllData() {
    try {
        console.log('Clearing all data...')

        // 按依赖关系删除数据
        await sql`DELETE FROM usage_examples`
        await sql`DELETE FROM agent_tools`
        await sql`DELETE FROM agent_skills`
        await sql`DELETE FROM messages`
        await sql`DELETE FROM sessions`
        await sql`DELETE FROM ai_agents`
        await sql`DELETE FROM tools`
        await sql`DELETE FROM skill_tags`
        await sql`DELETE FROM users`

        console.log('All data cleared successfully!')
        return true

    } catch (error) {
        console.error('Clear data failed:', error)
        throw error
    }
}

export async function getDataStats() {
    try {
        const stats = await sql`
      SELECT 
        (SELECT COUNT(*) FROM ai_agents) as agents_count,
        (SELECT COUNT(*) FROM skill_tags) as skill_tags_count,
        (SELECT COUNT(*) FROM tools) as tools_count,
        (SELECT COUNT(*) FROM usage_examples) as examples_count,
        (SELECT COUNT(*) FROM agent_skills) as agent_skills_count,
        (SELECT COUNT(*) FROM agent_tools) as agent_tools_count,
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM sessions) as sessions_count,
        (SELECT COUNT(*) FROM messages) as messages_count
    `

        return stats[0]
    } catch (error) {
        console.error('Error getting data stats:', error)
        throw error
    }
}                   ))}
                </div>
            </aside>

            {/* 角色详情弹窗 */}
            {selectedAgent && (
                <AgentDetail
                    agent={selectedAgent}
                    isOpen={isDetailOpen}
                    onClose={handleCloseDetail}
                    onStartChat={handleStartChat}
                />
            )}
        </>
    )
}

export default Sidebar  <p className="page-subtitle">
                            发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                        </p>
                    </div>
                </div>

                <div className="loading-container">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                    </div>
                    <p className="loading-text">正在加载 AI 角色数据...</p>
                </div>
            </div>
        )
    }

    // 错误状态
    if (error) {
        return (
            <div className="agent-discovery">
                <div className="discovery-header">
                    <div className="header-content">
                        <h1 className="page-title">
                            <span className="title-icon">🤖</span>
                            AI 角色中心
                        </h1>
                        <p className="page-subtitle">
                            发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                        </p>
                    </div>
                </div>

                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3 className="error-title">加载失败</h3>
                    <p className="error-message">{error}</p>
                    <button
                        className="retry-button"
                        onClick={handleRetry}
                    >
                        重试
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="agent-discovery">
            {/* 头部 */}
            <div className="discovery-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <span className="title-icon">🤖</span>
                        AI 角色中心
                    </h1>
                    <p className="page-subtitle">
                        发现并选择最适合您需求的 AI 专家，开始高效的协作之旅
                    </p>
                </div>
            </div>

            {/* 搜索和过滤 */}
            <div className="filters-section">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="搜索角色、技能或专业领域..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                className="clear-search"
                                onClick={() => setSearchQuery('')}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                <div className="filter-tabs">
                    <div className="filter-group">
                        <label className="filter-label">专业领域：</label>
                        <div className="tabs">
                            {specialties.map(specialty => (
                                <button
                                    key={specialty}
                                    className={`tab ${selectedCategory === specialty ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(specialty)}
                                >
                                    {specialty === 'all' ? '全部' : specialty}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">技能类型：</label>
                        <div className="tabs">
                            {skillCategories.map(category => (
                                <button
                                    key={category}
                                    className={`tab ${selectedSkillCategory === category ? 'active' : ''}`}
                                    onClick={() => setSelectedSkillCategory(category as 'all' | 'core' | 'tool' | 'domain')}
                                >
                                    {category === 'all' ? '全部' :
                                        category === 'core' ? '核心能力' :
                                            category === 'tool' ? '工具能力' : '领域专长'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 结果统计 */}
            <div className="results-info">
                <span className="results-count">
                    找到 {filteredAgents.length} 个 AI 角色
                </span>
                {(searchQuery || selectedCategory !== 'all' || selectedSkillCategory !== 'all') && (
                    <button
                        className="clear-filters"
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setSelectedSkillCategory('all')
                        }}
                    >
                        清除筛选
                    </button>
                )}
            </div>

            {/* 角色网格 */}
            <div className="agents-grid">
                {filteredAgents.map(agent => (
                    <div
                        key={agent.id}
                        className="agent-card"
                        onClick={() => handleAgentClick(agent)}
                    >
                        <div className="agent-card-header">
                            <div
                                className="agent-avatar"
                                style={{ background: agent.avatarStyle }}
                            >
                                {agent.avatar}
                            </div>
                            <div className="agent-status">
                                <span className={`status-dot ${agent.isActive ? 'active' : 'inactive'}`} />
                            </div>
                        </div>

                        <div className="agent-card-content">
                            <h3 className="agent-name">{agent.name}</h3>
                            <p className="agent-specialty">{agent.specialty}</p>
                            <p className="agent-description">{agent.description}</p>
                        </div>

                        <div className="agent-card-tags">
                            {agent.skillTags?.slice(0, 3).map(tag => (
                                <span
                                    key={tag.id}
                                    className="skill-tag"
                                    style={{ backgroundColor: tag.color || '#f0f0f0' }}
                                >
                                    {tag.name}
                                </span>
                            ))}
                            {(agent.skillTags?.length || 0) > 3 && (
                                <span className="tag-more">+{(agent.skillTags?.length || 0) - 3}</span>
                            )}
                        </div>

                        <div className="agent-card-footer">
                            <div className="agent-stats">
                                <span className="stat">
                                    <span className="stat-icon">💬</span>
                                    {agent.conversationStarters?.length || 0} 个话题
                                </span>
                                <span className="stat">
                                    <span className="stat-icon">🔧</span>
                                    {agent.tools?.length || 0} 个工具
                                </span>
                            </div>
                            <button
                                className="start-chat-btn"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleStartChat(agent.id)
                                }}
                            >
                                开始对话
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 无结果状态 */}
            {filteredAgents.length === 0 && !loading && (
                <div className="no-results">
                    <div className="no-results-icon">🤖</div>
                    <h3 className="no-results-title">未找到匹配的角色</h3>
                    <p className="no-results-message">
                        尝试调整搜索关键词或筛选条件
                    </p>
                    <button
                        className="clear-filters"
                        onClick={() => {
                            setSearchQuery('')
                            setSelectedCategory('all')
                            setSelectedSkillCategory('all')
                        }}
                    >
                        清除所有筛选
                    </button>
                </div>
            )}

            {/* 角色详情弹窗 */}
            {isDetailOpen && selectedAgent && (
                <AgentDetail
                    agent={selectedAgent}
                    isOpen={isDetailOpen}
                    onClose={handleCloseDetail}
                    onStartChat={handleStartChat}
                />
            )}

            <style jsx>{`
                .agent-discovery {
                    padding: 24px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .discovery-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .header-content {
                    max-width: 600px;
                    margin: 0 auto;
                }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 700;
                    margin-bottom: 16px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .title-icon {
                    margin-right: 12px;
                }

                .page-subtitle {
                    font-size: 1.1rem;
                    color: #6b7280;
                    margin: 0;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                }

                .loading-spinner {
                    margin-bottom: 24px;
                }

                .spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #667eea;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .loading-text {
                    color: #6b7280;
                    font-size: 1.1rem;
                    margin: 0;
                }

                .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 64px 24px;
                    text-align: center;
                }

                .error-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .error-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #ef4444;
                    margin-bottom: 8px;
                }

                .error-message {
                    color: #6b7280;
                    margin-bottom: 24px;
                }

                .retry-button {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .retry-button:hover {
                    background: #5a67d8;
                }

                .filters-section {
                    margin-bottom: 32px;
                }

                .search-container {
                    margin-bottom: 24px;
                }

                .search-input-wrapper {
                    position: relative;
                    max-width: 500px;
                    margin: 0 auto;
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                }

                .search-input {
                    width: 100%;
                    padding: 12px 16px 12px 48px;
                    border: 2px solid #e5e7eb;
                    border-radius: 25px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .search-input:focus {
                    outline: none;
                    border-color: #667eea;
                }

                .clear-search {
                    position: absolute;
                    right: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px;
                }

                .filter-tabs {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    align-items: center;
                }

                .filter-group {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .filter-label {
                    font-weight: 500;
                    color: #374151;
                }

                .tabs {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .tab {
                    padding: 8px 16px;
                    border: 2px solid #e5e7eb;
                    background: white;
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }

                .tab:hover {
                    border-color: #d1d5db;
                }

                .tab.active {
                    background: #667eea;
                    border-color: #667eea;
                    color: white;
                }

                .results-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    padding: 16px;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .results-count {
                    font-weight: 500;
                    color: #374151;
                }

                .clear-filters {
                    background: none;
                    border: 1px solid #d1d5db;
                    color: #6b7280;
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }

                .clear-filters:hover {
                    background: #f3f4f6;
                }

                .agents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .agent-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .agent-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border-color: #667eea;
                }

                .agent-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }

                .agent-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: white;
                    font-weight: bold;
                }

                .agent-status {
                    position: relative;
                }

                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    border: 2px solid white;
                    box-shadow: 0 0 0 1px #e5e7eb;
                }

                .status-dot.active {
                    background: #10b981;
                }

                .status-dot.inactive {
                    background: #6b7280;
                }

                .agent-card-content {
                    margin-bottom: 16px;
                }

                .agent-name {
                    font-size: 1.25rem;
                    font-weight: 600;
                    margin-bottom: 4px;
                    color: #1f2937;
                }

                .agent-specialty {
                    font-size: 0.9rem;
                    color: #667eea;
                    font-weight: 500;
                    margin-bottom: 8px;
                }

                .agent-description {
                    font-size: 0.9rem;
                    color: #6b7280;
                    line-height: 1.4;
                    margin: 0;
                }

                .agent-card-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-bottom: 16px;
                }

                .skill-tag {
                    font-size: 0.75rem;
                    padding: 4px 8px;
                    border-radius: 12px;
                    color: #374151;
                    font-weight: 500;
                }

                .tag-more {
                    font-size: 0.75rem;
                    padding: 4px 8px;
                    background: #f3f4f6;
                    border-radius: 12px;
                    color: #6b7280;
                    font-weight: 500;
                }

                .agent-card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .agent-stats {
                    display: flex;
                    gap: 12px;
                }

                .stat {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.8rem;
                    color: #6b7280;
                }

                .stat-icon {
                    font-size: 0.9rem;
                }

                .start-chat-btn {
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                    font-weight: 500;
                }

                .start-chat-btn:hover {
                    background: #5a67d8;
                }

                .no-results {
                    text-align: center;
                    padding: 64px 24px;
                }

                .no-results-icon {
                    font-size: 4rem;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .no-results-title {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 8px;
                }

                .no-results-message {
                    color: #6b7280;
                    margin-bottom: 24px;
                }

                @media (max-width: 768px) {
                    .agent-discovery {
                        padding: 16px;
                    }

                    .page-title {
                        font-size: 2rem;
                    }

                    .filter-tabs {
                        align-items: stretch;
                    }

                    .filter-group {
                        align-items: stretch;
                    }

                    .tabs {
                        justify-content: flex-start;
                    }

                    .results-info {
                        flex-direction: column;
                        gap: 12px;
                        align-items: stretch;
                    }

                    .agents-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    )
}

export default AgentDiscovery 