import { NextRequest, NextResponse } from 'next/server'
import {
    createSession,
    getUserSessions,
    updateSession,
    deleteSession
    // addAgentToSession,
    // removeAgentFromSession
} from '@/lib/database/sessions'
import { isDatabaseConfigured } from '@/lib/database/connection'
import { CreateSessionRequest, UpdateSessionRequest, SessionFilter } from '@/types'

// 模拟用户ID (实际项目中应该从认证系统获取)
const MOCK_USER_ID = 'user-001'

export async function GET(request: NextRequest) {
    try {
        // 检查数据库是否配置
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)

        // 构建过滤条件
        const filter: SessionFilter = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: (searchParams.get('type') as any) || 'all',
            pinned: searchParams.get('pinned') === 'true' ? true : undefined,
            agentId: searchParams.get('agentId') || undefined,
            searchQuery: searchParams.get('q') || undefined
        }

        const sessions = await getUserSessions(MOCK_USER_ID, filter)

        // 按分组组织会话
        const pinnedSessions = sessions.filter(s => s.isPinned)
        const recentSessions = sessions.filter(s => !s.isPinned)

        // 按AI角色分组
        const agentGroups = new Map<string, (typeof sessions)>()
        sessions.forEach(session => {
            session.participants
                .filter(p => p.type === 'agent')
                .forEach(agent => {
                    if (!agentGroups.has(agent.id)) {
                        agentGroups.set(agent.id, [])
                    }
                    agentGroups.get(agent.id)!.push(session)
                })
        })

        return NextResponse.json({
            success: true,
            sessions,
            groups: {
                pinned: pinnedSessions,
                recent: recentSessions,
                byAgent: Object.fromEntries(agentGroups)
            },
            count: sessions.length
        })
    } catch (error) {
        console.error('Error fetching sessions:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch sessions'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        // 检查数据库是否配置
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        const body = await request.json()
        const createRequest: CreateSessionRequest = body

        // 验证请求数据
        if (!createRequest.agentIds || createRequest.agentIds.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'At least one agent ID is required'
            }, { status: 400 })
        }

        // 确定会话类型
        if (!createRequest.type) {
            createRequest.type = createRequest.agentIds.length === 1 ? 'single' : 'group'
        }

        const session = await createSession(MOCK_USER_ID, createRequest)

        return NextResponse.json({
            success: true,
            session,
            message: 'Session created successfully'
        })
    } catch (error) {
        console.error('Error creating session:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create session'
        }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        // 检查数据库是否配置
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('id')

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                error: 'Session ID is required'
            }, { status: 400 })
        }

        const body = await request.json()
        const updateRequest: UpdateSessionRequest = body

        const session = await updateSession(sessionId, MOCK_USER_ID, updateRequest)

        return NextResponse.json({
            success: true,
            session,
            message: 'Session updated successfully'
        })
    } catch (error) {
        console.error('Error updating session:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update session'
        }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // 检查数据库是否配置
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('id')

        if (!sessionId) {
            return NextResponse.json({
                success: false,
                error: 'Session ID is required'
            }, { status: 400 })
        }

        await deleteSession(sessionId, MOCK_USER_ID)

        return NextResponse.json({
            success: true,
            message: 'Session deleted successfully'
        })
    } catch (error) {
        console.error('Error deleting session:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete session'
        }, { status: 500 })
    }
} 