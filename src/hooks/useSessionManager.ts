/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import { Session } from '@/types'

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

    // 模拟加载会话数据
    useEffect(() => {
        const loadSessions = async () => {
            try {
                setIsLoading(true)
                // 这里应该是实际的 API 调用
                // const response = await fetch('/api/sessions')
                // const data = await response.json()

                // 模拟数据
                const mockSessions: Session[] = []
                setSessions(mockSessions)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load sessions')
            } finally {
                setIsLoading(false)
            }
        }

        loadSessions()
    }, [])

    const createSession = async (sessionData: any) => {
        try {
            // 这里应该是实际的 API 调用
            // const response = await fetch('/api/sessions', { method: 'POST', body: JSON.stringify(sessionData) })
            // const newSession = await response.json()

            // 模拟创建会话
            const newSession: Session = {
                id: Date.now().toString(),
                title: sessionData.title || 'New Session',
                type: sessionData.type || 'single',
                participants: sessionData.participants || [],
                messageCount: 0,
                isPinned: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdById: sessionData.createdById || 'unknown'
            }

            setSessions(prev => [newSession, ...prev])
            setCurrentSession(newSession)
        } catch (err) {
            console.error(err)
            throw new Error('Failed to create session')
        }
    }

    const selectSession = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId)
        if (session) {
            setCurrentSession(session)
        }
    }

    const updateSession = async (sessionId: string, updates: Partial<Session>) => {
        try {
            // 这里应该是实际的 API 调用
            setSessions(prev => prev.map(session =>
                session.id === sessionId
                    ? { ...session, ...updates, updatedAt: new Date() }
                    : session
            ))

            if (currentSession?.id === sessionId) {
                setCurrentSession(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null)
            }
        } catch (err) {
            console.error(err)
            throw new Error('Failed to update session')
        }
    }

    const deleteSession = async (sessionId: string) => {
        try {
            // 这里应该是实际的 API 调用
            setSessions(prev => prev.filter(session => session.id !== sessionId))

            if (currentSession?.id === sessionId) {
                setCurrentSession(null)
            }
        } catch (err) {
            console.error(err)
            throw new Error('Failed to delete session')
        }
    }

    const pinSession = async (sessionId: string) => {
        try {
            // 这里应该是实际的 API 调用
            setSessions(prev => prev.map(session =>
                session.id === sessionId
                    ? { ...session, isPinned: !session.isPinned }
                    : session
            ))
        } catch (err) {
            console.error(err)
            throw new Error('Failed to pin session')
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