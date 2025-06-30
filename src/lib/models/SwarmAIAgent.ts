/**
 * SwarmAI Agent Management - Unified AI Agent Configuration
 * 
 * Features:
 * - Centralized agent configuration management
 * - Agent-Model relationship management
 * - Capability-based agent selection
 * - Standardized agent properties and behaviors
 */

import type { SwarmAIModel, ModelCapability } from './SwarmAIModel'
import { modelRegistry } from './SwarmAIModel'
import type { Task } from '@/lib/orchestrator/types'

export type AgentCategory =
    | 'general'
    | 'coding'
    | 'research'
    | 'creative'
    | 'analysis'
    | 'education'
    | 'business'
    | 'specialized'

export type AgentStatus = 'active' | 'inactive' | 'maintenance' | 'deprecated'

export interface AgentCapabilities {
    /** Core task types the agent can handle */
    taskTypes: Task['type'][]
    /** Model capabilities required */
    requiredCapabilities: ModelCapability[]
    /** Specialization areas */
    specializations: string[]
    /** Maximum concurrent tasks */
    maxConcurrentTasks: number
    /** Estimated processing time per task (in seconds) */
    estimatedProcessingTime: number
}

export interface AgentPersonality {
    /** Agent's communication style */
    communicationStyle: 'formal' | 'casual' | 'friendly' | 'professional' | 'academic'
    /** How verbose the agent should be */
    verbosity: 'concise' | 'balanced' | 'detailed' | 'comprehensive'
    /** Agent's approach to problem-solving */
    approach: 'analytical' | 'creative' | 'practical' | 'methodical' | 'innovative'
    /** Additional personality traits */
    traits: string[]
}

export interface AgentUI {
    /** Agent icon/avatar */
    icon: string
    /** Primary color theme */
    color: string
    /** Agent avatar/image URL */
    avatar?: string
    /** Custom CSS class */
    cssClass?: string
    /** Agent emoji representation */
    emoji: string
}

/**
 * Core SwarmAI Agent definition
 */
export interface SwarmAIAgent {
    /** Unique identifier for the agent */
    id: string

    /** Agent display name */
    name: string

    /** Short description of the agent */
    description: string

    /** Detailed agent description */
    longDescription: string

    /** Agent category */
    category: AgentCategory

    /** Current status */
    status: AgentStatus

    /** Associated model ID */
    modelId: string

    /** System prompt template */
    systemPrompt: string

    /** Agent capabilities */
    capabilities: AgentCapabilities

    /** Agent personality configuration */
    personality: AgentPersonality

    /** UI configuration */
    ui: AgentUI

    /** Agent version */
    version: string

    /** Usage statistics */
    stats: {
        totalTasks: number
        successRate: number
        averageRating: number
        totalUsageTime: number
        lastUsed?: Date
    }

    /** Configuration options */
    config: {
        /** Custom temperature override */
        temperature?: number
        /** Custom max tokens override */
        maxTokens?: number
        /** Enable/disable function calling */
        functionCalling?: boolean
        /** Custom parameters */
        customParams?: Record<string, unknown>
    }

    /** Metadata */
    metadata: {
        /** Agent creator */
        creator: string
        /** Tags for categorization */
        tags: string[]
        /** Agent difficulty level */
        difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        /** Required user permissions */
        requiredPermissions?: string[]
        /** Pricing tier */
        pricingTier: 'free' | 'standard' | 'premium'
    }

    /** Timestamps */
    createdAt: Date
    updatedAt: Date
}

/**
 * Agent runtime configuration
 */
export interface AgentRuntimeConfig {
    agent: SwarmAIAgent
    model: SwarmAIModel
    /** Session-specific overrides */
    sessionConfig?: {
        temperature?: number
        maxTokens?: number
        systemPromptAdditions?: string
    }
}

/**
 * Agent registry for managing available agents
 */
export class AgentRegistry {
    private agents = new Map<string, SwarmAIAgent>()
    private agentStats = new Map<string, SwarmAIAgent['stats']>()

    /**
     * Register a new agent
     */
    register(agent: SwarmAIAgent): void {
        // Validate model exists
        const model = modelRegistry.getModel(agent.modelId)
        if (!model) {
            throw new Error(`Model ${agent.modelId} not found for agent ${agent.id}`)
        }

        // Validate model capabilities match agent requirements
        const missingCapabilities = agent.capabilities.requiredCapabilities.filter(
            cap => !model.capabilities.includes(cap)
        )
        if (missingCapabilities.length > 0) {
            console.warn(`⚠️ Agent ${agent.name} requires capabilities not available in model ${model.showName}:`, missingCapabilities)
        }

        this.agents.set(agent.id, agent)
        console.log(`🤖 Registered agent: ${agent.name} (${agent.category}) -> ${model.showName}`)
    }

    /**
     * Get agent by ID
     */
    getAgent(agentId: string): SwarmAIAgent | undefined {
        return this.agents.get(agentId)
    }

    /**
     * Get agent runtime configuration
     */
    getAgentConfig(agentId: string, sessionConfig?: AgentRuntimeConfig['sessionConfig']): AgentRuntimeConfig | null {
        const agent = this.getAgent(agentId)
        if (!agent) return null

        const model = modelRegistry.getModel(agent.modelId)
        if (!model) {
            console.error(`Model ${agent.modelId} not found for agent ${agentId}`)
            return null
        }

        return {
            agent,
            model,
            sessionConfig
        }
    }

    /**
     * Get all active agents
     */
    getActiveAgents(): SwarmAIAgent[] {
        return Array.from(this.agents.values()).filter(agent => agent.status === 'active')
    }

    /**
     * Get agents by category
     */
    getAgentsByCategory(category: AgentCategory): SwarmAIAgent[] {
        return Array.from(this.agents.values()).filter(agent =>
            agent.category === category && agent.status === 'active'
        )
    }

    /**
     * Get agents by task type
     */
    getAgentsByTaskType(taskType: Task['type']): SwarmAIAgent[] {
        return Array.from(this.agents.values()).filter(agent =>
            agent.capabilities.taskTypes.includes(taskType) && agent.status === 'active'
        )
    }

    /**
     * Get agents by required capability
     */
    getAgentsByCapability(capability: ModelCapability): SwarmAIAgent[] {
        return Array.from(this.agents.values()).filter(agent =>
            agent.capabilities.requiredCapabilities.includes(capability) && agent.status === 'active'
        )
    }

    /**
     * Get agents by pricing tier
     */
    getAgentsByPricingTier(tier: SwarmAIAgent['metadata']['pricingTier']): SwarmAIAgent[] {
        return Array.from(this.agents.values()).filter(agent =>
            agent.metadata.pricingTier === tier && agent.status === 'active'
        )
    }

    /**
     * Recommend agents for a specific task
     */
    recommendAgents(requirements: {
        taskType?: Task['type']
        capabilities?: ModelCapability[]
        category?: AgentCategory
        maxCost?: number
        difficulty?: SwarmAIAgent['metadata']['difficulty']
    }): SwarmAIAgent[] {
        let candidates = this.getActiveAgents()

        // Filter by task type
        if (requirements.taskType) {
            candidates = candidates.filter(agent =>
                agent.capabilities.taskTypes.includes(requirements.taskType!)
            )
        }

        // Filter by capabilities
        if (requirements.capabilities?.length) {
            candidates = candidates.filter(agent =>
                requirements.capabilities!.every(cap =>
                    agent.capabilities.requiredCapabilities.includes(cap)
                )
            )
        }

        // Filter by category
        if (requirements.category) {
            candidates = candidates.filter(agent => agent.category === requirements.category)
        }

        // Filter by cost
        if (requirements.maxCost) {
            candidates = candidates.filter(agent => {
                const model = modelRegistry.getModel(agent.modelId)
                if (!model) return false
                const avgCost = (model.pricing.input + model.pricing.output) / 2
                return avgCost <= requirements.maxCost!
            })
        }

        // Filter by difficulty
        if (requirements.difficulty) {
            candidates = candidates.filter(agent => agent.metadata.difficulty === requirements.difficulty)
        }

        // Sort by success rate and rating
        return candidates.sort((a, b) => {
            const aScore = (a.stats.successRate * 0.6) + (a.stats.averageRating * 0.4)
            const bScore = (b.stats.successRate * 0.6) + (b.stats.averageRating * 0.4)
            return bScore - aScore
        })
    }

    /**
     * Update agent statistics
     */
    updateStats(agentId: string, taskSuccess: boolean, rating?: number, duration?: number): void {
        const agent = this.agents.get(agentId)
        if (!agent) return

        const currentStats = agent.stats
        const newStats = {
            totalTasks: currentStats.totalTasks + 1,
            successRate: (currentStats.successRate * currentStats.totalTasks + (taskSuccess ? 1 : 0)) / (currentStats.totalTasks + 1),
            averageRating: rating ?
                (currentStats.averageRating * currentStats.totalTasks + rating) / (currentStats.totalTasks + 1) :
                currentStats.averageRating,
            totalUsageTime: currentStats.totalUsageTime + (duration || 0),
            lastUsed: new Date()
        }

        agent.stats = newStats
        this.agentStats.set(agentId, newStats)
    }

    /**
     * Get agent statistics
     */
    getAgentStats(agentId: string): SwarmAIAgent['stats'] | undefined {
        return this.agentStats.get(agentId)
    }

    /**
     * Get all agents statistics
     */
    getAllAgentStats(): Array<{ agentId: string; stats: SwarmAIAgent['stats'] }> {
        return Array.from(this.agentStats.entries()).map(([agentId, stats]) => ({
            agentId,
            stats
        }))
    }

    /**
     * Update agent configuration
     */
    updateAgent(agentId: string, updates: Partial<SwarmAIAgent>): boolean {
        const agent = this.agents.get(agentId)
        if (!agent) return false

        const updatedAgent = {
            ...agent,
            ...updates,
            updatedAt: new Date()
        }

        this.agents.set(agentId, updatedAgent)
        console.log(`🔄 Updated agent: ${agent.name}`)
        return true
    }

    /**
     * Get agents grouped by category
     */
    getAgentsByCategories(): Record<AgentCategory, SwarmAIAgent[]> {
        const result = {} as Record<AgentCategory, SwarmAIAgent[]>

        for (const agent of this.getActiveAgents()) {
            if (!result[agent.category]) {
                result[agent.category] = []
            }
            result[agent.category].push(agent)
        }

        return result
    }

    /**
     * Export agent configuration
     */
    exportConfig(): SwarmAIAgent[] {
        return Array.from(this.agents.values())
    }

    /**
     * Import agent configuration
     */
    importConfig(agents: SwarmAIAgent[]): void {
        this.agents.clear()
        this.agentStats.clear()

        agents.forEach(agent => {
            try {
                this.register(agent)
                this.agentStats.set(agent.id, agent.stats)
            } catch (error) {
                console.error(`Failed to import agent ${agent.id}:`, error)
            }
        })

        console.log(`📥 Imported ${agents.length} agents into registry`)
    }

    /**
     * Validate agent configuration
     */
    validateAgent(agent: SwarmAIAgent): { valid: boolean; errors: string[] } {
        const errors: string[] = []

        // Check if model exists
        const model = modelRegistry.getModel(agent.modelId)
        if (!model) {
            errors.push(`Model ${agent.modelId} not found`)
        }

        // Check required capabilities
        if (model) {
            const missingCapabilities = agent.capabilities.requiredCapabilities.filter(
                cap => !model.capabilities.includes(cap)
            )
            if (missingCapabilities.length > 0) {
                errors.push(`Missing required capabilities: ${missingCapabilities.join(', ')}`)
            }
        }

        // Check system prompt
        if (!agent.systemPrompt.trim()) {
            errors.push('System prompt is required')
        }

        // Check UI configuration
        if (!agent.ui.icon) {
            errors.push('Agent icon is required')
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }
}

// Global agent registry instance
export const agentRegistry = new AgentRegistry() 