'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { authClient } from '@/lib/auth-client'

interface User {
    id: string
    email: string
    username?: string
    name?: string
    image?: string
    avatarUrl?: string
    role?: string
}

interface Session {
    user: User
    token: string
    expiresAt: Date
}

interface AuthContextType {
    session: Session | null
    isPending: boolean
    error: Error | null
    signOut: () => Promise<void>
    refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [isPending, setIsPending] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // 获取会话
    const fetchSession = async () => {
        try {
            setIsPending(true)
            setError(null)

            const { data } = await authClient.getSession()

            if (data?.session && data?.user) {
                setSession({
                    user: {
                        ...data.user,
                        image: data.user.image || undefined,
                    },
                    token: data.session.token,
                    expiresAt: new Date(data.session.expiresAt)
                })
            } else {
                setSession(null)
            }
        } catch (err) {
            console.error('Failed to fetch session:', err)
            setError(err instanceof Error ? err : new Error('Failed to fetch session'))
            setSession(null)
        } finally {
            setIsPending(false)
        }
    }

    // 登出
    const signOut = async () => {
        try {
            await authClient.signOut()
            setSession(null)
        } catch (err) {
            console.error('Failed to sign out:', err)
            throw err
        }
    }

    // 刷新会话
    const refreshSession = async () => {
        await fetchSession()
    }

    // 初始化时获取会话
    useEffect(() => {
        fetchSession()
    }, [])

    // 监听存储变化（多标签页同步）
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'better-auth.session' || e.key === null) {
                fetchSession()
            }
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const value: AuthContextType = {
        session,
        isPending,
        error,
        signOut,
        refreshSession,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// 兼容 Better Auth 的 useSession hook
export function useSession() {
    const { session, isPending, error } = useAuth()

    return {
        data: session ? {
            user: session.user,
            session: {
                token: session.token,
                expiresAt: session.expiresAt.toISOString()
            }
        } : null,
        isPending,
        error
    }
} 