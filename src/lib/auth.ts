import { betterAuth } from "better-auth"
import { bearer, multiSession, oneTap } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { PrismaClient } from "@prisma/client"
import { createAuthMiddleware } from "better-auth/api"

const prisma = new PrismaClient()

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    // 邮箱密码登录
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 6,
        maxPasswordLength: 128,
    },

    // 社交登录配置
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        },
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        }
    },

    // 插件配置
    plugins: [
        nextCookies(),
        bearer(),
        multiSession(),
        oneTap(),
    ],

    // 会话配置
    session: {
        cookieCache: {
            enabled: true,
        },
        freshAge: 15 * 60,
        expiresIn: 7 * 24 * 60 * 60,
    },

    // 账户关联设置
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google", "github"],
        },
    },

    // 自动创建 SwarmUser 记录
    hooks: {
        after: createAuthMiddleware(async (ctx) => {
            try {
                // 检查是否有新用户创建
                const newSession = ctx.context.newSession
                if (!newSession || !newSession.user) {
                    return
                }

                const user = newSession.user
                console.log("✅ New user detected:", {
                    id: user.id,
                    email: user.email,
                    name: user.name
                })

                // 检查是否已存在 SwarmUser 记录
                const existingSwarmUser = await prisma.swarmUser.findUnique({
                    where: { userId: user.id }
                })

                if (existingSwarmUser) {
                    console.log("✅ SwarmUser already exists:", existingSwarmUser.id)
                    return
                }

                console.log("🚀 Creating new SwarmUser record...")

                // 生成用户名：从用户名 -> 邮箱前缀 -> 随机生成
                let baseUsername = user.name || user.email?.split('@')[0] || 'user'

                // 清理用户名：只保留字母、数字、下划线和横线
                baseUsername = baseUsername
                    .replace(/[^a-zA-Z0-9_-]/g, '')
                    .toLowerCase()
                    .substring(0, 15) // 限制长度

                // 如果清理后为空，使用默认前缀
                if (!baseUsername) {
                    baseUsername = 'user'
                }

                // 确保用户名唯一性
                let finalUsername = baseUsername
                let counter = 1
                while (await prisma.swarmUser.findUnique({ where: { username: finalUsername } })) {
                    finalUsername = `${baseUsername}${counter}`
                    counter++
                    // 防止无限循环
                    if (counter > 999) {
                        finalUsername = `user${Date.now().toString(36)}`
                        break
                    }
                }

                console.log("🔄 Generated username:", finalUsername)

                // 创建 SwarmUser 记录
                const swarmUser = await prisma.swarmUser.create({
                    data: {
                        userId: user.id,
                        username: finalUsername,
                        avatarUrl: user.image || null,
                        role: 'USER',
                        subscriptionStatus: 'FREE',
                        preferences: {
                            language: 'zh-CN',
                            theme: 'system',
                            timezone: 'Asia/Shanghai'
                        }
                    }
                })

                console.log("✅ SwarmUser created successfully:", {
                    id: swarmUser.id,
                    username: swarmUser.username,
                    userId: swarmUser.userId,
                    role: swarmUser.role
                })

            } catch (error) {
                console.error("❌ Error in Better Auth after hook:", error)

                // 记录详细错误信息
                if (error instanceof Error) {
                    console.error("❌ Error details:", {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    })
                }

                // 不抛出错误，避免影响认证流程
            }
        }),
    },

    // 密钥配置
    secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
}) 