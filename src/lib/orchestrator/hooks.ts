/**
 * Database hooks for persisting orchestrator state
 */

import { compress, decompress } from 'lz-string'
import { prisma } from '@/lib/database/prisma'
import type { OrchestratorState } from './types'

/**
 * Save orchestrator state to database after each turn
 */
export async function saveOrchestratorResult(state: OrchestratorState) {
  try {
    // Compress state (remove HTML and large content)
    const stateToSave = {
      ...state,
      events: state.events.map(e => ({
        ...e,
        content: e.content ? e.content.substring(0, 500) : undefined
      })),
      results: state.results.map(r => ({
        ...r,
        content: r.content.substring(0, 1000)
      }))
    }

    const compressedState = compress(JSON.stringify(stateToSave))

    await prisma.swarmChatResult.create({
      data: {
        sessionId: state.sessionId,
        turnIndex: state.turnIndex,
        stateBlob: compressedState,
        summary: state.summary || null
      }
    })

    console.log(`💾 Saved orchestrator result for session ${state.sessionId}, turn ${state.turnIndex}`)
  } catch (error) {
    console.error('Failed to save orchestrator result:', error)
  }
}

/**
 * Load previous orchestrator results for a session
 */
export async function loadOrchestratorResults(sessionId: string) {
  try {
    const results = await prisma.swarmChatResult.findMany({
      where: { sessionId },
      orderBy: { turnIndex: 'asc' }
    })

    return results.map(result => ({
      ...result,
      state: JSON.parse(decompress(result.stateBlob as string))
    }))
  } catch (error) {
    console.error('Failed to load orchestrator results:', error)
    return []
  }
}

/**
 * Get the latest turn index for a session
 */
export async function getLatestTurnIndex(sessionId: string): Promise<number> {
  try {
    const latest = await prisma.swarmChatResult.findFirst({
      where: { sessionId },
      orderBy: { turnIndex: 'desc' },
      select: { turnIndex: true }
    })

    return latest?.turnIndex || 0
  } catch (error) {
    console.error('Failed to get latest turn index:', error)
    return 0
  }
}

// Runtime graph storage (in production, use Redis)
const activeGraphs = new Map<string, any>()

export function storeActiveGraph(sessionId: string, graph: any) {
  activeGraphs.set(sessionId, graph)
}

export function getActiveGraph(sessionId: string) {
  return activeGraphs.get(sessionId)
}

export function removeActiveGraph(sessionId: string) {
  activeGraphs.delete(sessionId)
}

/**
 * Interrupt a running graph
 */
export function interruptGraph(sessionId: string) {
  const graph = getActiveGraph(sessionId)
  if (graph?.interrupt) {
    graph.interrupt()
    return true
  }
  return false
}

/**
 * Resume an interrupted graph
 */
export function resumeGraph(sessionId: string) {
  const graph = getActiveGraph(sessionId)
  if (graph?.resume) {
    graph.resume()
    return true
  }
  return false
}