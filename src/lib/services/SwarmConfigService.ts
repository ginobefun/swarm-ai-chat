import prisma from '@/lib/database/prisma'
import type {
    SwarmAIModel,
    SwarmAIAgent,
    SwarmModelProvider,
    SwarmAgentCategory,
    SwarmTaskType,
    SwarmModelCapability
} from '@prisma/client'

// Extended types for easier consumption - we can use the base types directly
export type ExtendedSwarmAIModel = SwarmAIModel

export interface ExtendedSwarmAIAgent extends SwarmAIAgent {
    model: SwarmAIModel
}

export interface AgentWithModel {
    id: string
    name: string
    description: string
    icon?: string
    color?: string
    category: SwarmAgentCategory
    taskTypes: SwarmTaskType[]
    specializations: string[]
    systemPrompt: string
    model: {
        id: string
        displayName: string
        modelName: string
        provider: SwarmModelProvider
        baseUrl: string
        defaultTemperature: number
        intelligenceScore: number
        capabilities: SwarmModelCapability[]
        contextWindow: number
        maxOutputTokens: number
    }
    temperature?: number
    maxTokens?: number
    functionCalling: boolean
    isActive: boolean
    difficulty: string
    traits: string[]
    tags: string[]
}

export interface ModelInfo {
    id: string
    displayName: string
    modelName: string
    provider: SwarmModelProvider
    baseUrl: string
    defaultTemperature: number
    intelligenceScore: number
    capabilities: SwarmModelCapability[]
    contextWindow: number
    maxOutputTokens: number
    inputPricePerK: number
    outputPricePerK: number
    tier: string
    isActive: boolean
}

/**
 * Service for managing AI models and agents from database
 */
export class SwarmConfigService {
    private static instance: SwarmConfigService
    private modelCache: Map<string, ExtendedSwarmAIModel> = new Map()
    private agentCache: Map<string, ExtendedSwarmAIAgent> = new Map()
    private cacheTimestamp: number = 0
    private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    public static getInstance(): SwarmConfigService {
        if (!SwarmConfigService.instance) {
            SwarmConfigService.instance = new SwarmConfigService()
        }
        return SwarmConfigService.instance
    }

    /**
     * Check if cache is still valid
     */
    private isCacheValid(): boolean {
        return Date.now() - this.cacheTimestamp < this.CACHE_DURATION
    }

    /**
     * Clear cache
     */
    public clearCache(): void {
        this.modelCache.clear()
        this.agentCache.clear()
        this.cacheTimestamp = 0
    }

    /**
     * Get all active AI models
     */
    public async getActiveModels(): Promise<ExtendedSwarmAIModel[]> {
        try {
            const models = await prisma.swarmAIModel.findMany({
                where: {
                    isActive: true,
                    isSystemModel: true
                },
                orderBy: [
                    { intelligenceScore: 'desc' },
                    { displayName: 'asc' }
                ]
            })

            return models
        } catch (error) {
            console.error('Error fetching active models:', error)
            throw new Error('Failed to fetch AI models')
        }
    }

    /**
     * Get model by ID
     */
    public async getModelById(modelId: string): Promise<ExtendedSwarmAIModel | null> {
        try {
            // Check cache first
            if (this.isCacheValid() && this.modelCache.has(modelId)) {
                return this.modelCache.get(modelId)!
            }

            const model = await prisma.swarmAIModel.findUnique({
                where: {
                    id: modelId,
                    isActive: true
                }
            })

            if (model) {
                this.modelCache.set(modelId, model)
                this.cacheTimestamp = Date.now()
            }

            return model
        } catch (error) {
            console.error(`Error fetching model ${modelId}:`, error)
            return null
        }
    }

    /**
     * Get the smartest model (highest intelligence score)
     */
    public async getSmartestModel(): Promise<ExtendedSwarmAIModel | null> {
        try {
            const model = await prisma.swarmAIModel.findFirst({
                where: {
                    isActive: true,
                    isSystemModel: true
                },
                orderBy: {
                    intelligenceScore: 'desc'
                }
            })

            return model
        } catch (error) {
            console.error('Error fetching smartest model:', error)
            return null
        }
    }

    /**
     * Get models by provider
     */
    public async getModelsByProvider(provider: SwarmModelProvider): Promise<ExtendedSwarmAIModel[]> {
        try {
            const models = await prisma.swarmAIModel.findMany({
                where: {
                    provider,
                    isActive: true,
                    isSystemModel: true
                },
                orderBy: [
                    { intelligenceScore: 'desc' },
                    { displayName: 'asc' }
                ]
            })

            return models
        } catch (error) {
            console.error(`Error fetching models for provider ${provider}:`, error)
            return []
        }
    }

    /**
     * Get all active agents
     */
    public async getActiveAgents(): Promise<ExtendedSwarmAIAgent[]> {
        try {
            const agents = await prisma.swarmAIAgent.findMany({
                where: {
                    isActive: true,
                    isSystemAgent: true
                },
                include: {
                    model: true
                },
                orderBy: [
                    { isFeatured: 'desc' },
                    { averageRating: 'desc' },
                    { name: 'asc' }
                ]
            })

            return agents
        } catch (error) {
            console.error('Error fetching active agents:', error)
            throw new Error('Failed to fetch AI agents')
        }
    }

    /**
     * Get agent by ID
     */
    public async getAgentById(agentId: string): Promise<ExtendedSwarmAIAgent | null> {
        try {
            // Check cache first
            if (this.isCacheValid() && this.agentCache.has(agentId)) {
                return this.agentCache.get(agentId)!
            }

            const agent = await prisma.swarmAIAgent.findUnique({
                where: {
                    id: agentId,
                    isActive: true
                },
                include: {
                    model: true
                }
            })

            if (agent) {
                this.agentCache.set(agentId, agent)
                this.cacheTimestamp = Date.now()
            }

            return agent
        } catch (error) {
            console.error(`Error fetching agent ${agentId}:`, error)
            return null
        }
    }

    /**
     * Get agents by category
     */
    public async getAgentsByCategory(category: SwarmAgentCategory): Promise<ExtendedSwarmAIAgent[]> {
        try {
            const agents = await prisma.swarmAIAgent.findMany({
                where: {
                    category,
                    isActive: true,
                    isSystemAgent: true
                },
                include: {
                    model: true
                },
                orderBy: [
                    { isFeatured: 'desc' },
                    { averageRating: 'desc' },
                    { name: 'asc' }
                ]
            })

            return agents
        } catch (error) {
            console.error(`Error fetching agents for category ${category}:`, error)
            return []
        }
    }

    /**
     * Get featured agents
     */
    public async getFeaturedAgents(): Promise<ExtendedSwarmAIAgent[]> {
        try {
            const agents = await prisma.swarmAIAgent.findMany({
                where: {
                    isFeatured: true,
                    isActive: true,
                    isSystemAgent: true
                },
                include: {
                    model: true
                },
                orderBy: [
                    { averageRating: 'desc' },
                    { name: 'asc' }
                ]
            })

            return agents
        } catch (error) {
            console.error('Error fetching featured agents:', error)
            return []
        }
    }

    /**
     * Get agent with the smartest model for primary role
     */
    public async getSmartestAgent(): Promise<ExtendedSwarmAIAgent | null> {
        try {
            const agent = await prisma.swarmAIAgent.findFirst({
                where: {
                    isActive: true,
                    isSystemAgent: true
                },
                include: {
                    model: true
                },
                orderBy: {
                    model: {
                        intelligenceScore: 'desc'
                    }
                }
            })

            return agent
        } catch (error) {
            console.error('Error fetching smartest agent:', error)
            return null
        }
    }

    /**
     * Search agents by task types
     */
    public async getAgentsByTaskType(taskType: SwarmTaskType): Promise<ExtendedSwarmAIAgent[]> {
        try {
            const agents = await prisma.swarmAIAgent.findMany({
                where: {
                    taskTypes: {
                        has: taskType
                    },
                    isActive: true,
                    isSystemAgent: true
                },
                include: {
                    model: true
                },
                orderBy: [
                    { averageRating: 'desc' },
                    { name: 'asc' }
                ]
            })

            return agents
        } catch (error) {
            console.error(`Error fetching agents for task type ${taskType}:`, error)
            return []
        }
    }

    /**
     * Convert database agent to legacy format for compatibility
     */
    public agentToLegacyFormat(agent: ExtendedSwarmAIAgent): AgentWithModel {
        return {
            id: agent.id,
            name: agent.name,
            description: agent.description || '',
            icon: agent.icon || '🤖',
            color: agent.color || '#3B82F6',
            category: agent.category,
            taskTypes: agent.taskTypes,
            specializations: agent.specializations,
            systemPrompt: agent.systemPrompt,
            model: {
                id: agent.model.id,
                displayName: agent.model.displayName,
                modelName: agent.model.modelName,
                provider: agent.model.provider,
                baseUrl: agent.model.baseUrl,
                defaultTemperature: Number(agent.model.defaultTemperature),
                intelligenceScore: agent.model.intelligenceScore,
                capabilities: agent.model.capabilities,
                contextWindow: agent.model.contextWindow,
                maxOutputTokens: agent.model.maxOutputTokens,
            },
            temperature: agent.temperature ? Number(agent.temperature) : undefined,
            maxTokens: agent.maxTokens || undefined,
            functionCalling: agent.functionCalling,
            isActive: agent.isActive,
            difficulty: agent.difficulty,
            traits: agent.traits,
            tags: agent.tags,
        }
    }

    /**
     * Convert database model to info format
     */
    public modelToInfoFormat(model: ExtendedSwarmAIModel): ModelInfo {
        return {
            id: model.id,
            displayName: model.displayName,
            modelName: model.modelName,
            provider: model.provider,
            baseUrl: model.baseUrl,
            defaultTemperature: Number(model.defaultTemperature),
            intelligenceScore: model.intelligenceScore,
            capabilities: model.capabilities,
            contextWindow: model.contextWindow,
            maxOutputTokens: model.maxOutputTokens,
            inputPricePerK: Number(model.inputPricePerK),
            outputPricePerK: Number(model.outputPricePerK),
            tier: model.tier,
            isActive: model.isActive,
        }
    }

    /**
     * Update agent usage statistics
     */
    public async updateAgentUsage(agentId: string, usageTimeSeconds: number, rating?: number): Promise<void> {
        try {
            const updateData: {
                totalTasks: { increment: number }
                totalUsageTime: { increment: number }
                lastUsed: Date
                averageRating?: number
            } = {
                totalTasks: { increment: 1 },
                totalUsageTime: { increment: usageTimeSeconds },
                lastUsed: new Date(),
            }

            if (rating !== undefined) {
                // Calculate new average rating
                const agent = await prisma.swarmAIAgent.findUnique({
                    where: { id: agentId },
                    select: { averageRating: true, totalTasks: true }
                })

                if (agent) {
                    const currentRating = Number(agent.averageRating) || 0
                    const totalTasks = agent.totalTasks || 0
                    const newAverageRating = ((currentRating * totalTasks) + rating) / (totalTasks + 1)
                    updateData.averageRating = newAverageRating
                }
            }

            await prisma.swarmAIAgent.update({
                where: { id: agentId },
                data: updateData,
            })

            // Clear cache to force refresh
            this.agentCache.delete(agentId)
        } catch (error) {
            console.error(`Error updating agent usage for ${agentId}:`, error)
        }
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
            const agent = await this.getAgentById(agentId)
            if (!agent) return null

            return {
                modelName: agent.model.modelName,
                baseUrl: agent.model.baseUrl,
                temperature: agent.temperature ? Number(agent.temperature) : Number(agent.model.defaultTemperature),
                maxTokens: agent.maxTokens || agent.model.maxOutputTokens,
                systemPrompt: agent.systemPrompt,
            }
        } catch (error) {
            console.error(`Error getting LangGraph config for agent ${agentId}:`, error)
            return null
        }
    }
}

// Export singleton instance
export const swarmConfigService = SwarmConfigService.getInstance()
export default swarmConfigService 