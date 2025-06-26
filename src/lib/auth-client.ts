import { createAuthClient } from "better-auth/react"
import { multiSessionClient, oneTapClient } from "better-auth/client/plugins"
import { toast } from "sonner"

export const authClient = createAuthClient({
    plugins: [
        // 多会话支持
        multiSessionClient(),
        // Google One Tap 登录
        oneTapClient({
            clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            promptOptions: {
                maxAttempts: 2,  // 最多尝试显示 2 次
            },
        }),
    ],
    // 错误处理
    fetchOptions: {
        onError(e) {
            // 处理请求限制错误
            if (e.error.status === 429) {
                toast.error("请求过于频繁，请稍后再试")
            }
            // 处理其他常见错误
            if (e.error.status === 401) {
                toast.error("请先登录")
            }
            if (e.error.status === 403) {
                toast.error("没有权限访问")
            }
        },
    },
})

// 导出常用方法便于使用
export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
    listSessions,
    revokeSession,
} = authClient 