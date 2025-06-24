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
          description = EXCLUDED.description,
          updated_at = CURRENT_TIMESTAMP
      `
        }

        // 插入工具
        console.log('Seeding tools...')
        for (const tool of tools) {
            await sql`
        INSERT INTO tools (id, name, icon, description, category)
        VALUES (${tool.id}, ${tool.name}, ${tool.icon || null}, ${tool.description || null}, ${tool.category || null})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          icon = EXCLUDED.icon,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          updated_at = CURRENT_TIMESTAMP
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
          ${agent.id}, ${agent.name}, ${agent.avatar || null}, ${agent.avatarStyle || null}, 
          ${agent.description || null}, ${agent.specialty || null}, ${agent.personality || null},
          ${agent.modelPreference || 'gpt-4'}, ${agent.systemPrompt || null}, ${agent.isActive !== false}
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
            if (agent.skillTags && agent.skillTags.length > 0) {
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
            if (agent.tools && agent.tools.length > 0) {
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
            if (agent.usageExamples && agent.usageExamples.length > 0) {
                for (const [index, example] of agent.usageExamples.entries()) {
                    await sql`
              INSERT INTO usage_examples (agent_id, title, prompt, description, order_index)
              VALUES (${agent.id}, ${example.title}, ${example.prompt}, ${example.description || null}, ${index + 1})
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
}

export async function dropAllTables() {
    try {
        console.log('Dropping all existing tables...')

        // 删除所有表（注意顺序，先删除引用表）
        await sql`DROP TABLE IF EXISTS messages CASCADE`
        await sql`DROP TABLE IF EXISTS sessions CASCADE`
        await sql`DROP TABLE IF EXISTS usage_examples CASCADE`
        await sql`DROP TABLE IF EXISTS agent_tools CASCADE`
        await sql`DROP TABLE IF EXISTS agent_skills CASCADE`
        await sql`DROP TABLE IF EXISTS ai_agents CASCADE`
        await sql`DROP TABLE IF EXISTS tools CASCADE`
        await sql`DROP TABLE IF EXISTS skill_tags CASCADE`
        await sql`DROP TABLE IF EXISTS users CASCADE`

        console.log('All tables dropped successfully!')
        return true

    } catch (error) {
        console.error('Error dropping tables:', error)
        throw error
    }
}

export async function runMigrations() {
    try {
        console.log('Starting database migration...')

        // 启用扩展
        await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`

        // 创建用户表（保留 UUID，因为这是系统用户）
        await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // 创建技能标签表（使用 VARCHAR 主键）
        await sql`
      CREATE TABLE IF NOT EXISTS skill_tags (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        color VARCHAR(20) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // 创建工具表（使用 VARCHAR 主键）
        await sql`
      CREATE TABLE IF NOT EXISTS tools (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(10),
        description TEXT,
        category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // 创建 AI 角色表（使用 VARCHAR 主键）
        await sql`
      CREATE TABLE IF NOT EXISTS ai_agents (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        avatar VARCHAR(10),
        avatar_style TEXT,
        description TEXT,
        specialty VARCHAR(255),
        personality TEXT,
        model_preference VARCHAR(50) DEFAULT 'gpt-4',
        system_prompt TEXT,
        is_active BOOLEAN DEFAULT true,
        is_public BOOLEAN DEFAULT true,
        created_by UUID REFERENCES users(id),
        usage_count INTEGER DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // 创建 AI 角色技能关联表
        await sql`
      CREATE TABLE IF NOT EXISTS agent_skills (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
        skill_id VARCHAR(50) NOT NULL REFERENCES skill_tags(id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(agent_id, skill_id)
      )
    `

        // 创建 AI 角色工具关联表
        await sql`
      CREATE TABLE IF NOT EXISTS agent_tools (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
        tool_id VARCHAR(50) NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(agent_id, tool_id)
      )
    `

        // 创建使用示例表
        await sql`
      CREATE TABLE IF NOT EXISTS usage_examples (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        prompt TEXT NOT NULL,
        description TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // 创建会话表
        await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        agent_id VARCHAR(50) REFERENCES ai_agents(id),
        title VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // 创建消息表
        await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

        // 创建索引
        await sql`CREATE INDEX IF NOT EXISTS idx_ai_agents_active ON ai_agents(is_active)`
        await sql`CREATE INDEX IF NOT EXISTS idx_ai_agents_usage ON ai_agents(usage_count DESC)`
        await sql`CREATE INDEX IF NOT EXISTS idx_ai_agents_rating ON ai_agents(rating DESC)`
        await sql`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`
        await sql`CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id)`
        await sql`CREATE INDEX IF NOT EXISTS idx_usage_examples_agent ON usage_examples(agent_id, order_index)`

        console.log('Database migration completed successfully!')
        return true

    } catch (error) {
        console.error('Migration failed:', error)
        throw error
    }
}

export async function checkDatabaseStatus() {
    try {
        const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

        const tableNames = tables.map(t => t.table_name)
        console.log('Existing tables:', tableNames)

        return { tables: tableNames }

    } catch (error) {
        console.error('Error checking database status:', error)
        throw error
    }
} 