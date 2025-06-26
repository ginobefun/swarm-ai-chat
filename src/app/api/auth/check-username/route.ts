import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'

/**
 * 检查用户名是否可用
 */
export async function POST(request: NextRequest) {
    try {
        const { username } = await request.json()

        if (!username) {
            return NextResponse.json({
                success: false,
                error: '用户名不能为空'
            }, { status: 400 })
        }

        // 验证用户名格式（6-20 字符，英文、数字、下划线）
        const usernameRegex = /^[a-zA-Z0-9_]{6,20}$/
        if (!usernameRegex.test(username)) {
            return NextResponse.json({
                success: false,
                error: '用户名格式不正确，请使用 6-20 位英文、数字或下划线'
            }, { status: 400 })
        }

        // 检查系统保留用户名
        const reservedUsernames = [
            'admin', 'administrator', 'root', 'user', 'guest', 'test',
            'system', 'api', 'support', 'help', 'service', 'info',
            'mail', 'email', 'www', 'ftp', 'ssh', 'dev', 'demo',
            'swarm', 'ai', 'bot', 'agent', 'assistant'
        ]

        if (reservedUsernames.includes(username.toLowerCase())) {
            return NextResponse.json({
                success: false,
                error: '此用户名为系统保留，请选择其他用户名'
            }, { status: 400 })
        }

        // 在 SwarmUser 表中检查用户名是否已存在
        const existingUser = await prisma.swarmUser.findFirst({
            where: {
                username: username
            }
        })

        const isAvailable = !existingUser

        return NextResponse.json({
            success: true,
            data: {
                username,
                available: isAvailable,
                message: isAvailable ? '用户名可用' : '用户名已被使用'
            }
        })
    } catch (error) {
        console.error('检查用户名可用性失败：', error)
        return NextResponse.json({
            success: false,
            error: '检查用户名可用性失败'
        }, { status: 500 })
    }
}

// 支持 OPTIONS 方法用于 CORS
export async function OPTIONS() {
    return NextResponse.json({}, { status: 200 })
} 