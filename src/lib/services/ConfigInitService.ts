/**
 * Configuration Initialization Service
 * 
 * Responsible for initializing the database-driven configuration system
 * This service ensures that the system is properly configured at startup
 */

import { databaseConfigAdapter } from '@/lib/services/DatabaseConfigAdapter'

export interface InitializationResult {
    success: boolean
    modelsLoaded: number
    agentsLoaded: number
    errors: string[]
    warnings: string[]
}

export class ConfigInitService {
    private static instance: ConfigInitService
    private initialized = false
    private initResult: InitializationResult | null = null

    private constructor() { }

    /**
     * Get singleton instance
     */
    static getInstance(): ConfigInitService {
        if (!ConfigInitService.instance) {
            ConfigInitService.instance = new ConfigInitService()
        }
        return ConfigInitService.instance
    }

    /**
     * Initialize all configurations using database
     */
    async initialize(): Promise<InitializationResult> {
        if (this.initialized && this.initResult) {
            console.log('📋 Configuration already initialized, returning cached result')
            return this.initResult
        }

        console.log('🚀 Starting SwarmAI database configuration initialization...')

        try {
            // Initialize database configuration adapter
            const dbResult = await databaseConfigAdapter.initialize()

            // Transform database result to our format
            const result: InitializationResult = {
                success: dbResult.success,
                modelsLoaded: dbResult.modelsLoaded,
                agentsLoaded: dbResult.agentsLoaded,
                errors: dbResult.errors,
                warnings: dbResult.warnings
            }

            this.initialized = true
            this.initResult = result

            // Log final results
            if (result.success) {
                console.log(`✅ SwarmAI database configuration initialized successfully!`)
                console.log(`   📊 Models loaded: ${result.modelsLoaded}`)
                console.log(`   🤖 Agents loaded: ${result.agentsLoaded}`)
                if (result.warnings.length > 0) {
                    console.log(`   ⚠️  Warnings: ${result.warnings.length}`)
                    result.warnings.forEach(warning => console.warn(`   - ${warning}`))
                }
            } else {
                console.error(`❌ SwarmAI database configuration initialization failed!`)
                console.error(`   Errors: ${result.errors.length}`)
                result.errors.forEach(error => console.error(`   - ${error}`))
            }

            return result

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error'
            const result: InitializationResult = {
                success: false,
                modelsLoaded: 0,
                agentsLoaded: 0,
                errors: [errorMessage],
                warnings: []
            }

            console.error('❌ Fatal error during SwarmAI initialization:', error)
            this.initResult = result
            return result
        }
    }

    /**
     * Validate configuration integrity
     */
    private async validateConfiguration(): Promise<{ errors: string[]; warnings: string[] }> {
        const result = {
            errors: [] as string[],
            warnings: [] as string[]
        }

        try {
            // Get statistics from adapter
            const stats = await databaseConfigAdapter.getStats()

            if (stats.totalModels === 0) {
                result.errors.push('No AI models available in database')
            }

            if (stats.totalAgents === 0) {
                result.errors.push('No AI agents available in database')
            }

            // Check if cache is too old (older than 1 hour)
            if (stats.cacheAge > 60 * 60 * 1000) {
                result.warnings.push('Configuration cache is older than 1 hour')
            }

            // Get smartest model
            const smartestModel = await databaseConfigAdapter.getSmartestModel()
            if (!smartestModel) {
                result.warnings.push('No model with intelligence score found for optimal selection')
            }

            // Get featured agents
            const featuredAgents = await databaseConfigAdapter.getFeaturedAgents()
            if (featuredAgents.length === 0) {
                result.warnings.push('No featured agents available for recommendations')
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown validation error'
            result.errors.push(`Configuration validation failed: ${errorMessage}`)
        }

        return result
    }

    /**
     * Get initialization status
     */
    getStatus(): { initialized: boolean; result: InitializationResult | null } {
        return {
            initialized: this.initialized,
            result: this.initResult
        }
    }

    /**
     * Force re-initialization
     */
    async reinitialize(): Promise<InitializationResult> {
        console.log('🔄 Forcing database configuration re-initialization...')
        this.initialized = false
        this.initResult = null

        // Clear database adapter cache
        databaseConfigAdapter.clearCache()

        return this.initialize()
    }

    /**
     * Get configuration summary using database
     */
    async getConfigSummary(): Promise<{
        models: { total: number; active: number; byProvider: Record<string, number> }
        agents: { total: number; active: number; byCategory: Record<string, number> }
        health: 'healthy' | 'warning' | 'error'
    }> {
        try {
            const [models, agents, stats] = await Promise.all([
                databaseConfigAdapter.getModels(),
                databaseConfigAdapter.getAgents(),
                databaseConfigAdapter.getStats()
            ])

            // Group models by provider
            const modelsByProvider: Record<string, number> = {}
            models.forEach(model => {
                modelsByProvider[model.provider] = (modelsByProvider[model.provider] || 0) + 1
            })

            // Group agents by category  
            const agentsByCategory: Record<string, number> = {}
            agents.forEach(agent => {
                agentsByCategory[agent.category] = (agentsByCategory[agent.category] || 0) + 1
            })

            // Determine health status
            let health: 'healthy' | 'warning' | 'error' = 'healthy'
            if (stats.totalModels === 0 || stats.totalAgents === 0) {
                health = 'error'
            } else if (stats.cacheAge > 60 * 60 * 1000) { // 1 hour
                health = 'warning'
            }

            return {
                models: {
                    total: stats.totalModels,
                    active: stats.totalModels, // All loaded models are active
                    byProvider: modelsByProvider
                },
                agents: {
                    total: stats.totalAgents,
                    active: stats.totalAgents, // All loaded agents are active
                    byCategory: agentsByCategory
                },
                health
            }

        } catch (error) {
            console.error('Error getting config summary:', error)
            return {
                models: { total: 0, active: 0, byProvider: {} },
                agents: { total: 0, active: 0, byCategory: {} },
                health: 'error'
            }
        }
    }

    /**
     * Get recommended configuration for different use cases
     */
    async getRecommendedConfig(useCase: 'development' | 'production' | 'cost-optimized' | 'performance'): Promise<{
        recommendedModels: string[]
        recommendedAgents: string[]
        reasoning: string[]
    }> {
        try {
            const [models, agents] = await Promise.all([
                databaseConfigAdapter.getModels(),
                databaseConfigAdapter.getAgents()
            ])

            const result = {
                recommendedModels: [] as string[],
                recommendedAgents: [] as string[],
                reasoning: [] as string[]
            }

            switch (useCase) {
                case 'development':
                    // Fast, cost-effective models for development
                    result.recommendedModels = models
                        .filter(m => m.pricing.input < 0.002)
                        .sort((a, b) => a.pricing.input - b.pricing.input)
                        .slice(0, 3)
                        .map(m => m.id)

                    result.recommendedAgents = agents
                        .filter(a => a.difficulty === 'beginner' || a.difficulty === 'intermediate')
                        .slice(0, 5)
                        .map(a => a.id)

                    result.reasoning.push('Selected cost-effective models and basic agents for development')
                    break

                case 'production':
                    // High-quality, reliable models for production
                    result.recommendedModels = models
                        .sort((a, b) => b.intelligenceScore - a.intelligenceScore)
                        .slice(0, 5)
                        .map(m => m.id)

                    result.recommendedAgents = agents
                        .slice(0, 8)
                        .map(a => a.id)

                    result.reasoning.push('Selected high-intelligence models and comprehensive agent set for production')
                    break

                case 'cost-optimized':
                    // Cheapest available options
                    result.recommendedModels = models
                        .sort((a, b) => a.pricing.input - b.pricing.input)
                        .slice(0, 3)
                        .map(m => m.id)

                    result.recommendedAgents = agents
                        .filter(a => a.difficulty === 'beginner')
                        .slice(0, 3)
                        .map(a => a.id)

                    result.reasoning.push('Selected most cost-effective models and basic agents')
                    break

                case 'performance':
                    // Highest performance models
                    result.recommendedModels = models
                        .sort((a, b) => b.intelligenceScore - a.intelligenceScore)
                        .slice(0, 3)
                        .map(m => m.id)

                    result.recommendedAgents = agents
                        .filter(a => a.difficulty === 'advanced' || a.difficulty === 'expert')
                        .slice(0, 6)
                        .map(a => a.id)

                    result.reasoning.push('Selected highest intelligence models and advanced agents for peak performance')
                    break
            }

            return result

        } catch (error) {
            console.error('Error getting recommended config:', error)
            return {
                recommendedModels: [],
                recommendedAgents: [],
                reasoning: ['Error occurred while generating recommendations']
            }
        }
    }
}

// Export singleton instance
export const configInitService = ConfigInitService.getInstance()
export default configInitService 