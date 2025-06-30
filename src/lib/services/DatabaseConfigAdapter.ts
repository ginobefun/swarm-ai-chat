/**
 * Database Configuration Adapter
 * 
 * This service provides a bridge between the database-driven AI models/agents
 * and the existing frontend code that expects specific data formats.
 * 
 * It transforms database entities into the legacy formats expected by
 * existing components while maintaining full compatibility.
 */

import type { SwarmAIAgent, SwarmAIModel } from '@prisma/client'

export interface DatabaseInitializationResult {
    success: boolean
    modelsLoaded: number
    agentsLoaded: number
    errors: string[]
    warnings: string[]
}

export interface LegacyAgent {
    id: string
    name: string
    avatar: string
    description: string
    category: string
    modelName: string
    systemPrompt: string
    icon?: string
    color?: string
    temperature?: number
    maxTokens?: number
    functionCalling?: boolean
    tags?: string[]
    specializations?: string[]
    difficulty?: string
    traits?: string[]
}

export interface LegacyModel {
    id: string
    name: string
    provider: string
    modelName: string
    baseUrl: string
    temperature: number
    maxTokens: number
    capabilities: string[]
    pricing: {
        input: number
        output: number
    }
    intelligenceScore: number
}

export class DatabaseConfigAdapter {
    private static instance: DatabaseConfigAdapter
    private agentsCache: LegacyAgent[] | null = null
    private modelsCache: LegacyModel[] | null = null
    private lastCacheUpdate = 0
    private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    public static getInstance(): DatabaseConfigAdapter {
        if (!DatabaseConfigAdapter.instance) {
            DatabaseConfigAdapter.instance = new DatabaseConfigAdapter()
        }
        return DatabaseConfigAdapter.instance
    }

    /**
     * Initialize the adapter by loading data from API
     */
    public async initialize(): Promise<DatabaseInitializationResult> {
        const result: DatabaseInitializationResult = {
            success: true,
            modelsLoaded: 0,
            agentsLoaded: 0,
            errors: [],
            warnings: []
        }

        try {
            console.log('🔄 Initializing database configuration adapter via API...')

            // Load data from API endpoints
            const [modelsResponse, agentsResponse] = await Promise.all([
                fetch('/api/config/models').then(res => res.json()),
                fetch('/api/config/agents').then(res => res.json())
            ])

            if (!modelsResponse.success) {
                throw new Error(`Failed to fetch models: ${modelsResponse.message}`)
            }

            if (!agentsResponse.success) {
                throw new Error(`Failed to fetch agents: ${agentsResponse.message}`)
            }

            result.modelsLoaded = modelsResponse.count
            result.agentsLoaded = agentsResponse.count

            console.log(`📚 Loaded ${result.modelsLoaded} AI models from API`)
            console.log(`🤖 Loaded ${result.agentsLoaded} AI agents from API`)

            if (result.modelsLoaded === 0) {
                result.warnings.push('No active AI models found')
            }

            if (result.agentsLoaded === 0) {
                result.warnings.push('No active AI agents found')
            }

            // Update cache with API data
            this.modelsCache = modelsResponse.data
            this.agentsCache = agentsResponse.data
            this.lastCacheUpdate = Date.now()

            console.log('✅ Database configuration adapter initialized successfully')

        } catch (error) {
            result.success = false
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error'
            result.errors.push(errorMessage)
            console.error('❌ Database configuration adapter initialization failed:', error)
        }

        return result
    }

    /**
     * Refresh cache from API
     */
    private async refreshCache(): Promise<void> {
        try {
            // Load data from API endpoints
            const [modelsResponse, agentsResponse] = await Promise.all([
                fetch('/api/config/models').then(res => res.json()),
                fetch('/api/config/agents').then(res => res.json())
            ])

            if (!modelsResponse.success) {
                throw new Error(`Failed to fetch models: ${modelsResponse.message}`)
            }

            if (!agentsResponse.success) {
                throw new Error(`Failed to fetch agents: ${agentsResponse.message}`)
            }

            // Store transformed data directly from API
            this.modelsCache = modelsResponse.data
            this.agentsCache = agentsResponse.data
            this.lastCacheUpdate = Date.now()

            console.log('🔄 Configuration cache refreshed:', {
                agents: this.agentsCache?.length || 0,
                models: this.modelsCache?.length || 0
            })
        } catch (error) {
            console.error('❌ Error refreshing cache:', error)
            throw error
        }
    }

    /**
     * Check if cache needs refresh
     */
    private needsCacheRefresh(): boolean {
        return !this.agentsCache || !this.modelsCache ||
            (Date.now() - this.lastCacheUpdate) > this.CACHE_DURATION
    }

    /**
     * Get all available agents in legacy format
     */
    public async getAgents(): Promise<LegacyAgent[]> {
        if (this.needsCacheRefresh()) {
            await this.refreshCache()
        }
        return this.agentsCache || []
    }

    /**
     * Get agent by ID in legacy format
     */
    public async getAgentById(agentId: string): Promise<LegacyAgent | null> {
        const agents = await this.getAgents()
        return agents.find(agent => agent.id === agentId) || null
    }

    /**
     * Get agents by category
     */
    public async getAgentsByCategory(category: string): Promise<LegacyAgent[]> {
        const agents = await this.getAgents()
        return agents.filter(agent => agent.category === category)
    }

    /**
     * Get all available models in legacy format
     */
    public async getModels(): Promise<LegacyModel[]> {
        if (this.needsCacheRefresh()) {
            await this.refreshCache()
        }
        return this.modelsCache || []
    }

    /**
     * Get model by ID in legacy format
     */
    public async getModelById(modelId: string): Promise<LegacyModel | null> {
        const models = await this.getModels()
        return models.find(model => model.id === modelId) || null
    }

    /**
     * Get the smartest model (highest intelligence score)
     */
    public async getSmartestModel(): Promise<LegacyModel | null> {
        const models = await this.getModels()
        if (models.length === 0) return null

        return models.reduce((smartest, current) =>
            current.intelligenceScore > smartest.intelligenceScore ? current : smartest
        )
    }

    /**
     * Get featured/recommended agents (high rating)
     */
    public async getFeaturedAgents(): Promise<LegacyAgent[]> {
        try {
            const response = await fetch('/api/config/agents/featured')
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.message)
            }

            return result.data
        } catch (error) {
            console.error('Error fetching featured agents:', error)
            return []
        }
    }

    /**
     * Transform database agent to legacy format
     */
    private transformAgentToLegacy(agent: SwarmAIAgent & { model: SwarmAIModel }): LegacyAgent {
        return {
            id: agent.id,
            name: agent.name,
            avatar: agent.icon || '🤖',
            description: agent.description || '',
            category: agent.category,
            modelName: agent.model.modelName,
            systemPrompt: agent.systemPrompt,
            icon: agent.icon || '🤖',
            color: agent.color || '#3B82F6',
            temperature: agent.temperature ? Number(agent.temperature) : Number(agent.model.defaultTemperature),
            maxTokens: agent.maxTokens || agent.model.maxOutputTokens,
            functionCalling: agent.functionCalling,
            tags: agent.tags,
            specializations: agent.specializations,
            difficulty: agent.difficulty,
            traits: agent.traits
        }
    }

    /**
     * Transform database model to legacy format
     */
    private transformModelToLegacy(model: SwarmAIModel): LegacyModel {
        return {
            id: model.id,
            name: model.displayName,
            provider: model.provider,
            modelName: model.modelName,
            baseUrl: model.baseUrl,
            temperature: Number(model.defaultTemperature),
            maxTokens: model.maxOutputTokens,
            capabilities: model.capabilities,
            pricing: {
                input: Number(model.inputPricePerK),
                output: Number(model.outputPricePerK)
            },
            intelligenceScore: model.intelligenceScore
        }
    }

    /**
     * Search agents by name or description
     */
    public async searchAgents(query: string): Promise<LegacyAgent[]> {
        const agents = await this.getAgents()
        const searchLower = query.toLowerCase()

        return agents.filter(agent =>
            agent.name.toLowerCase().includes(searchLower) ||
            agent.description.toLowerCase().includes(searchLower) ||
            agent.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        )
    }

    /**
     * Get agent configuration for LangGraph
     */
    public async getAgentLangGraphConfig(agentId: string): Promise<{
        modelName: string
        baseUrl: string
        temperature: number
        maxTokens: number
        systemPrompt: string
    } | null> {
        try {
            const response = await fetch(`/api/config/agents/${agentId}/config`)
            const result = await response.json()

            if (!result.success) {
                return null
            }

            return result.data
        } catch (error) {
            console.error(`Error fetching agent config for ${agentId}:`, error)
            return null
        }
    }

    /**
     * Update agent usage statistics
     */
    public async updateAgentUsage(agentId: string, usageTimeSeconds: number, rating?: number): Promise<void> {
        try {
            const response = await fetch(`/api/config/agents/${agentId}/usage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usageTimeSeconds,
                    rating
                })
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.message)
            }

            // Clear cache to force refresh next time
            this.agentsCache = null
        } catch (error) {
            console.error(`Error updating agent usage for ${agentId}:`, error)
        }
    }

    /**
     * Clear cache and force refresh
     */
    public clearCache(): void {
        this.agentsCache = null
        this.modelsCache = null
        this.lastCacheUpdate = 0
        // Note: Server-side cache is cleared via API when data is updated
    }

    /**
     * Get statistics about loaded data
     */
    public async getStats(): Promise<{
        totalAgents: number
        totalModels: number
        cacheAge: number
        lastUpdate: Date
    }> {
        const agents = await this.getAgents()
        const models = await this.getModels()

        return {
            totalAgents: agents.length,
            totalModels: models.length,
            cacheAge: Date.now() - this.lastCacheUpdate,
            lastUpdate: new Date(this.lastCacheUpdate)
        }
    }
}

// Export singleton instance
export const databaseConfigAdapter = DatabaseConfigAdapter.getInstance()
export default databaseConfigAdapter 