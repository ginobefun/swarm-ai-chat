/**
 * Graph Lifecycle Manager - Manages orchestrator graph instances
 * 
 * Features:
 * - Concurrent-safe graph creation and management
 * - Automatic cleanup to prevent memory leaks
 * - No shared state between requests
 * - Graceful degradation on failures
 */

import { OrchestratorGraphBuilder } from './graphBuilder'

// Use generic type for compiled graph
type CompiledGraph = ReturnType<OrchestratorGraphBuilder['build']>

interface GraphInstance {
    graph: CompiledGraph
    createdAt: Date
    lastUsed: Date
    participants: string[]
    version: number
}

/**
 * Graph lifecycle manager with concurrent-safe operations
 */
export class GraphManager {
    private graphs = new Map<string, GraphInstance>()
    private readonly GRAPH_TTL = 30 * 60 * 1000 // 30 minutes
    private readonly MAX_GRAPHS = 100 // Prevent memory exhaustion
    private cleanupTimer?: NodeJS.Timeout
    private versionCounter = 0

    constructor() {
        this.startCleanupScheduler()
    }

    /**
     * Get or create a graph instance (concurrent-safe)
     * Each request gets either a fresh graph or an isolated copy
     */
    async getOrCreateGraph(sessionId: string, participants: string[]): Promise<CompiledGraph> {
        const now = new Date()
        const existingInstance = this.graphs.get(sessionId)

        // Check if existing graph is still valid and compatible
        if (existingInstance &&
            !this.isExpired(existingInstance) &&
            this.areParticipantsCompatible(existingInstance.participants, participants)) {

            // Update last used time
            existingInstance.lastUsed = now

            console.log('📊 Reusing existing graph:', {
                sessionId,
                graphAge: now.getTime() - existingInstance.createdAt.getTime(),
                version: existingInstance.version
            })

            return existingInstance.graph
        }

        // Create new graph instance
        return this.createNewGraph(sessionId, participants)
    }

    /**
     * Create a new graph instance with memory management
     */
    private async createNewGraph(sessionId: string, participants: string[]): Promise<CompiledGraph> {
        const now = new Date()

        // Check memory limits
        if (this.graphs.size >= this.MAX_GRAPHS) {
            console.warn('🚨 Graph memory limit reached, forcing cleanup:', {
                currentSize: this.graphs.size,
                maxSize: this.MAX_GRAPHS
            })
            this.forceCleanup()
        }

        // Create new graph
        const builder = new OrchestratorGraphBuilder({
            sessionId,
            participants
        })

        const graph = builder.build()
        const version = ++this.versionCounter

        // Store graph instance
        const instance: GraphInstance = {
            graph,
            createdAt: now,
            lastUsed: now,
            participants: [...participants], // Clone to avoid reference issues
            version
        }

        this.graphs.set(sessionId, instance)

        console.log('🆕 Created new graph instance:', {
            sessionId,
            participants: participants.length,
            version,
            totalGraphs: this.graphs.size
        })

        return graph
    }

    /**
     * Check if graph has expired
     */
    private isExpired(instance: GraphInstance): boolean {
        const age = Date.now() - instance.lastUsed.getTime()
        return age > this.GRAPH_TTL
    }

    /**
     * Check if participants are compatible (same agents, same order)
     */
    private areParticipantsCompatible(existing: string[], requested: string[]): boolean {
        if (existing.length !== requested.length) return false

        // Sort both arrays for comparison (order doesn't matter for compatibility)
        const sortedExisting = [...existing].sort()
        const sortedRequested = [...requested].sort()

        return sortedExisting.every((agent, index) => agent === sortedRequested[index])
    }

    /**
     * Remove a specific graph instance
     */
    removeGraph(sessionId: string): boolean {
        const removed = this.graphs.delete(sessionId)
        if (removed) {
            console.log('🗑️ Removed graph instance:', { sessionId, remaining: this.graphs.size })
        }
        return removed
    }

    /**
     * Start automatic cleanup scheduler
     */
    private startCleanupScheduler(): void {
        // Run cleanup every 5 minutes
        this.cleanupTimer = setInterval(() => {
            this.cleanup()
        }, 5 * 60 * 1000)

        console.log('🧹 Graph cleanup scheduler started (5min intervals)')
    }

    /**
     * Cleanup expired graphs
     */
    private cleanup(): void {
        const before = this.graphs.size
        const expired: string[] = []

        for (const [sessionId, instance] of this.graphs.entries()) {
            if (this.isExpired(instance)) {
                expired.push(sessionId)
            }
        }

        // Remove expired graphs
        expired.forEach(sessionId => this.graphs.delete(sessionId))

        if (expired.length > 0) {
            console.log('🧹 Cleaned up expired graphs:', {
                expired: expired.length,
                before,
                after: this.graphs.size,
                sessionsRemoved: expired
            })
        }
    }

    /**
     * Force cleanup when memory limit is reached
     */
    private forceCleanup(): void {
        // Remove oldest 20% of graphs
        const graphEntries = Array.from(this.graphs.entries())
        graphEntries.sort((a, b) => a[1].lastUsed.getTime() - b[1].lastUsed.getTime())

        const toRemove = Math.floor(graphEntries.length * 0.2)
        for (let i = 0; i < toRemove; i++) {
            this.graphs.delete(graphEntries[i][0])
        }

        console.log('🚨 Force cleanup completed:', {
            removed: toRemove,
            remaining: this.graphs.size
        })
    }

    /**
     * Get statistics for monitoring
     */
    getStats() {
        const instances = Array.from(this.graphs.values())
        const now = Date.now()

        return {
            totalGraphs: this.graphs.size,
            averageAge: instances.length > 0
                ? instances.reduce((sum, inst) => sum + (now - inst.createdAt.getTime()), 0) / instances.length
                : 0,
            oldestGraph: instances.length > 0
                ? Math.max(...instances.map(inst => now - inst.createdAt.getTime()))
                : 0,
            newestGraph: instances.length > 0
                ? Math.min(...instances.map(inst => now - inst.createdAt.getTime()))
                : 0,
            memoryUsageEstimate: this.graphs.size * 1024 // Rough estimate in bytes
        }
    }

    /**
     * Graceful shutdown - cleanup all resources
     */
    shutdown(): void {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer)
            this.cleanupTimer = undefined
        }

        const graphCount = this.graphs.size
        this.graphs.clear()

        console.log('🛑 GraphManager shutdown:', { clearedGraphs: graphCount })
    }
}

// Singleton instance for the application
export const graphManager = new GraphManager()

// Graceful shutdown handling
if (typeof process !== 'undefined') {
    process.on('SIGTERM', () => {
        console.log('📴 Received SIGTERM, shutting down GraphManager...')
        graphManager.shutdown()
    })

    process.on('SIGINT', () => {
        console.log('📴 Received SIGINT, shutting down GraphManager...')
        graphManager.shutdown()
    })
} 