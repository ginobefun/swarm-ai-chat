import { prisma } from './prisma'
import type { Session as PrismaSession, SessionType, SessionStatus, Prisma } from '@prisma/client'

// 定义会话类型，与前端兼容
export interface Session {
    id: string
    title?: string | null
    description?: string | null
    type: 'direct' | 'group' | 'workflow'
    status: 'active' | 'paused' | 'completed' | 'archived'
    createdById: string
    primaryAgentId?: string | null
    configuration: Prisma.JsonValue
    isPublic: boolean
    isTemplate: boolean
    messageCount: number
    totalCost: number
    createdAt: Date
    updatedAt: Date
}

// 转换 Prisma 会话为前端会话格式
function convertPrismaSessionToSession(session: PrismaSession): Session {
    return {
        id: session.id,
        title: session.title,
        description: session.description,
        type: session.type.toLowerCase() as 'direct' | 'group' | 'workflow',
        status: session.status.toLowerCase() as 'active' | 'paused' | 'completed' | 'archived',
        createdById: session.createdById,
        primaryAgentId: session.primaryAgentId,
        configuration: session.configuration,
        isPublic: session.isPublic,
        isTemplate: session.isTemplate,
        messageCount: session.messageCount,
        totalCost: Number(session.totalCost),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
    }
}

// 获取所有会话
export async function getAllSessions(): Promise<Session[]> {
    try {
        const sessions = await prisma.session.findMany({
            orderBy: { updatedAt: 'desc' }
        })
        return sessions.map(convertPrismaSessionToSession)
    } catch (error) {
        console.error('获取会话列表失败：', error)
        throw new Error('获取会话列表失败')
    }
}

// 根据用户 ID 获取会话
export async function getSessionsByUserId(userId: string): Promise<Session[]> {
    try {
        const sessions = await prisma.session.findMany({
            where: { createdById: userId },
            orderBy: { updatedAt: 'desc' }
        })
        return sessions.map(convertPrismaSessionToSession)
    } catch (error) {
        console.error('获取用户会话失败：', error)
        throw new Error('获取用户会话失败')
    }
}

// 根据 ID 获取单个会话
export async function getSessionById(id: string): Promise<Session | null> {
    try {
        const session = await prisma.session.findUnique({
            where: { id }
        })
        return session ? convertPrismaSessionToSession(session) : null
    } catch (error) {
        console.error('获取会话详情失败：', error)
        throw new Error('获取会话详情失败')
    }
}

// 创建会话
export async function createSession(sessionData: {
    title?: string
    description?: string
    type?: 'direct' | 'group' | 'workflow'
    createdById: string
    primaryAgentId?: string
    configuration?: Prisma.InputJsonValue
    isPublic?: boolean
    isTemplate?: boolean
}): Promise<Session> {
    try {
        const session = await prisma.session.create({
            data: {
                title: sessionData.title || '新会话',
                description: sessionData.description,
                type: (sessionData.type?.toUpperCase() || 'DIRECT') as SessionType,
                createdById: sessionData.createdById,
                primaryAgentId: sessionData.primaryAgentId,
                configuration: sessionData.configuration || {},
                isPublic: sessionData.isPublic || false,
                isTemplate: sessionData.isTemplate || false
            }
        })
        return convertPrismaSessionToSession(session)
    } catch (error) {
        console.error('创建会话失败：', error)
        throw new Error('创建会话失败')
    }
}

// 更新会话
export async function updateSession(
    id: string,
    updates: Partial<Pick<Session, 'title' | 'description' | 'status' | 'configuration'>>
): Promise<Session> {
    try {
        const updateData: Prisma.SessionUpdateInput = {}

        if (updates.title !== undefined) updateData.title = updates.title
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.status !== undefined) updateData.status = updates.status.toUpperCase() as SessionStatus
        if (updates.configuration !== undefined) updateData.configuration = updates.configuration as Prisma.InputJsonValue

        const session = await prisma.session.update({
            where: { id },
            data: updateData
        })
        return convertPrismaSessionToSession(session)
    } catch (error) {
        console.error('更新会话失败：', error)
        throw new Error('更新会话失败')
    }
}

// 删除会话
export async function deleteSession(id: string): Promise<void> {
    try {
        await prisma.session.delete({
            where: { id }
        })
    } catch (error) {
        console.error('删除会话失败：', error)
        throw new Error('删除会话失败')
    }
}

// 获取会话统计信息
export async function getSessionStats(userId?: string) {
    try {
        const where = userId ? { createdById: userId } : {}

        const [total, active, completed, archived] = await Promise.all([
            prisma.session.count({ where }),
            prisma.session.count({ where: { ...where, status: 'ACTIVE' } }),
            prisma.session.count({ where: { ...where, status: 'COMPLETED' } }),
            prisma.session.count({ where: { ...where, status: 'ARCHIVED' } })
        ])

        return { total, active, completed, archived }
    } catch (error) {
        console.error('获取会话统计失败：', error)
        throw new Error('获取会话统计失败')
    }
}

// 搜索会话
export async function searchSessions(query: string, userId?: string): Promise<Session[]> {
    try {
        const where = {
            AND: [
                userId ? { createdById: userId } : {},
                {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' as const } },
                        { description: { contains: query, mode: 'insensitive' as const } }
                    ]
                }
            ]
        }

        const sessions = await prisma.session.findMany({
            where,
            orderBy: { updatedAt: 'desc' }
        })
        return sessions.map(convertPrismaSessionToSession)
    } catch (error) {
        console.error('搜索会话失败：', error)
        throw new Error('搜索会话失败')
    }
} 