/**
 * Chat-related type definitions for unified request/response handling
 */

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: string
    id?: string
}

export interface ChatRequestData {
    sessionId: string
    mode?: 'auto' | 'single' | 'multi'
    confirmedIntent?: string
    agentPreferences?: {
        primaryAgent?: string
        excludeAgents?: string[]
        includeAgents?: string[]
    }
}

export interface ChatMetadata {
    mode: 'single' | 'multi'
    agentId?: string
    agentIds?: string[]
    tokenCount?: number
    cost?: number
    processingTime?: number
    executionTime?: number
}

export interface OrchestratorEvent {
    id: string
    type: string
    timestamp: string | Date
    content?: string
    agentId?: string
    metadata?: {
        source?: string
        [key: string]: unknown
    }
}

export interface Task {
    id: string
    title: string
    description: string
    assignedTo: string
    status: 'pending' | 'in_progress' | 'completed' | 'failed'
    priority: string
}

export interface Result {
    taskId: string
    agentId: string
    content: string
}

export interface OrchestratorResponse {
    type: 'orchestrator'
    success: boolean
    turnIndex: number
    shouldClarify?: boolean
    clarificationQuestion?: string
    summary?: string
    events: OrchestratorEvent[]
    tasks: Task[]
    results: Result[]
    costUSD: number
}

export interface SessionAnalysis {
    isMultiAgent: boolean
    agentIds: string[]
    primaryAgentId: string
    session: {
        id: string
        participants: Array<{ agentId?: string | null }>
    }
    swarmUser: {
        id: string
        userId: string
    }
} 