/**
 * Agent Catalog - Database-driven registry of available agents and their capabilities
 */

import { swarmConfigService } from '@/lib/services/SwarmConfigService'
import { BaseAgentNode } from './nodes/agentNode'
import type { AgentCapability } from './types'

// Import agent node classes (keep these for LangGraph execution)
import { ResearcherAgent } from './nodes/agents/researcher'
import { CriticalThinkerAgent } from './nodes/agents/criticalThinker'
import { CodeExpertAgent } from './nodes/agents/codeExpert'
import { GeneralAssistantAgent } from './nodes/agents/generalAssistant'
import { CreativeWriterAgent } from './nodes/agents/creativeWriter'
import { EducationTutorAgent } from './nodes/agents/educationTutor'
import { DataScientistAgent } from './nodes/agents/dataScientist'

export class DatabaseDrivenAgentCatalog {
    private agentNodeClasses: Map<string, new () => BaseAgentNode> = new Map()
    private capabilitiesCache: Map<string, AgentCapability> = new Map()
    private lastCacheUpdate = 0
    private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    constructor() {
        this.initializeNodeClasses()
    }

    /**
     * Initialize the mapping between agent IDs and their LangGraph node classes
     * This is still needed for LangGraph execution
     */
    private initializeNodeClasses() {
        // Map agent IDs to their corresponding node classes
        this.agentNodeClasses.set('researcher', ResearcherAgent)
        this.agentNodeClasses.set('article-summarizer', ResearcherAgent) // Use researcher for article summarization
        this.agentNodeClasses.set('critical-thinker', CriticalThinkerAgent)
        this.agentNodeClasses.set('code-expert', CodeExpertAgent)
        this.agentNodeClasses.set('general-assistant', GeneralAssistantAgent)
        this.agentNodeClasses.set('creative-writer', CreativeWriterAgent)
        this.agentNodeClasses.set('education-tutor', EducationTutorAgent)
        this.agentNodeClasses.set('data-scientist', DataScientistAgent)

        console.log('📚 Initialized agent node classes:', Array.from(this.agentNodeClasses.keys()))
    }

    /**
     * Check if capabilities cache needs refresh
     */
    private needsCacheRefresh(): boolean {
        return (Date.now() - this.lastCacheUpdate) > this.CACHE_DURATION
    }

    /**
     * Convert database agent task types to orchestrator task types
     */
    private convertTaskTypes(dbTaskTypes: string[]): Array<'research' | 'analyze' | 'summarize' | 'develop' | 'review'> {
        const taskTypeMap: Record<string, 'research' | 'analyze' | 'summarize' | 'develop' | 'review'> = {
            'RESEARCH': 'research',
            'ANALYZE': 'analyze',
            'SUMMARIZE': 'summarize',
            'DEVELOP': 'develop',
            'REVIEW': 'review',
            'CODE_GENERATION': 'develop',
            'CODE_REVIEW': 'review',
            'DATA_ANALYSIS': 'analyze',
            'CREATIVE_WRITING': 'develop',
            'TEACHING': 'develop'
        }

        return dbTaskTypes
            .map(type => taskTypeMap[type])
            .filter((type): type is 'research' | 'analyze' | 'summarize' | 'develop' | 'review' => !!type)
    }

    /**
     * Refresh capabilities cache from database
     */
    private async refreshCapabilitiesCache(): Promise<void> {
        try {
            console.log('🔄 Refreshing agent capabilities cache from database...')

            const agents = await swarmConfigService.getActiveAgents()
            this.capabilitiesCache.clear()

            for (const agent of agents) {
                const capability: AgentCapability = {
                    agentId: agent.id,
                    name: agent.name,
                    description: agent.description || '',
                    skills: [agent.description || ''], // Use description as skill for now
                    taskTypes: this.convertTaskTypes((agent as unknown as { taskTypes: string[] }).taskTypes || []),
                    maxConcurrentTasks: 2 // Default value
                }

                this.capabilitiesCache.set(agent.id, capability)
            }

            this.lastCacheUpdate = Date.now()
            console.log('✅ Agent capabilities cache refreshed:', {
                agentsCount: this.capabilitiesCache.size,
                timestamp: new Date(this.lastCacheUpdate).toISOString()
            })

        } catch (error) {
            console.error('❌ Failed to refresh capabilities cache:', error)
            throw error
        }
    }

    /**
     * Get agent capability by ID with database-driven lookup
     */
    async getAgentCapability(agentId: string): Promise<AgentCapability | undefined> {
        if (this.needsCacheRefresh()) {
            await this.refreshCapabilitiesCache()
        }

        return this.capabilitiesCache.get(agentId)
    }

    /**
     * Get all agent capabilities with database-driven lookup
     */
    async getAllCapabilities(): Promise<AgentCapability[]> {
        if (this.needsCacheRefresh()) {
            await this.refreshCapabilitiesCache()
        }

        return Array.from(this.capabilitiesCache.values())
    }

    /**
     * Get capabilities by task type
     */
    async getCapabilitiesByTaskType(taskType: string): Promise<AgentCapability[]> {
        const allCapabilities = await this.getAllCapabilities()
        return allCapabilities.filter(cap =>
            cap.taskTypes.includes(taskType as never)
        )
    }

    /**
     * Create agent node for LangGraph execution
     * Maps database agent ID to the appropriate node class
     */
    createAgentNode(agentId: string): BaseAgentNode | null {
        // For backward compatibility, try exact match first
        let NodeClass = this.agentNodeClasses.get(agentId)

        // If not found, try to find a suitable node class based on agent category/type
        if (!NodeClass) {
            // Map common agent types to available node classes
            const agentType = agentId.toLowerCase()

            if (agentType.includes('research') || agentType.includes('analyst') || agentType.includes('summarizer')) {
                NodeClass = ResearcherAgent
            } else if (agentType.includes('critical') || agentType.includes('thinker')) {
                NodeClass = CriticalThinkerAgent
            } else if (agentType.includes('code') || agentType.includes('developer') || agentType.includes('programmer')) {
                NodeClass = CodeExpertAgent
            } else if (agentType.includes('creative') || agentType.includes('writer')) {
                NodeClass = CreativeWriterAgent
            } else if (agentType.includes('education') || agentType.includes('tutor') || agentType.includes('teacher')) {
                NodeClass = EducationTutorAgent
            } else if (agentType.includes('data') || agentType.includes('scientist') || agentType.includes('analyst')) {
                NodeClass = DataScientistAgent
            } else {
                // Default to general assistant
                NodeClass = GeneralAssistantAgent
            }

            console.log(`🔄 Mapped agent ${agentId} to node class: ${NodeClass.name}`)
        }

        if (!NodeClass) {
            console.error(`❌ No suitable node class found for agent ${agentId}`)
            return null
        }

        try {
            return new NodeClass()
        } catch (error) {
            console.error(`❌ Failed to instantiate node for agent ${agentId}:`, error)
            return null
        }
    }

    /**
     * Force refresh cache
     */
    async forceRefresh(): Promise<void> {
        this.lastCacheUpdate = 0
        await this.refreshCapabilitiesCache()
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number
        lastUpdate: Date
        cacheAge: number
        needsRefresh: boolean
    } {
        return {
            size: this.capabilitiesCache.size,
            lastUpdate: new Date(this.lastCacheUpdate),
            cacheAge: Date.now() - this.lastCacheUpdate,
            needsRefresh: this.needsCacheRefresh()
        }
    }
}

// Singleton instance
export const agentCatalog = new DatabaseDrivenAgentCatalog()

// Legacy compatibility export (for backward compatibility)
export { DatabaseDrivenAgentCatalog as AgentCatalog }