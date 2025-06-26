import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
    // createSession,
    updateSession,
    deleteSession,
    searchSessions,
    getSessionsByUserId
    // addAgentToSession,
    // removeAgentFromSession
} from '@/lib/database/sessions-prisma'
import { isDatabaseConfigured } from '@/lib/database/connection'
import { prisma } from '@/lib/database/prisma'

export async function GET(request: NextRequest) {
    try {
        // Check database configuration
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        // Verify user authentication
        const session = await auth.api.getSession({
            headers: request.headers
        })

        // If user is not authenticated, return empty sessions
        if (!session?.user?.id) {
            return NextResponse.json({
                success: true,
                data: [],
                count: 0,
                message: 'User not authenticated'
            })
        }

        // 获取对应的 SwarmUser
        const swarmUser = await prisma.swarmUser.findUnique({
            where: { userId: session.user.id }
        })

        if (!swarmUser) {
            // 如果没有 SwarmUser 记录，返回空结果
            return NextResponse.json({
                success: true,
                data: [],
                count: 0,
                message: 'No SwarmUser record found'
            })
        }

        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search')

        let sessions

        if (search) {
            // Search sessions for the authenticated user only
            sessions = await searchSessions(search)
            // Filter to only show user's sessions (using SwarmUser ID)
            sessions = sessions.filter(s => s.createdById === swarmUser.id)
        } else {
            // Get sessions for the authenticated user only (using SwarmUser ID)
            sessions = await getSessionsByUserId(swarmUser.id)
        }

        return NextResponse.json({
            success: true,
            data: sessions,
            count: sessions.length
        })
    } catch (error) {
        console.error('Failed to fetch sessions:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch sessions',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Check database configuration
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        // Verify user authentication
        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                error: 'User not authenticated'
            }, { status: 401 })
        }

        // 确保 SwarmUser 记录存在，并获取 SwarmUser ID
        const swarmUser = await prisma.swarmUser.upsert({
            where: { userId: session.user.id },
            update: {},
            create: {
                userId: session.user.id,
                role: 'USER',
                subscriptionStatus: 'FREE',
                preferences: {}
            }
        })

        const body = await request.json()
        console.log('Creating session with data:', body)

        // 处理智能体选择逻辑
        const agentIds = body.agentIds || []
        const primaryAgentId = body.primaryAgentId || (agentIds.length > 0 ? agentIds[0] : undefined)

        const sessionData = {
            title: body.title || 'New Session',
            description: body.description,
            type: body.type || (agentIds.length <= 1 ? 'DIRECT' : 'GROUP'),
            createdById: swarmUser.id, // Use SwarmUser ID, not User ID
            primaryAgentId: primaryAgentId
        }

        // 使用事务创建会话和参与者记录
        const result = await prisma.$transaction(async (tx) => {
            // 创建会话
            const newSession = await tx.swarmChatSession.create({
                data: sessionData,
                include: {
                    primaryAgent: true,
                    createdBy: true
                }
            })

            // 创建用户参与者记录
            await tx.swarmChatSessionParticipant.create({
                data: {
                    sessionId: newSession.id,
                    userId: swarmUser.id,
                    role: 'OWNER',
                    isActive: true
                }
            })

            // 创建智能体参与者记录
            if (agentIds.length > 0) {
                const participantData = agentIds.map((agentId: string) => ({
                    sessionId: newSession.id,
                    agentId: agentId,
                    role: agentId === primaryAgentId ? 'ADMIN' : 'PARTICIPANT',
                    isActive: true
                }))

                await tx.swarmChatSessionParticipant.createMany({
                    data: participantData
                })
            }

            // 返回完整的会话信息，包含参与者
            return await tx.swarmChatSession.findUnique({
                where: { id: newSession.id },
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
        })

        console.log('Session created successfully:', result?.id)

        return NextResponse.json({
            success: true,
            data: result
        }, { status: 201 })
    } catch (error) {
        console.error('Failed to create session:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create session',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Check database configuration
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        // Verify user authentication
        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                error: 'User not authenticated'
            }, { status: 401 })
        }

        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Session ID is required' },
                { status: 400 }
            )
        }

        // TODO: Add ownership verification to ensure user can only update their own sessions
        // const existingSession = await getSessionById(id)
        // if (existingSession.createdById !== session.user.id) {
        //     return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
        // }

        const updatedSession = await updateSession(id, updates)

        return NextResponse.json({
            success: true,
            data: updatedSession
        })
    } catch (error) {
        console.error('Failed to update session:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update session',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Check database configuration
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        // Verify user authentication
        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                error: 'User not authenticated'
            }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Session ID is required' },
                { status: 400 }
            )
        }

        // TODO: Add ownership verification to ensure user can only delete their own sessions
        // const existingSession = await getSessionById(id)
        // if (existingSession.createdById !== session.user.id) {
        //     return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
        // }

        await deleteSession(id)

        return NextResponse.json({
            success: true,
            message: 'Session deleted successfully'
        })
    } catch (error) {
        console.error('Failed to delete session:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete session',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
} 