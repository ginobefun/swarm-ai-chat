import { prisma } from './prisma'
import type {
    SwarmChatSession,
    SwarmChatMessage,
    SwarmChatSessionParticipant,
    SwarmSessionType
} from '@prisma/client'
import type { Session as FrontendSession } from '@/types'
import { convertPrismaSessionToSession } from '@/utils/transformers'

// 使用前端的 Session 类型，保持一致性
export type { FrontendSession as Session }

// 转换函数现在从 transformers.ts 导入

// 获取所有会话
export async function getAllSessions(): Promise<SwarmChatSession[]> {
    return await prisma.swarmChatSession.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            primaryAgent: true,
            _count: {
                select: { messages: true }
            }
        }
    })
}

// 根据用户 ID 获取会话
export async function getSessionsByUserId(userId: string): Promise<FrontendSession[]> {
    try {
        const sessions = await prisma.swarmChatSession.findMany({
            where: { createdById: userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                primaryAgent: true,
                participants: {
                    include: {
                        user: true,
                        agent: true
                    }
                }
            }
        })
        return sessions.map(convertPrismaSessionToSession)
    } catch (error) {
        console.error('获取用户会话失败：', error)
        throw new Error('获取用户会话失败')
    }
}

// 根据 ID 获取单个会话
export async function getSessionById(sessionId: string): Promise<SwarmChatSession | null> {
    return await prisma.swarmChatSession.findUnique({
        where: { id: sessionId },
        include: {
            primaryAgent: true,
            messages: {
                orderBy: { createdAt: 'asc' }
            },
            participants: {
                include: {
                    user: true,
                    agent: true
                }
            }
        }
    })
}

// 创建会话
export async function createSession(data: {
    title?: string
    description?: string
    type?: SwarmSessionType
    createdById: string
    primaryAgentId?: string
}): Promise<SwarmChatSession> {
    return await prisma.swarmChatSession.create({
        data,
        include: {
            primaryAgent: true,
            createdBy: true
        }
    })
}

// 更新会话
export async function updateSession(
    sessionId: string,
    data: Partial<Pick<SwarmChatSession, 'title' | 'description' | 'status'>>
): Promise<SwarmChatSession> {
    return await prisma.swarmChatSession.update({
        where: { id: sessionId },
        data: {
            ...data,
            updatedAt: new Date()
        },
        include: {
            primaryAgent: true,
            createdBy: true,
            participants: {
                include: {
                    user: true,
                    agent: true
                }
            }
        }
    })
}

// 删除会话
export async function deleteSession(sessionId: string): Promise<void> {
    await prisma.swarmChatSession.delete({
        where: { id: sessionId }
    })
}

// 获取会话统计信息
export async function getSessionStats(userId?: string) {
    try {
        const where = userId ? { createdById: userId } : {}

        const [total, active, completed, archived] = await Promise.all([
            prisma.swarmChatSession.count({ where }),
            prisma.swarmChatSession.count({ where: { ...where, status: 'ACTIVE' } }),
            prisma.swarmChatSession.count({ where: { ...where, status: 'COMPLETED' } }),
            prisma.swarmChatSession.count({ where: { ...where, status: 'ARCHIVED' } })
        ])

        return { total, active, completed, archived }
    } catch (error) {
        console.error('获取会话统计失败：', error)
        throw new Error('获取会话统计失败')
    }
}

// 搜索会话
export async function searchSessions(query: string): Promise<SwarmChatSession[]> {
    return await prisma.swarmChatSession.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
            ]
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            primaryAgent: true,
            _count: {
                select: { messages: true }
            }
        }
    })
}

export async function addMessageToSession(data: {
    sessionId: string
    senderType: 'user' | 'agent' | 'system'
    senderId: string
    content: string
    contentType?: 'text' | 'file' | 'image' | 'code' | 'system'
    replyToId?: string
    tokenCount?: number
    processingTime?: number
    cost?: number
}): Promise<SwarmChatMessage> {
    const message = await prisma.swarmChatMessage.create({
        data: {
            ...data,
            senderType: data.senderType.toUpperCase() as 'USER' | 'AGENT' | 'SYSTEM',
            contentType: (data.contentType?.toUpperCase() || 'TEXT') as 'TEXT' | 'FILE' | 'IMAGE' | 'CODE' | 'SYSTEM'
        }
    })

    // 更新会话的消息计数和更新时间
    await prisma.swarmChatSession.update({
        where: { id: data.sessionId },
        data: {
            messageCount: { increment: 1 },
            totalCost: { increment: data.cost || 0 },
            updatedAt: new Date()
        }
    })

    return message
}

export async function getSessionMessages(sessionId: string): Promise<SwarmChatMessage[]> {
    return await prisma.swarmChatMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' }
    })
}

export async function addParticipantToSession(data: {
    sessionId: string
    userId?: string
    agentId?: string
    role?: 'owner' | 'admin' | 'participant' | 'observer'
}): Promise<SwarmChatSessionParticipant> {
    return await prisma.swarmChatSessionParticipant.create({
        data: {
            ...data,
            role: (data.role?.toUpperCase() || 'PARTICIPANT') as 'OWNER' | 'ADMIN' | 'PARTICIPANT' | 'OBSERVER'
        }
    })
}

export async function removeParticipantFromSession(
    sessionId: string,
    userId?: string,
    agentId?: string
): Promise<void> {
    await prisma.swarmChatSessionParticipant.deleteMany({
        where: {
            sessionId,
            ...(userId && { userId }),
            ...(agentId && { agentId })
        }
    })
}

export async function getUserSessions(userId: string): Promise<SwarmChatSession[]> {
    return await prisma.swarmChatSession.findMany({
        where: { createdById: userId },
        orderBy: { updatedAt: 'desc' },
        include: {
            primaryAgent: true,
            _count: {
                select: { messages: true }
            }
        }
    })
} 