/**
 * Agent Catalog - Registry of available agents and their capabilities
 */

import { ResearcherAgent, researcherCapability } from './nodes/agents/researcher'
import { CriticalThinkerAgent, criticalThinkerCapability } from './nodes/agents/criticalThinker'
import { CodeExpertAgent, codeExpertCapability } from './nodes/agents/codeExpert'
import { GeneralAssistantAgent, generalAssistantCapability } from './nodes/agents/generalAssistant'
import { CreativeWriterAgent, creativeWriterCapability } from './nodes/agents/creativeWriter'
import { EducationTutorAgent, educationTutorCapability } from './nodes/agents/educationTutor'
import { DataScientistAgent, dataScientistCapability } from './nodes/agents/dataScientist'
import { BaseAgentNode } from './nodes/agentNode'
import type { AgentCapability } from './types'

export class AgentCatalog {
    private agents: Map<string, {
        capability: AgentCapability
        nodeClass: typeof BaseAgentNode
    }> = new Map()

    constructor() {
        this.registerDefaultAgents()
    }

    private registerDefaultAgents() {
        // Register research analyst
        this.registerAgent(researcherCapability, ResearcherAgent)

        // Register critical thinker
        this.registerAgent(criticalThinkerCapability, CriticalThinkerAgent)

        // Register code expert
        this.registerAgent(codeExpertCapability, CodeExpertAgent)

        // Register general assistant
        this.registerAgent(generalAssistantCapability, GeneralAssistantAgent)

        // Register creative writer
        this.registerAgent(creativeWriterCapability, CreativeWriterAgent)

        // Register education tutor
        this.registerAgent(educationTutorCapability, EducationTutorAgent)

        // Register data scientist
        this.registerAgent(dataScientistCapability, DataScientistAgent)

        console.log('📚 Registered agents:', Array.from(this.agents.keys()))
    }

    registerAgent(capability: AgentCapability, nodeClass: typeof BaseAgentNode) {
        this.agents.set(capability.agentId, {
            capability,
            nodeClass
        })
    }

    getAgent(agentId: string): { capability: AgentCapability, nodeClass: typeof BaseAgentNode } | undefined {
        return this.agents.get(agentId)
    }

    getAgentCapability(agentId: string): AgentCapability | undefined {
        return this.agents.get(agentId)?.capability
    }

    getAllCapabilities(): AgentCapability[] {
        return Array.from(this.agents.values()).map(a => a.capability)
    }

    getCapabilitiesByTaskType(taskType: string): AgentCapability[] {
        return this.getAllCapabilities().filter(cap =>
            cap.taskTypes.includes(taskType as never)
        )
    }

    createAgentNode(agentId: string): BaseAgentNode | null {
        const agent = this.agents.get(agentId)
        if (!agent) {
            console.error(`Agent ${agentId} not found in catalog`)
            return null
        }

        // @ts-expect-error - Dynamic instantiation
        return new agent.nodeClass()
    }
}

// Singleton instance
export const agentCatalog = new AgentCatalog()