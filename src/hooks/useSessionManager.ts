/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Session } from '@/types'
import { useSession } from '@/components/providers/AuthProvider'
import { convertPrismaSessionToSession } from '@/utils/transformers'

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

                // Fetch user's sessions from API
                const response = await fetch('/api/sessions', {
                    credentials: 'include', // Include cookies for authentication
                })

                if (!response.ok) {
                    if (response.status === 401) {
                        // User not authenticated, clear sessions
                        setSessions([])
                        setCurrentSession(null)
                        return
                    }
                    throw new Error(`Failed to fetch sessions: ${response.status}`)
                }

                const data = await response.json()

                if (data.success) {
                    // 转换所有会话数据为前端格式
                    const convertedSessions = (data.data || []).map(convertPrismaSessionToSession)
                    setSessions(convertedSessions)
                    console.log('Loaded sessions:', convertedSessions.length)
                } else {
                    throw new Error(data.error || 'Failed to load sessions')
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

            const response = await fetch('/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify(sessionData)
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('User not authenticated')
                }
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create session')
            }

            const data = await response.json()

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

            const response = await fetch('/api/sessions', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies for authentication
                body: JSON.stringify({ id: sessionId, ...updates })
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('User not authenticated')
                }
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to update session')
            }

            const data = await response.json()

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
            throw err
        }
    }

    const deleteSession = async (sessionId: string) => {
        try {
            if (!user?.id) {
                throw new Error('User not authenticated')
            }

            console.log('Deleting session:', sessionId)

            const response = await fetch(`/api/sessions?id=${sessionId}`, {
                method: 'DELETE',
                credentials: 'include', // Include cookies for authentication
            })

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('User not authenticated')
                }
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to delete session')
            }

            const data = await response.json()

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