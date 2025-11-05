/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Session } from '@/types'
import { useSession } from '@/components/providers/AuthProvider'
import { convertPrismaSessionToSession } from '@/utils/transformers'
import { api, APIError } from '@/lib/api-client'

export interface UseSessionManagerReturn {
    sessions: Session[]
    currentSession: Session | null
    isLoading: boolean
    error: string | null
    createSession: (sessionData: any) => Promise<void>
    selectSession: (sessionId: string) => void
    updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>
    deleteSession: (sessionId: string) => Promise<void>
    pinSession: (sessionId: string) => Promise<void>
}

export function useSessionManager(): UseSessionManagerReturn {
    const [sessions, setSessions] = useState<Session[]>([])
    const [currentSession, setCurrentSession] = useState<Session | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Get user authentication state
    const { data: sessionData, isPending } = useSession()
    const user = sessionData?.user

    // Load sessions when user authentication state changes
    useEffect(() => {
        const loadSessions = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // If user is not authenticated, return empty sessions
                if (!user?.id) {
                    setSessions([])
                    setCurrentSession(null)
                    return
                }

                console.log('Loading sessions for user:', user.id)

                // Fetch user's sessions from API using API client
                try {
                    const data = await api.sessions.list()

                    if (data.success) {
                        // 转换所有会话数据为前端格式
                        const convertedSessions = (data.data || []).map(convertPrismaSessionToSession)
                        setSessions(convertedSessions)
                        console.log('Loaded sessions:', convertedSessions.length)
                    } else {
                        throw new Error(data.error || 'Failed to load sessions')
                    }
                } catch (apiError) {
                    if (apiError instanceof APIError && apiError.status === 401) {
                        // User not authenticated, clear sessions
                        setSessions([])
                        setCurrentSession(null)
                        return
                    }
                    throw apiError
                }

            } catch (err) {
                console.error('Error loading sessions:', err)
                setError(err instanceof Error ? err.message : 'Failed to load sessions')
                setSessions([])
                setCurrentSession(null)
            } finally {
                setIsLoading(false)
            }
        }

        // Only load sessions when auth state is resolved
        if (!isPending) {
        loadSessions()
        }
    }, [user?.id, isPending])

    const createSession = async (sessionData: any) => {
        try {
            if (!user?.id) {
                throw new Error('User not authenticated')
            }

            console.log('Creating session:', sessionData)

            const data = await api.sessions.create(sessionData)

            if (data.success) {
                // 转换 Prisma 会话数据为前端格式
                const newSession = convertPrismaSessionToSession(data.data)
            setSessions(prev => [newSession, ...prev])
            setCurrentSession(newSession)
                console.log('Session created successfully:', newSession.id)
            } else {
                throw new Error(data.error || 'Failed to create session')
            }

        } catch (err) {
            console.error('Error creating session:', err)
            if (err instanceof APIError && err.status === 401) {
                throw new Error('User not authenticated')
            }
            throw err
        }
    }

    const selectSession = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId)
        if (session) {
            setCurrentSession(session)
            console.log('Selected session:', sessionId)
        }
    }

    const updateSession = async (sessionId: string, updates: Partial<Session>) => {
        try {
            if (!user?.id) {
                throw new Error('User not authenticated')
            }

            console.log('Updating session:', sessionId, updates)

            const data = await api.sessions.update(sessionId, { id: sessionId, ...updates })

            if (data.success) {
                const updatedSession = convertPrismaSessionToSession(data.data)
            setSessions(prev => prev.map(session =>
                    session.id === sessionId ? updatedSession : session
            ))

            if (currentSession?.id === sessionId) {
                    setCurrentSession(updatedSession)
                }
                console.log('Session updated successfully:', sessionId)
            } else {
                throw new Error(data.error || 'Failed to update session')
            }

        } catch (err) {
            console.error('Error updating session:', err)
            if (err instanceof APIError && err.status === 401) {
                throw new Error('User not authenticated')
            }
            throw err
        }
    }

    const deleteSession = async (sessionId: string) => {
        try {
            if (!user?.id) {
                throw new Error('User not authenticated')
            }

            console.log('Deleting session:', sessionId)

            const data = await api.sessions.delete(sessionId)

            if (data.success) {
            setSessions(prev => prev.filter(session => session.id !== sessionId))

            if (currentSession?.id === sessionId) {
                setCurrentSession(null)
            }
                console.log('Session deleted successfully:', sessionId)
            } else {
                throw new Error(data.error || 'Failed to delete session')
            }

        } catch (err) {
            console.error('Error deleting session:', err)
            if (err instanceof APIError && err.status === 401) {
                throw new Error('User not authenticated')
            }
            throw err
        }
    }

    const pinSession = async (sessionId: string) => {
        try {
            const session = sessions.find(s => s.id === sessionId)
            if (!session) {
                throw new Error('Session not found')
            }

            await updateSession(sessionId, { isPinned: !session.isPinned })
        } catch (err) {
            console.error('Error pinning session:', err)
            throw err
        }
    }

    return {
        sessions,
        currentSession,
        isLoading,
        error,
        createSession,
        selectSession,
        updateSession,
        deleteSession,
        pinSession
    }
} 