import { NextRequest, NextResponse } from 'next/server'
import { createSession } from '@/lib/database/sessions-prisma'

const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'

export async function POST(request: NextRequest) {
    try {
        const { primaryAgentId = 'assistant', title = '测试会话' } = await request.json()

        const sessionData = {
            title,
            type: 'direct' as const,
            description: '这是一个测试会话，用于验证会话创建功能',
            createdById: MOCK_USER_ID,
            primaryAgentId,
            configuration: {},
            isPublic: false,
            isTemplate: false
        }

        console.log('Creating test session with request:', sessionData)

        const session = await createSession(sessionData)

        return NextResponse.json({
            success: true,
            session,
            message: '测试会话创建成功'
        })

    } catch (error) {
        console.error('Test session creation error:', error)

        // 返回详细的错误信息用于诊断
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            details: {
                name: error instanceof Error ? error.name : 'Unknown',
                stack: error instanceof Error ? error.stack : undefined,
                cause: error instanceof Error && 'cause' in error ? error.cause : undefined
            }
        }, { status: 500 })
    }
}

// 用于获取可用的AI角色列表
export async function GET() {
    try {
        // 简单返回一些默认角色ID用于测试
        const availableAgents = [
            { id: 'assistant', name: '通用助手' },
            { id: 'coder', name: '编程助手' },
            { id: 'writer', name: '写作助手' }
        ]

        return NextResponse.json({
            success: true,
            agents: availableAgents,
            message: '可用角色列表获取成功'
        })

    } catch (error) {
        console.error('Get available agents error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 