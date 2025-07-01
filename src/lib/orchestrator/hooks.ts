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
    const startTime = Date.now()
    try {
        console.log(`💾 Starting orchestrator result save`, {
            sessionId: state.sessionId,
            turnIndex: state.turnIndex,
            hasSummary: !!state.summary,
            tasksCount: state.tasks?.length || 0,
            resultsCount: state.results?.length || 0,
            eventsCount: state.events?.length || 0,
            costUSD: state.costUSD
        })

        // Use a much simpler and safer approach
        const safeSummary = extractSafeText(state.summary || '', 1000)
        console.log(`💾 Summary sanitization`, {
            originalLength: state.summary?.length || 0,
            safeLength: safeSummary.length,
            wasModified: state.summary !== safeSummary
        })

        // Create minimal state for compression - only store essential data
        const minimalState = {
            sessionId: state.sessionId || '',
            turnIndex: state.turnIndex || 0,
            shouldClarify: Boolean(state.shouldClarify),
            hasSummary: Boolean(state.summary),
            tasksCount: state.tasks?.length || 0,
            resultsCount: state.results?.length || 0,
            eventsCount: state.events?.length || 0,
            costUSD: Number(state.costUSD) || 0,
            timestamp: new Date().toISOString()
        }

        console.log(`💾 Minimal state created`, {
            stateKeys: Object.keys(minimalState),
            stateSize: JSON.stringify(minimalState).length
        })

        let compressedState: string
        try {
            const jsonString = JSON.stringify(minimalState)
            const uncompressedSize = jsonString.length
            console.log('💾 State JSON created', {
                size: uncompressedSize,
                preview: jsonString.substring(0, 200)
            })

            compressedState = compress(jsonString)
            const compressedSize = compressedState.length
            const compressionRatio = (compressedSize / uncompressedSize * 100).toFixed(1)

            console.log('💾 State compression completed', {
                uncompressedSize,
                compressedSize,
                compressionRatio: `${compressionRatio}%`,
                spaceSaved: uncompressedSize - compressedSize
            })
        } catch (compressionError) {
            console.error('💾 Compression failed, using fallback minimal state:', {
                error: (compressionError as Error).message,
                originalStateKeys: Object.keys(minimalState)
            })

            const fallbackState = {
                sessionId: sanitizeForDB(state.sessionId || '', 100),
                turnIndex: Number(state.turnIndex) || 0,
                timestamp: new Date().toISOString(),
                error: 'compression_failed'
            }
            compressedState = JSON.stringify(fallbackState)
            console.log('💾 Fallback state created', {
                fallbackKeys: Object.keys(fallbackState),
                size: compressedState.length
            })
        }

        // Prepare database data with ultra-safe sanitization
        const dbData = {
            sessionId: sanitizeForDB(state.sessionId || '', 100),
            turnIndex: Math.max(0, Number(state.turnIndex) || 0),
            stateBlob: sanitizeForDB(compressedState, 50000), // Limit compressed state size
            summary: safeSummary || null
        }

        console.log('💾 Preparing database save', {
            sanitizedSessionId: dbData.sessionId,
            turnIndex: dbData.turnIndex,
            stateBlobSize: dbData.stateBlob.length,
            hasSummary: !!dbData.summary,
            summaryLength: dbData.summary?.length || 0
        })

        // Save orchestrator result with error handling
        await (prisma as any).swarmChatResult.create({ data: dbData })
        console.log('✅ Database save successful')

        // Use the sanitized sessionId for subsequent saves
        const safeSessionId = sanitizeForDB(state.sessionId || '', 100)
        const safeTurnIndex = Math.max(0, Number(state.turnIndex) || 0)

        // Save tasks to database if they exist
        if (state.tasks && state.tasks.length > 0) {
            console.log(`💾 Saving ${state.tasks.length} tasks to database...`)
            await saveTasks(safeSessionId, safeTurnIndex, state.tasks)
        }

        // Save results to database if they exist
        if (state.results && state.results.length > 0) {
            console.log(`💾 Saving ${state.results.length} results to database...`)
            await saveResults(safeSessionId, safeTurnIndex, state.results)
        }

        const executionTime = Date.now() - startTime
        console.log(`✅ Orchestrator result save completed successfully`, {
            sessionId: state.sessionId,
            turnIndex: state.turnIndex,
            executionTimeMs: executionTime,
            tasksCount: state.tasks?.length || 0,
            resultsCount: state.results?.length || 0
        })
    } catch (error) {
        const executionTime = Date.now() - startTime
        const errorInfo = error instanceof Error ? {
            message: error.message,
            stack: error.stack,
            name: error.constructor.name
        } : {
            message: String(error),
            stack: undefined,
            name: 'Unknown'
        }

        console.error('🚨 Failed to save orchestrator result:', {
            sessionId: state.sessionId,
            turnIndex: state.turnIndex,
            error: errorInfo.message,
            errorStack: errorInfo.stack,
            executionTimeMs: executionTime,
            errorType: errorInfo.name
        })
        // Don't throw to prevent breaking the orchestration flow
    }
}

/**
 * Save task states to database
 */
export async function saveTasks(sessionId: string, turnIndex: number, tasks: any[]) {
    try {
        for (const task of tasks) {
            // Create a summary message for the task with sanitized content
            const taskMessage = sanitizeForDB(
                `🎯 **任务创建**: ${task.title || 'Untitled'}\n` +
                `📋 **描述**: ${task.description || 'No description'}\n` +
                `👤 **分配给**: ${task.assignedTo || 'Unassigned'}\n` +
                `📊 **状态**: ${task.status || 'unknown'}\n` +
                `⭐ **优先级**: ${task.priority || 'normal'}`,
                1500
            )

            // Create safe metadata - don't store complex data, just JSON-serializable strings
            const safeMetadata = JSON.stringify({
                taskId: sanitizeForDB(task.id || '', 50),
                assignedTo: sanitizeForDB(task.assignedTo || '', 100),
                status: sanitizeForDB(task.status || 'unknown', 50),
                priority: sanitizeForDB(task.priority || 'normal', 50),
                turnIndex: Number(turnIndex) || 0
            })

            // Save task as a system message
            await (prisma as any).swarmChatMessage.create({
                data: {
                    sessionId,
                    senderType: 'SYSTEM',
                    senderId: 'orchestrator',
                    content: taskMessage,
                    contentType: 'SYSTEM',
                    tokenCount: Math.ceil(taskMessage.length / 4), // Approximate token count
                    metadata: safeMetadata
                }
            })
        }
        console.log(`✅ Saved ${tasks.length} tasks as messages`)
    } catch (error) {
        console.error('Failed to save tasks:', error)
    }
}

/**
 * Save agent results to database
 */
export async function saveResults(sessionId: string, turnIndex: number, results: Array<{ taskId: string, agentId: string, content: string }>) {
    try {
        for (const result of results) {
            // Sanitize content and limit length
            const sanitizedContent = sanitizeForDB(result.content || 'No content', 1500)
            const truncatedContent = sanitizedContent.substring(0, 800)

            // Create a formatted message for the result
            const resultMessage = sanitizeForDB(
                `🤖 **${result.agentId || 'Unknown Agent'}** 完成了任务\n` +
                `📝 **结果**: ${truncatedContent}${sanitizedContent.length > 800 ? '...' : ''}`,
                2000
            )

            // Create safe metadata - convert to string immediately
            const safeMetadata = JSON.stringify({
                taskId: sanitizeForDB(result.taskId || '', 50),
                agentId: sanitizeForDB(result.agentId || '', 100),
                contentPreview: sanitizedContent.substring(0, 500),
                turnIndex: Number(turnIndex) || 0
            })

            // Save result as an agent message
            await (prisma as any).swarmChatMessage.create({
                data: {
                    sessionId,
                    senderType: 'AGENT',
                    senderId: sanitizeForDB(result.agentId || 'unknown', 100),
                    content: resultMessage,
                    contentType: 'TEXT',
                    tokenCount: Math.ceil(resultMessage.length / 4), // Approximate token count
                    metadata: safeMetadata
                }
            })
        }
        console.log(`✅ Saved ${results.length} results as messages`)
    } catch (error) {
        console.error('Failed to save results:', error)
    }
}

/**
 * Ultra-safe database string sanitization
 * Removes all potentially problematic characters for database storage
 */
function sanitizeForDB(text: string, maxLength: number = 1000): string {
    if (!text || typeof text !== 'string') {
        console.log('🧹 sanitizeForDB: Invalid input', { text: typeof text, length: text?.length })
        return ''
    }

    const originalLength = text.length
    console.log('🧹 sanitizeForDB: Starting sanitization', {
        originalLength,
        maxLength,
        hasControlChars: /[\x00-\x1F\x7F-\x9F]/.test(text),
        hasSurrogates: /[\uD800-\uDFFF]/.test(text),
        hasSpecialUnicode: /[\uFEFF\uFFFD\u200B-\u200F\u2060-\u206F]/.test(text)
    })

    try {
        // First pass: basic cleanup
        let safe = text
            .substring(0, maxLength)
            .trim()

        const afterTruncate = safe.length

        // Remove all control characters except basic whitespace
        safe = safe.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
        const afterControlChars = safe.length

        // Remove ALL Unicode surrogates (high and low)
        safe = safe.replace(/[\uD800-\uDFFF]/g, '')
        const afterSurrogates = safe.length

        // Remove replacement characters, BOM, and other problematic chars
        safe = safe.replace(/[\uFEFF\uFFFD\u200B-\u200F\u2060-\u206F]/g, '')
        const afterSpecialChars = safe.length

        // Replace line separators with regular spaces
        safe = safe.replace(/[\u2028\u2029]/g, ' ')

        // Normalize repeated whitespace
        safe = safe.replace(/\s+/g, ' ').trim()
        const finalLength = safe.length

        console.log('🧹 sanitizeForDB: Cleanup steps', {
            originalLength,
            afterTruncate,
            afterControlChars,
            afterSurrogates,
            afterSpecialChars,
            finalLength,
            charsRemoved: originalLength - finalLength
        })

        // Second pass: test JSON serializability
        try {
            JSON.stringify(safe)
            console.log('✅ sanitizeForDB: JSON serialization test passed')
            return safe || '[EMPTY]'
        } catch (jsonError) {
            console.warn('⚠️ sanitizeForDB: JSON test failed, using ultra-safe fallback', {
                error: (jsonError as Error).message,
                safeLength: safe.length,
                safePreview: safe.substring(0, 50)
            })
            // Ultra-conservative fallback: only ASCII + basic Chinese
            const ultraSafe = safe.replace(/[^\x20-\x7E\u4e00-\u9fff]/g, '').trim()
            console.log('🧹 sanitizeForDB: Ultra-safe result', {
                ultraSafeLength: ultraSafe.length,
                charsRemovedInFallback: safe.length - ultraSafe.length
            })
            return ultraSafe || '[CLEANED]'
        }
    } catch (error) {
        console.error('🚨 sanitizeForDB: Critical error during sanitization', {
            error: (error as Error).message,
            originalLength,
            textPreview: text.substring(0, 100)
        })
        // Final fallback
        return '[ERROR_CLEANING]'
    }
}

/**
 * Extract safe text for database storage - ultra-conservative approach
 */
function extractSafeText(text: string, maxLength: number = 1000): string {
    return sanitizeForDB(text, maxLength)
}



/**
 * Load previous orchestrator results for a session
 */
export async function loadOrchestratorResults(sessionId: string) {
    try {
        const results = await (prisma as any).swarmChatResult.findMany({
            where: { sessionId },
            orderBy: { turnIndex: 'asc' }
        })

        return results.map((result: any) => ({
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
        const latest = await (prisma as any).swarmChatResult.findFirst({
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