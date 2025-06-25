import { NextRequest, NextResponse } from 'next/server'
import {
    createSession,
    updateSession,
    deleteSession,
    searchSessions,
    getSessionsByUserId,
    getAllSessions
    // addAgentToSession,
    // removeAgentFromSession
} from '@/lib/database/sessions-prisma'
import { isDatabaseConfigured } from '@/lib/database/connection'

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
        const userId = searchParams.get('userId')
        const search = searchParams.get('search')

        let sessions

        if (search) {
            // 搜索会话
            sessions = await searchSessions(search, userId || undefined)
        } else if (userId) {
            // 获取特定用户的会话
            sessions = await getSessionsByUserId(userId)
        } else {
            // 获取所有会话
            sessions = await getAllSessions()
        }

        return NextResponse.json({
            success: true,
            data: sessions,
            count: sessions.length
        })
    } catch (error) {
        console.error('获取会话列表失败：', error)
        return NextResponse.json(
            {
                success: false,
                error: '获取会话列表失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
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

        // 验证必要字段
        if (!body.createdById) {
            return NextResponse.json(
                { success: false, error: '缺少必要字段：createdById' },
                { status: 400 }
            )
        }

        const sessionData = {
            title: body.title || '新会话',
            description: body.description,
            type: body.type || 'direct',
            createdById: body.createdById,
            primaryAgentId: body.primaryAgentId,
            configuration: body.configuration || {},
            isPublic: body.isPublic || false,
            isTemplate: body.isTemplate || false
        }

        const session = await createSession(sessionData)

        return NextResponse.json({
            success: true,
            data: session
        }, { status: 201 })
    } catch (error) {
        console.error('创建会话失败：', error)
        return NextResponse.json(
            {
                success: false,
                error: '创建会话失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
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

        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: '缺少会话 ID' },
                { status: 400 }
            )
        }

        const session = await updateSession(id, updates)

        return NextResponse.json({
            success: true,
            data: session
        })
    } catch (error) {
        console.error('更新会话失败：', error)
        return NextResponse.json(
            {
                success: false,
                error: '更新会话失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
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
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: '缺少会话 ID' },
                { status: 400 }
            )
        }

        await deleteSession(id)

        return NextResponse.json({
            success: true,
            message: '会话删除成功'
        })
    } catch (error) {
        console.error('删除会话失败：', error)
        return NextResponse.json(
            {
                success: false,
                error: '删除会话失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
    }
} 