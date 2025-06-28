/* eslint-disable @typescript-eslint/no-explicit-any */
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
        // Clean and serialize state safely
        const stateToSave = {
            ...state,
            events: state.events.map(e => ({
                ...e,
                timestamp: e.timestamp instanceof Date ? e.timestamp.toISOString() : e.timestamp,
                content: e.content ? sanitizeText(e.content.substring(0, 500)) : undefined
            })),
            results: state.results.map(r => ({
                ...r,
                timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : r.timestamp,
                content: sanitizeText(r.content.substring(0, 1000))
            })),
            userMessage: sanitizeText(state.userMessage?.substring(0, 2000) || '')
        }

        // Safe JSON stringify with fallback
        let jsonString: string
        try {
            jsonString = JSON.stringify(stateToSave, null, 0)
        } catch (stringifyError) {
            console.warn('JSON stringify failed, using fallback:', stringifyError)
            // Fallback: create a minimal state
            jsonString = JSON.stringify({
                sessionId: state.sessionId,
                turnIndex: state.turnIndex,
                summary: state.summary,
                tasksCount: state.tasks?.length || 0,
                resultsCount: state.results?.length || 0,
                eventsCount: state.events?.length || 0,
                timestamp: new Date().toISOString()
            })
        }

        const compressedState = compress(jsonString)

        await prisma.swarmChatResult.create({
            data: {
                sessionId: state.sessionId,
                turnIndex: state.turnIndex,
                stateBlob: compressedState,
                summary: state.summary ? sanitizeText(state.summary.substring(0, 1000)) : null
            }
        })

        console.log(`💾 Saved orchestrator result for session ${state.sessionId}, turn ${state.turnIndex}`)
    } catch (error) {
        console.error('Failed to save orchestrator result:', error)
    }
}

/**
 * Sanitize text to remove problematic Unicode characters
 */
function sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') return ''

    return text
        // Remove surrogate pairs and invalid Unicode
        .replace(/[\uD800-\uDFFF]/g, '')
        // Remove control characters except common ones
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Normalize Unicode
        .normalize('NFC')
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