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

        // 插入AI角色
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