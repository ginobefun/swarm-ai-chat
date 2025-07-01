import { useState, useCallback, useRef, useEffect } from 'react'

export interface AgentInfo {
    id: string
    name: string
    avatar: string
}

/**
 * Hook for fetching agent information from backend
 * Uses backend caching, no frontend cache needed
 */
export const useAgentInfo = () => {
    const [loading, setLoading] = useState<Set<string>>(new Set())
    const isMountedRef = useRef(true)

    // Track component mount status
    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    const getAgentInfo = useCallback(async (agentId: string): Promise<AgentInfo> => {
        // Only update loading state if component is mounted
        if (isMountedRef.current) {
            setLoading(prev => new Set(prev).add(agentId))
        }

        try {
            const response = await fetch(`/api/agents/${agentId}`)
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch agent info')
            }

            return result.data
        } catch (error) {
            console.error(`Error fetching agent info for ${agentId}:`, error)
            // Return fallback info
            return {
                id: agentId,
                name: 'AI Assistant',
                avatar: '🤖'
            }
        } finally {
            // Only update loading state if component is still mounted
            if (isMountedRef.current) {
                setLoading(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(agentId)
                    return newSet
                })
            }
        }
    }, [])

    const isLoading = useCallback((agentId: string) => {
        return loading.has(agentId)
    }, [loading])

    const getBatchAgentInfo = useCallback(async (agentIds: string[]): Promise<Record<string, AgentInfo>> => {
        if (agentIds.length === 0) return {}

        try {
            const response = await fetch('/api/agents/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ agentIds })
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch agents info')
            }

            return result.data
        } catch (error) {
            console.error('Error fetching batch agent info:', error)
            // Return fallback info for all requested agents
            const fallbackInfo: Record<string, AgentInfo> = {}
            agentIds.forEach(agentId => {
                fallbackInfo[agentId] = {
                    id: agentId,
                    name: 'AI Assistant',
                    avatar: '🤖'
                }
            })
            return fallbackInfo
        }
    }, [])

    return {
        getAgentInfo,
        getBatchAgentInfo,
        isLoading
    }
} 