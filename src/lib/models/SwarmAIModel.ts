/**
 * SwarmAI Model Management - Unified AI Model Configuration
 * 
 * Features:
 * - Centralized model configuration management
 * - Support for multiple providers (OpenRouter, OpenAI, Anthropic, etc.)
 * - Pricing and capability tracking
 * - Flexible model selection and configuration
 */

export type ModelProvider = 'openrouter' | 'openai' | 'anthropic' | 'google' | 'custom'

export type ModelCapability =
    | 'text-generation'
    | 'code-generation'
    | 'reasoning'
    | 'analysis'
    | 'creative-writing'
    | 'multilingual'
    | 'function-calling'
    | 'vision'
    | 'long-context'

export interface ModelPricing {
    /** Price per 1K input tokens in USD */
    input: number
    /** Price per 1K output tokens in USD */
    output: number
    /** Currency code */
    currency: 'USD'
}

export interface ModelLimits {
    /** Maximum context window in tokens */
    contextWindow: number
    /** Maximum output tokens */
    maxOutputTokens: number
    /** Requests per minute limit */
    rpm?: number
    /** Tokens per minute limit */
    tpm?: number
}

/**
 * Core SwarmAI Model definition
 */
export interface SwarmAIModel {
    /** Unique identifier for the model */
    id: string

    /** Model provider */
    provider: ModelProvider

    /** Actual model name used in API calls */
    modelName: string

    /** Display name for UI */
    showName: string

    /** Brief description of the model */
    description: string

    /** Base URL for API calls */
    baseUrl: string

    /** Default temperature setting */
    temperature: number

    /** Model capabilities */
    capabilities: ModelCapability[]

    /** Pricing information */
    pricing: ModelPricing

    /** Model limits and quotas */
    limits: ModelLimits

    /** Whether the model is currently active */
    isActive: boolean

    /** Performance tier: basic, standard, premium */
    tier: 'basic' | 'standard' | 'premium'

    /** Additional metadata */
    metadata: {
        /** Model family (e.g., GPT, Claude, Gemini) */
        family: string
        /** Model version */
        version: string
        /** Release date */
        releaseDate: string
        /** Additional provider-specific config */
        providerConfig?: Record<string, unknown>
    }

    /** Creation and update timestamps */
    createdAt: Date
    updatedAt: Date
}

/**
 * Model configuration for runtime use
 */
export interface ModelConfig {
    model: SwarmAIModel
    /** Override temperature */
    temperature?: number
    /** Override max tokens */
    maxTokens?: number
    /** Additional generation parameters */
    generationParams?: Record<string, unknown>
}

/**
 * Model usage statistics
 */
export interface ModelUsageStats {
    modelId: string
    totalRequests: number
    totalInputTokens: number
    totalOutputTokens: number
    totalCostUSD: number
    averageLatency: number
    successRate: number
    lastUsed: Date
}

/**
 * Model registry for managing available models
 */
export class ModelRegistry {
    private models = new Map<string, SwarmAIModel>()
    private usageStats = new Map<string, ModelUsageStats>()

    /**
     * Register a new model
     */
    register(model: SwarmAIModel): void {
        this.models.set(model.id, model)
        console.log(`🤖 Registered model: ${model.showName} (${model.provider})`)
    }

    /**
     * Get model by ID
     */
    getModel(modelId: string): SwarmAIModel | undefined {
        return this.models.get(modelId)
    }

    /**
     * Get all active models
     */
    getActiveModels(): SwarmAIModel[] {
        return Array.from(this.models.values()).filter(model => model.isActive)
    }

    /**
     * Get models by provider
     */
    getModelsByProvider(provider: ModelProvider): SwarmAIModel[] {
        return Array.from(this.models.values()).filter(model =>
            model.provider === provider && model.isActive
        )
    }

    /**
     * Get models by capability
     */
    getModelsByCapability(capability: ModelCapability): SwarmAIModel[] {
        return Array.from(this.models.values()).filter(model =>
            model.capabilities.includes(capability) && model.isActive
        )
    }

    /**
     * Get models by tier
     */
    getModelsByTier(tier: SwarmAIModel['tier']): SwarmAIModel[] {
        return Array.from(this.models.values()).filter(model =>
            model.tier === tier && model.isActive
        )
    }

    /**
     * Update model configuration
     */
    updateModel(modelId: string, updates: Partial<SwarmAIModel>): boolean {
        const model = this.models.get(modelId)
        if (!model) return false

        const updatedModel = {
            ...model,
            ...updates,
            updatedAt: new Date()
        }

        this.models.set(modelId, updatedModel)
        console.log(`🔄 Updated model: ${model.showName}`)
        return true
    }

    /**
     * Record model usage
     */
    recordUsage(modelId: string, inputTokens: number, outputTokens: number, latency: number, success: boolean): void {
        const model = this.getModel(modelId)
        if (!model) return

        const existing = this.usageStats.get(modelId) || {
            modelId,
            totalRequests: 0,
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCostUSD: 0,
            averageLatency: 0,
            successRate: 1,
            lastUsed: new Date()
        }

        const costUSD = (inputTokens * model.pricing.input + outputTokens * model.pricing.output) / 1000

        const updated: ModelUsageStats = {
            modelId,
            totalRequests: existing.totalRequests + 1,
            totalInputTokens: existing.totalInputTokens + inputTokens,
            totalOutputTokens: existing.totalOutputTokens + outputTokens,
            totalCostUSD: existing.totalCostUSD + costUSD,
            averageLatency: (existing.averageLatency * existing.totalRequests + latency) / (existing.totalRequests + 1),
            successRate: (existing.successRate * existing.totalRequests + (success ? 1 : 0)) / (existing.totalRequests + 1),
            lastUsed: new Date()
        }

        this.usageStats.set(modelId, updated)
    }

    /**
     * Get usage statistics for a model
     */
    getUsageStats(modelId: string): ModelUsageStats | undefined {
        return this.usageStats.get(modelId)
    }

    /**
     * Get all usage statistics
     */
    getAllUsageStats(): ModelUsageStats[] {
        return Array.from(this.usageStats.values())
    }

    /**
     * Get models sorted by cost efficiency
     */
    getModelsByCostEfficiency(): SwarmAIModel[] {
        return this.getActiveModels().sort((a, b) => {
            const aCost = (a.pricing.input + a.pricing.output) / 2
            const bCost = (b.pricing.input + b.pricing.output) / 2
            return aCost - bCost
        })
    }

    /**
     * Recommend model based on requirements
     */
    recommendModel(requirements: {
        capabilities?: ModelCapability[]
        maxCostPer1K?: number
        minContextWindow?: number
        tier?: SwarmAIModel['tier']
    }): SwarmAIModel | null {
        let candidates = this.getActiveModels()

        // Filter by capabilities
        if (requirements.capabilities?.length) {
            candidates = candidates.filter(model =>
                requirements.capabilities!.every(cap => model.capabilities.includes(cap))
            )
        }

        // Filter by cost
        if (requirements.maxCostPer1K) {
            candidates = candidates.filter(model => {
                const avgCost = (model.pricing.input + model.pricing.output) / 2
                return avgCost <= requirements.maxCostPer1K!
            })
        }

        // Filter by context window
        if (requirements.minContextWindow) {
            candidates = candidates.filter(model =>
                model.limits.contextWindow >= requirements.minContextWindow!
            )
        }

        // Filter by tier
        if (requirements.tier) {
            candidates = candidates.filter(model => model.tier === requirements.tier)
        }

        // Return best candidate (by tier, then by cost efficiency)
        if (candidates.length === 0) return null

        return candidates.sort((a, b) => {
            // First by tier (premium > standard > basic)
            const tierOrder = { premium: 3, standard: 2, basic: 1 }
            const tierDiff = tierOrder[b.tier] - tierOrder[a.tier]
            if (tierDiff !== 0) return tierDiff

            // Then by cost efficiency
            const aCost = (a.pricing.input + a.pricing.output) / 2
            const bCost = (b.pricing.input + b.pricing.output) / 2
            return aCost - bCost
        })[0]
    }

    /**
     * Export configuration for persistence
     */
    exportConfig(): SwarmAIModel[] {
        return Array.from(this.models.values())
    }

    /**
     * Import configuration from persistence
     */
    importConfig(models: SwarmAIModel[]): void {
        this.models.clear()
        models.forEach(model => this.register(model))
        console.log(`📥 Imported ${models.length} models into registry`)
    }
}

// Global model registry instance
export const modelRegistry = new ModelRegistry() 