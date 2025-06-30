import prisma from '@/lib/database/prisma'
import { AgentConfiguration } from '@/types/chat'

/**
 * Service for managing agent configurations with caching
 */
export class AgentConfigService {
    private static instance: AgentConfigService
    private configCache: Map<string, { config: AgentConfiguration; timestamp: number }> = new Map()
    private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes cache TTL
    private cleanupInterval: NodeJS.Timeout | null = null

    private constructor() {
        this.startCacheCleanup()
    }

    public static getInstance(): AgentConfigService {
        if (!AgentConfigService.instance) {
            AgentConfigService.instance = new AgentConfigService()
        }
        return AgentConfigService.instance
    }

    /**
     * Start automatic cache cleanup every 10 minutes
     */
    private startCacheCleanup(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanExpiredCache()
        }, 10 * 60 * 1000)
    }

    /**
     * Clean up expired cache entries
     */
    private cleanExpiredCache(): void {
        const now = Date.now()
        for (const [key, value] of this.configCache.entries()) {
            if (now - value.timestamp > this.CACHE_TTL) {
                this.configCache.delete(key)
            }
        }
        if (this.configCache.size > 0) {
            console.log(`🧹 Agent config cache cleanup: ${this.configCache.size} configurations cached`)
        }
    }

    /**
     * Clear all cached configurations
     */
    public clearCache(): void {
        this.configCache.clear()
        console.log('🗑️ Agent configuration cache cleared')
    }

    /**
     * Get agent configuration with caching
     */
    public async getAgentConfiguration(agentId: string): Promise<AgentConfiguration> {
        // Check cache first
        const cached = this.configCache.get(agentId)
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            console.log(`🎯 Using cached configuration for agent ${agentId}`)
            return cached.config
        }

        // Fetch from database
        const agent = await prisma.swarmAIAgent.findUnique({
            where: {
                id: agentId,
                isActive: true
            },
            include: {
                model: true
            }
        })

        if (!agent) {
            throw new Error(`Agent '${agentId}' not found or inactive`)
        }

        if (!agent.model) {
            throw new Error(`Model configuration missing for agent '${agentId}'`)
        }

        console.log(`📋 Retrieved configuration for agent ${agentId}: ${agent.name}`)

        // Use agent-specific temperature/maxTokens if available, otherwise use model defaults
        const temperature = agent.temperature
            ? Number(agent.temperature)
            : agent.model.defaultTemperature
                ? Number(agent.model.defaultTemperature)
                : (() => { throw new Error(`Temperature not configured for agent '${agentId}' or its model`) })()

        const maxTokens = agent.maxTokens
            || agent.model.maxOutputTokens
            || (() => { throw new Error(`Max tokens not configured for agent '${agentId}' or its model`) })()

        const config: AgentConfiguration = {
            systemPrompt: agent.systemPrompt,
            modelName: agent.model.modelName,
            temperature,
            maxTokens,
            name: agent.name,
            agentId: agent.id,
            avatar: agent.icon || '🤖', // Use agent icon or default
            inputPricePerK: Number(agent.model.inputPricePerK),
            outputPricePerK: Number(agent.model.outputPricePerK)
        }

        // Cache the configuration
        this.configCache.set(agentId, {
            config,
            timestamp: Date.now()
        })

        return config
    }

    /**
     * Batch get multiple agent configurations
     */
    public async getBatchAgentConfigurations(agentIds: string[]): Promise<Map<string, AgentConfiguration>> {
        const results = new Map<string, AgentConfiguration>()

        // Separate cached and uncached agent IDs
        const uncachedIds: string[] = []
        const now = Date.now()

        for (const agentId of agentIds) {
            const cached = this.configCache.get(agentId)
            if (cached && now - cached.timestamp < this.CACHE_TTL) {
                results.set(agentId, cached.config)
            } else {
                uncachedIds.push(agentId)
            }
        }

        // Fetch uncached configurations from database
        if (uncachedIds.length > 0) {
            const agents = await prisma.swarmAIAgent.findMany({
                where: {
                    id: { in: uncachedIds },
                    isActive: true
                },
                include: {
                    model: true
                }
            })

            for (const agent of agents) {
                if (!agent.model) {
                    throw new Error(`Model configuration missing for agent '${agent.id}'`)
                }

                const temperature = agent.temperature
                    ? Number(agent.temperature)
                    : agent.model.defaultTemperature
                        ? Number(agent.model.defaultTemperature)
                        : (() => { throw new Error(`Temperature not configured for agent '${agent.id}' or its model`) })()

                const maxTokens = agent.maxTokens
                    || agent.model.maxOutputTokens
                    || (() => { throw new Error(`Max tokens not configured for agent '${agent.id}' or its model`) })()

                const config: AgentConfiguration = {
                    systemPrompt: agent.systemPrompt,
                    modelName: agent.model.modelName,
                    temperature,
                    maxTokens,
                    name: agent.name,
                    agentId: agent.id,
                    avatar: agent.icon || '🤖', // Use agent icon or default
                    inputPricePerK: Number(agent.model.inputPricePerK),
                    outputPricePerK: Number(agent.model.outputPricePerK)
                }

                // Cache the configuration
                this.configCache.set(agent.id, {
                    config,
                    timestamp: Date.now()
                })

                results.set(agent.id, config)
            }

            // Check for missing agents
            const foundIds = agents.map(a => a.id)
            const missingIds = uncachedIds.filter(id => !foundIds.includes(id))
            if (missingIds.length > 0) {
                throw new Error(`Agents not found or inactive: ${missingIds.join(', ')}`)
            }
        }

        console.log(`📦 Batch retrieved ${results.size} agent configurations (${agentIds.length - uncachedIds.length} from cache, ${uncachedIds.length} from database)`)

        return results
    }

    /**
     * Get cache statistics for monitoring
     */
    public getCacheStats(): { size: number; ttl: number } {
        return {
            size: this.configCache.size,
            ttl: this.CACHE_TTL
        }
    }

    /**
     * Cleanup resources when service is destroyed
     */
    public destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval)
            this.cleanupInterval = null
        }
        this.clearCache()
    }
} 