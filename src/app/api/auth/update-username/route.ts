import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/database/prisma'

export async function POST(request: Request) {
    try {
        // 验证用户是否已登录
        const session = await auth.api.getSession({
            headers: request.headers
        })

        if (!session?.user?.id) {
            return NextResponse.json({
                success: false,
                error: '用户未登录'
            }, { status: 401 })
        }

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

        // 检查用户名是否已被其他用户使用
        const existingUser = await prisma.swarmUser.findFirst({
            where: {
                username: username,
                userId: { not: session.user.id }
            }
        })

        if (existingUser) {
            return NextResponse.json({
                success: false,
                error: '用户名已被使用'
            }, { status: 400 })
        }

        // 创建或更新 SwarmUser 记录
        const swarmUser = await prisma.swarmUser.upsert({
            where: { userId: session.user.id },
            update: { username },
            create: {
                userId: session.user.id,
                username,
                role: 'USER',
                subscriptionStatus: 'FREE',
                preferences: {}
            }
        })

        return NextResponse.json({
            success: true,
            data: {
                username: swarmUser.username,
                message: '用户名设置成功'
            }
        })
    } catch (error) {
        console.error('更新用户名失败：', error)
        return NextResponse.json({
            success: false,
            error: '更新用户名失败'
        }, { status: 500 })
    }
} 