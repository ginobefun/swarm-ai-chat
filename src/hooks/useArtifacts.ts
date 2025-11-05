'use client'

import { useState, useEffect, useCallback } from 'react'
import { Artifact } from '@/types'

interface UseArtifactsOptions {
  sessionId?: string
  enabled?: boolean
}

interface UseArtifactsResult {
  artifacts: Artifact[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  togglePin: (artifactId: string) => Promise<void>
}

/**
 * Custom hook to manage artifacts for a session
 */
export function useArtifacts({ sessionId, enabled = true }: UseArtifactsOptions): UseArtifactsResult {
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArtifacts = useCallback(async () => {
    if (!sessionId || !enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/artifacts?sessionId=${sessionId}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch artifacts: ${response.statusText}`)
      }

      const data = await response.json()
      setArtifacts(data.artifacts || [])
    } catch (err) {
      console.error('Error fetching artifacts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch artifacts')
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, enabled])

  const togglePin = useCallback(async (artifactId: string) => {
    try {
      const artifact = artifacts.find(a => a.id === artifactId)
      if (!artifact) return

      const response = await fetch('/api/artifacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artifactId,
          isPinned: !artifact.isPinned,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update artifact')
      }

      const data = await response.json()

      // Update local state
      setArtifacts(prev =>
        prev.map(a => a.id === artifactId ? data.artifact : a)
      )
    } catch (err) {
      console.error('Error toggling pin:', err)
      setError(err instanceof Error ? err.message : 'Failed to update artifact')
    }
  }, [artifacts])

  // Fetch artifacts when sessionId changes
  useEffect(() => {
    fetchArtifacts()
  }, [fetchArtifacts])

  return {
    artifacts,
    isLoading,
    error,
    refetch: fetchArtifacts,
    togglePin,
  }
}
