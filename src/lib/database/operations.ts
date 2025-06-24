import { sql } from './connection'
import { AIAgent, SkillTag, Tool } from '@/types'

// AI 角色相关操作
export async function getAllAgents(): Promise<AIAgent[]> {
    try {
        const agents = await sql`
      SELECT 
        a.*,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', st2.id,
                'name', st2.name,
                'category', st2.category,
                'color', st2.color
              )
            )
            FROM agent_skills as_rel2
            JOIN skill_tags st2 ON as_rel2.skill_id = st2.id
            WHERE as_rel2.agent_id = a.id
          ),
          '[]'::json
        ) as skill_tags,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', t2.id,
                'name', t2.name,
                'icon', t2.icon,
                'description', t2.description,
                'category', t2.category
              )
            )
            FROM agent_tools at_rel2
            JOIN tools t2 ON at_rel2.tool_id = t2.id
            WHERE at_rel2.agent_id = a.id
          ),
          '[]'::json
        ) as tools,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', ue2.id,
                'title', ue2.title,
                'prompt', ue2.prompt,
                'description', ue2.description
              ) ORDER BY ue2.order_index
            )
            FROM usage_examples ue2
            WHERE ue2.agent_id = a.id
          ),
          '[]'::json
        ) as usage_examples
      FROM ai_agents a
      WHERE a.is_active = true
      ORDER BY a.created_at DESC
    `

        return agents.map(transformAgentFromDB)
    } catch (error) {
        console.error('Error fetching agents:', error)
        throw error
    }
}

export async function getAgentById(id: string): Promise<AIAgent | null> {
    try {
        const result = await sql`
      SELECT 
        a.*,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', st2.id,
                'name', st2.name,
                'category', st2.category,
                'color', st2.color
              )
            )
            FROM agent_skills as_rel2
            JOIN skill_tags st2 ON as_rel2.skill_id = st2.id
            WHERE as_rel2.agent_id = a.id
          ),
          '[]'::json
        ) as skill_tags,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', t2.id,
                'name', t2.name,
                'icon', t2.icon,
                'description', t2.description,
                'category', t2.category
              )
            )
            FROM agent_tools at_rel2
            JOIN tools t2 ON at_rel2.tool_id = t2.id
            WHERE at_rel2.agent_id = a.id
          ),
          '[]'::json
        ) as tools,
        COALESCE(
          (
            SELECT json_agg(
              jsonb_build_object(
                'id', ue2.id,
                'title', ue2.title,
                'prompt', ue2.prompt,
                'description', ue2.description
              ) ORDER BY ue2.order_index
            )
            FROM usage_examples ue2
            WHERE ue2.agent_id = a.id
          ),
          '[]'::json
        ) as usage_examples
      FROM ai_agents a
      WHERE a.id = ${id} AND a.is_active = true
    `

        return result.length > 0 ? transformAgentFromDB(result[0]) : null
    } catch (error) {
        console.error('Error fetching agent by id:', error)
        throw error
    }
}

// 技能标签操作
export async function getAllSkillTags(): Promise<SkillTag[]> {
    try {
        const result = await sql`
      SELECT * FROM skill_tags 
      ORDER BY category, name
    `
        return result.map(transformSkillTagFromDB)
    } catch (error) {
        console.error('Error fetching skill tags:', error)
        throw error
    }
}

// 工具操作
export async function getAllTools(): Promise<Tool[]> {
    try {
        const result = await sql`
      SELECT * FROM tools 
      ORDER BY category, name
    `
        return result.map(transformToolFromDB)
    } catch (error) {
        console.error('Error fetching tools:', error)
        throw error
    }
}

// 数据转换函数
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAgentFromDB(dbAgent: any): AIAgent {
    return {
        id: dbAgent.id,
        name: dbAgent.name,
        avatar: dbAgent.avatar,
        avatarStyle: dbAgent.avatar_style,
        description: dbAgent.description,
        specialty: dbAgent.specialty,
        personality: dbAgent.personality,
        skillTags: dbAgent.skill_tags || [],
        tools: dbAgent.tools || [],
        usageExamples: dbAgent.usage_examples || [],
        modelPreference: dbAgent.model_preference,
        systemPrompt: dbAgent.system_prompt,
        isActive: dbAgent.is_active,
        createdAt: dbAgent.created_at,
        updatedAt: dbAgent.updated_at
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformSkillTagFromDB(dbTag: any): SkillTag {
    return {
        id: dbTag.id,
        name: dbTag.name,
        category: dbTag.category,
        color: dbTag.color
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformToolFromDB(dbTool: any): Tool {
    return {
        id: dbTool.id,
        name: dbTool.name,
        icon: dbTool.icon,
        description: dbTool.description,
        category: dbTool.category
    }
}

// 统计和搜索
export async function getAgentStats() {
    try {
        const result = await sql`
      SELECT 
        COUNT(*) as total_agents,
        COUNT(*) FILTER (WHERE is_active = true) as active_agents,
        AVG(rating) as average_rating,
        SUM(usage_count) as total_usage
      FROM ai_agents
    `
        return result[0]
    } catch (error) {
        console.error('Error fetching agent stats:', error)
        throw error
    }
}

export async function searchAgents(query: string): Promise<AIAgent[]> {
    try {
        const agents = await sql`
      SELECT 
        a.*,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', st.id,
              'name', st.name,
              'category', st.category,
              'color', st.color
            )
          ) FILTER (WHERE st.id IS NOT NULL),
          '[]'::json
        ) as skill_tags,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', t.id,
              'name', t.name,
              'icon', t.icon,
              'description', t.description,
              'category', t.category
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tools,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ue.id,
              'title', ue.title,
              'prompt', ue.prompt,
              'description', ue.description
            ) ORDER BY ue.order_index
          ) FILTER (WHERE ue.id IS NOT NULL),
          '[]'::json
        ) as usage_examples
      FROM ai_agents a
      LEFT JOIN agent_skills as_rel ON a.id = as_rel.agent_id
      LEFT JOIN skill_tags st ON as_rel.skill_id = st.id
      LEFT JOIN agent_tools at_rel ON a.id = at_rel.agent_id
      LEFT JOIN tools t ON at_rel.tool_id = t.id
      LEFT JOIN usage_examples ue ON a.id = ue.agent_id
      WHERE a.is_active = true
        AND (
          a.name ILIKE ${`%${query}%`} OR
          a.description ILIKE ${`%${query}%`} OR
          a.specialty ILIKE ${`%${query}%`}
        )
      GROUP BY a.id
      ORDER BY a.usage_count DESC, a.rating DESC
    `

        return agents.map(transformAgentFromDB)
    } catch (error) {
        console.error('Error searching agents:', error)
        throw error
    }
} 