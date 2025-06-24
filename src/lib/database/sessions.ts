import { sql } from './connection'
import { Session, SessionParticipant, CreateSessionRequest, UpdateSessionRequest, SessionFilter } from '@/types'

// 创建会话
export async function createSession(userId: string, request: CreateSessionRequest): Promise<Session> {
    try {
        // 创建会话记录
        const sessionResult = await sql`
            INSERT INTO sessions (
                title,
                type,
                description,
                created_by,
                primary_agent_id,
                configuration,
                created_at,
                updated_at
            ) VALUES (
                ${request.title || `与${request.agentIds.length === 1 ? '单个角色' : '多个角色'}的对话`},
                ${request.type},
                ${request.description || ''},
                ${userId},
                ${request.agentIds[0] || null},
                ${JSON.stringify({ agentIds: request.agentIds })},
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            )
            RETURNING id, title, type, description, created_by, created_at, updated_at
        `

        const session = sessionResult[0]

        // 添加会话参与者
        const participants: SessionParticipant[] = []

        // 添加用户作为参与者
        await sql`
            INSERT INTO session_participants (
                session_id,
                user_id,
                role,
                joined_at
            ) VALUES (
                ${session.id},
                ${userId},
                'owner',
                CURRENT_TIMESTAMP
            )
        `

        // 添加AI角色作为参与者
        for (const agentId of request.agentIds) {
            await sql`
                INSERT INTO session_participants (
                    session_id,
                    agent_id,
                    role,
                    joined_at
                ) VALUES (
                    ${session.id},
                    ${agentId},
                    'participant',
                    CURRENT_TIMESTAMP
                )
            `

            // 获取AI角色信息用于参与者列表
            const agentResult = await sql`
                SELECT id, name, avatar, avatar_style
                FROM ai_agents
                WHERE id = ${agentId}
            `

            if (agentResult.length > 0) {
                const agent = agentResult[0]
                participants.push({
                    id: agent.id,
                    type: 'agent',
                    name: agent.name,
                    avatar: agent.avatar,
                    avatarStyle: agent.avatar_style
                })
            }
        }

        // 构建完整的Session对象
        const fullSession: Session = {
            id: session.id,
            title: session.title,
            type: session.type as 'single' | 'group',
            description: session.description,
            participants,
            messageCount: 0,
            isPinned: false,
            isArchived: false,
            createdBy: session.created_by,
            createdAt: new Date(session.created_at),
            updatedAt: new Date(session.updated_at)
        }

        return fullSession

    } catch (error) {
        console.error('Error creating session:', error)
        throw error
    }
}

// 获取用户的所有会话
export async function getUserSessions(userId: string, filter?: SessionFilter): Promise<Session[]> {
    try {
        // 过滤条件将在下面的查询中直接使用
        // let whereClause = `WHERE sp_user.user_id = ${userId} AND sp_user.is_active = true AND s.status != 'archived'`

        // 过滤逻辑已在下面的查询中实现

        // 构建基础查询
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let sessionsResult: Record<string, any>[]

        if (!filter || (!filter.type || filter.type === 'all') && !filter.pinned && !filter.agentId) {
            // 简单查询，无过滤条件
            sessionsResult = await sql`
                SELECT 
                    s.id,
                    s.title,
                    s.type,
                    s.description,
                    s.message_count,
                    s.is_pinned,
                    s.created_by,
                    s.created_at,
                    s.updated_at,
                    (
                        SELECT json_agg(
                            json_build_object(
                                'id', COALESCE(sp.user_id::text, sp.agent_id),
                                'type', CASE 
                                    WHEN sp.user_id IS NOT NULL THEN 'user'
                                    ELSE 'agent'
                                END,
                                'name', COALESCE(u.name, a.name),
                                'avatar', COALESCE(u.avatar_url, a.avatar),
                                'avatarStyle', a.avatar_style
                            )
                        )
                        FROM session_participants sp
                        LEFT JOIN users u ON sp.user_id = u.id
                        LEFT JOIN ai_agents a ON sp.agent_id = a.id
                        WHERE sp.session_id = s.id AND sp.is_active = true
                    ) as participants,
                    (
                        SELECT json_build_object(
                            'content', m.content,
                            'sender', COALESCE(u.name, a.name),
                            'timestamp', m.created_at
                        )
                        FROM messages m
                        LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id::text
                        LEFT JOIN ai_agents a ON m.sender_type = 'agent' AND m.sender_id = a.id
                        WHERE m.session_id = s.id
                        ORDER BY m.created_at DESC
                        LIMIT 1
                    ) as last_message
                FROM sessions s
                INNER JOIN session_participants sp_user ON s.id = sp_user.session_id
                WHERE sp_user.user_id = ${userId} 
                AND sp_user.is_active = true 
                AND s.status != 'archived'
                ORDER BY s.updated_at DESC
            `
        } else {
            // 根据过滤条件构建查询
            if (filter.type && filter.type !== 'all') {
                sessionsResult = await sql`
                    SELECT 
                        s.id,
                        s.title,
                        s.type,
                        s.description,
                        s.message_count,
                        s.is_pinned,
                        s.created_by,
                        s.created_at,
                        s.updated_at,
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'id', COALESCE(sp.user_id::text, sp.agent_id),
                                    'type', CASE 
                                        WHEN sp.user_id IS NOT NULL THEN 'user'
                                        ELSE 'agent'
                                    END,
                                    'name', COALESCE(u.name, a.name),
                                    'avatar', COALESCE(u.avatar_url, a.avatar),
                                    'avatarStyle', a.avatar_style
                                )
                            )
                            FROM session_participants sp
                            LEFT JOIN users u ON sp.user_id = u.id
                            LEFT JOIN ai_agents a ON sp.agent_id = a.id
                            WHERE sp.session_id = s.id AND sp.is_active = true
                        ) as participants,
                        (
                            SELECT json_build_object(
                                'content', m.content,
                                'sender', COALESCE(u.name, a.name),
                                'timestamp', m.created_at
                            )
                            FROM messages m
                            LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id::text
                            LEFT JOIN ai_agents a ON m.sender_type = 'agent' AND m.sender_id = a.id
                            WHERE m.session_id = s.id
                            ORDER BY m.created_at DESC
                            LIMIT 1
                        ) as last_message
                    FROM sessions s
                    INNER JOIN session_participants sp_user ON s.id = sp_user.session_id
                    WHERE sp_user.user_id = ${userId} 
                    AND sp_user.is_active = true 
                    AND s.status != 'archived'
                    AND s.type = ${filter.type}
                    ORDER BY s.updated_at DESC
                `
            } else {
                // 其他过滤条件的查询，暂时返回基础查询结果
                sessionsResult = await sql`
                    SELECT 
                        s.id,
                        s.title,
                        s.type,
                        s.description,
                        s.message_count,
                        s.is_pinned,
                        s.created_by,
                        s.created_at,
                        s.updated_at,
                        (
                            SELECT json_agg(
                                json_build_object(
                                    'id', COALESCE(sp.user_id::text, sp.agent_id),
                                    'type', CASE 
                                        WHEN sp.user_id IS NOT NULL THEN 'user'
                                        ELSE 'agent'
                                    END,
                                    'name', COALESCE(u.name, a.name),
                                    'avatar', COALESCE(u.avatar_url, a.avatar),
                                    'avatarStyle', a.avatar_style
                                )
                            )
                            FROM session_participants sp
                            LEFT JOIN users u ON sp.user_id = u.id
                            LEFT JOIN ai_agents a ON sp.agent_id = a.id
                            WHERE sp.session_id = s.id AND sp.is_active = true
                        ) as participants,
                        (
                            SELECT json_build_object(
                                'content', m.content,
                                'sender', COALESCE(u.name, a.name),
                                'timestamp', m.created_at
                            )
                            FROM messages m
                            LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id::text
                            LEFT JOIN ai_agents a ON m.sender_type = 'agent' AND m.sender_id = a.id
                            WHERE m.session_id = s.id
                            ORDER BY m.created_at DESC
                            LIMIT 1
                        ) as last_message
                    FROM sessions s
                    INNER JOIN session_participants sp_user ON s.id = sp_user.session_id
                    WHERE sp_user.user_id = ${userId} 
                    AND sp_user.is_active = true 
                    AND s.status != 'archived'
                    ORDER BY s.updated_at DESC
                `
            }
        }

        const sessions: Session[] = sessionsResult.map(row => ({
            id: row.id,
            title: row.title,
            type: row.type as 'single' | 'group',
            description: row.description,
            participants: row.participants || [],
            lastMessage: row.last_message ? {
                content: row.last_message.content,
                sender: row.last_message.sender,
                timestamp: new Date(row.last_message.timestamp)
            } : undefined,
            messageCount: row.message_count || 0,
            isPinned: row.is_pinned || false,
            isArchived: false,
            createdBy: row.created_by,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        }))

        // 如果有搜索查询，进行过滤
        if (filter?.searchQuery) {
            const query = filter.searchQuery.toLowerCase()
            return sessions.filter(session =>
                session.title.toLowerCase().includes(query) ||
                session.lastMessage?.content.toLowerCase().includes(query) ||
                session.participants.some(p => p.name.toLowerCase().includes(query))
            )
        }

        return sessions

    } catch (error) {
        console.error('Error fetching user sessions:', error)
        throw error
    }
}

// 更新会话
export async function updateSession(sessionId: string, userId: string, updates: UpdateSessionRequest): Promise<Session> {
    try {


        // 简化更新操作，逐个处理字段
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let result: Record<string, any>[]

        if (updates.title !== undefined) {
            result = await sql`
                UPDATE sessions 
                SET title = ${updates.title}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${sessionId} AND created_by = ${userId}
                RETURNING id
            `
        } else if (updates.description !== undefined) {
            result = await sql`
                UPDATE sessions 
                SET description = ${updates.description}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${sessionId} AND created_by = ${userId}
                RETURNING id
            `
        } else if (updates.isPinned !== undefined) {
            result = await sql`
                UPDATE sessions 
                SET is_pinned = ${updates.isPinned}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${sessionId} AND created_by = ${userId}
                RETURNING id
            `
        } else if (updates.isArchived !== undefined) {
            const status = updates.isArchived ? 'archived' : 'active'
            result = await sql`
                UPDATE sessions 
                SET status = ${status}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ${sessionId} AND created_by = ${userId}
                RETURNING id
            `
        } else {
            // 如果没有更新，直接返回
            result = await sql`
                SELECT id FROM sessions 
                WHERE id = ${sessionId} AND created_by = ${userId}
            `
        }

        if (result.length === 0) {
            throw new Error('Session not found or access denied')
        }

        // 获取更新后的会话
        const sessions = await getUserSessions(userId, { searchQuery: undefined })
        const updatedSession = sessions.find(s => s.id === sessionId)

        if (!updatedSession) {
            throw new Error('Failed to retrieve updated session')
        }

        return updatedSession

    } catch (error) {
        console.error('Error updating session:', error)
        throw error
    }
}

// 删除会话
export async function deleteSession(sessionId: string, userId: string): Promise<void> {
    try {
        const result = await sql`
            DELETE FROM sessions 
            WHERE id = ${sessionId} 
            AND created_by = ${userId}
        `

        if (result.length === 0) {
            throw new Error('Session not found or access denied')
        }

    } catch (error) {
        console.error('Error deleting session:', error)
        throw error
    }
}

// 添加AI角色到会话
export async function addAgentToSession(sessionId: string, agentId: string, userId: string): Promise<void> {
    try {
        // 验证用户是否是会话的创建者
        const sessionCheck = await sql`
            SELECT id FROM sessions 
            WHERE id = ${sessionId} AND created_by = ${userId}
        `

        if (sessionCheck.length === 0) {
            throw new Error('Session not found or access denied')
        }

        // 检查AI角色是否已经在会话中
        const existingParticipant = await sql`
            SELECT id FROM session_participants 
            WHERE session_id = ${sessionId} 
            AND agent_id = ${agentId} 
            AND is_active = true
        `

        if (existingParticipant.length > 0) {
            throw new Error('Agent is already in the session')
        }

        // 添加AI角色到会话
        await sql`
            INSERT INTO session_participants (
                session_id,
                agent_id,
                role,
                joined_at
            ) VALUES (
                ${sessionId},
                ${agentId},
                'participant',
                CURRENT_TIMESTAMP
            )
        `

        // 更新会话类型为群聊（如果有多个参与者）
        const participantCount = await sql`
            SELECT COUNT(*) as count 
            FROM session_participants 
            WHERE session_id = ${sessionId} AND is_active = true
        `

        if (participantCount[0].count > 2) { // 用户 + 多个AI角色
            await sql`
                UPDATE sessions 
                SET type = 'group', updated_at = CURRENT_TIMESTAMP
                WHERE id = ${sessionId}
            `
        }

    } catch (error) {
        console.error('Error adding agent to session:', error)
        throw error
    }
}

// 从会话中移除AI角色
export async function removeAgentFromSession(sessionId: string, agentId: string, userId: string): Promise<void> {
    try {
        // 验证用户是否是会话的创建者
        const sessionCheck = await sql`
            SELECT id FROM sessions 
            WHERE id = ${sessionId} AND created_by = ${userId}
        `

        if (sessionCheck.length === 0) {
            throw new Error('Session not found or access denied')
        }

        // 移除AI角色
        await sql`
            UPDATE session_participants 
            SET is_active = false
            WHERE session_id = ${sessionId} 
            AND agent_id = ${agentId}
        `

        // 更新会话类型（如果只剩一个AI角色）
        const activeAgentCount = await sql`
            SELECT COUNT(*) as count 
            FROM session_participants 
            WHERE session_id = ${sessionId} 
            AND agent_id IS NOT NULL 
            AND is_active = true
        `

        if (activeAgentCount[0].count === 1) {
            await sql`
                UPDATE sessions 
                SET type = 'single', updated_at = CURRENT_TIMESTAMP
                WHERE id = ${sessionId}
            `
        }

    } catch (error) {
        console.error('Error removing agent from session:', error)
        throw error
    }
} 