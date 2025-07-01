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
    userAction?: UserAction  // Add support for user actions
    improvementRequest?: string  // For user improvement suggestions
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
        username: string
    }
}

/**
 * Agent configuration interface including model parameters
 */
export interface AgentConfiguration {
    systemPrompt: string
    modelName: string
    temperature: number  // Always has a value (either from agent config, model default, or fallback)
    maxTokens: number   // Always has a value (either from agent config, model default, or fallback)
    name: string
    agentId: string
    avatar: string      // Agent avatar/icon from SwarmAIAgent.icon field
    // Model pricing information
    inputPricePerK: number   // Price per 1K input tokens in USD
    outputPricePerK: number  // Price per 1K output tokens in USD
}

/**
 * Enhanced task interface with more details
 */
export interface EnhancedTask extends Task {
    createdAt: Date
    startedAt?: Date
    completedAt?: Date
    progress?: number  // 0-100
    estimatedTime?: number  // in seconds
    dependencies?: string[]  // task IDs this task depends on
    output?: string  // partial or final output
}

/**
 * Collaboration phase types for UI display
 */
export type CollaborationPhase =
    | 'idle'              // No active collaboration
    | 'clarifying'        // Moderator asking for clarification
    | 'planning'          // Moderator planning tasks
    | 'executing'         // Agents executing tasks
    | 'summarizing'       // Moderator summarizing results
    | 'completed'         // Collaboration completed
    | 'interrupted'       // User interrupted the process

/**
 * Message types for collaboration display
 */
export type CollaborationMessageType =
    | 'user_request'      // User's initial request
    | 'clarification'     // Moderator's clarification question
    | 'user_clarification' // User's clarification response
    | 'task_planning'     // Moderator's task planning
    | 'task_assignment'   // Task assigned to an agent
    | 'agent_response'    // Agent's task response
    | 'final_summary'     // Moderator's final summary
    | 'improvement_request' // User's improvement request

/**
 * Stream event types for real-time updates
 */
export type StreamEventType =
    | 'collaboration_started'  // Collaboration process started
    | 'intent_clarification'   // Moderator needs intent clarification
    | 'task_planning'          // Moderator is planning tasks
    | 'task_created'           // A new task has been created
    | 'task_assigned'          // Task assigned to an agent
    | 'task_started'           // Agent started working on task
    | 'task_progress'          // Progress update from agent
    | 'task_completed'         // Task completed by agent
    | 'task_failed'            // Task failed
    | 'summary_started'        // Moderator started summarizing
    | 'summary_completed'      // Final summary ready
    | 'collaboration_completed' // Entire collaboration completed
    | 'user_feedback'          // User provided feedback
    | 'user_interrupt'         // User interrupted the process

/**
 * Stream event for real-time updates
 */
export interface StreamEvent {
    id: string
    type: StreamEventType
    timestamp: Date
    agentId?: string
    taskId?: string
    content?: string
    metadata?: Record<string, unknown>
}

/**
 * User action types
 */
export type UserActionType = 'interrupt' | 'retry' | 'like' | 'dislike' | 'suggest' | 'improve'

/**
 * User action interface
 */
export interface UserAction {
    type: UserActionType
    sessionId: string
    messageId?: string
    taskId?: string
    suggestion?: string
    timestamp: Date
}

/**
 * Enhanced orchestrator response with streaming support
 */
export interface EnhancedOrchestratorResponse extends OrchestratorResponse {
    streamEvents: StreamEvent[]
    tasks: EnhancedTask[]
    isStreaming: boolean
    canInterrupt: boolean
    canRetry: boolean
    phase: CollaborationPhase
    structuredResult?: StructuredCollaborationResult
}

/**
 * Structured collaboration result for better output organization
 */
export interface StructuredCollaborationResult {
    title: string
    summary: string
    isRecommended?: boolean
    confidence?: number  // 0-100
    keyPoints: string[]
    criticalThoughts: string[]
    quotes: string[]
    pros: string[]
    cons: string[]
    actionItems: string[]
    mindMap?: string  // Mermaid format
    references?: string[]
    tags?: string[]
    metadata?: {
        analysisType: string
        complexity: 'simple' | 'medium' | 'complex'
        processingTime: number
        agentsInvolved: string[]
    }
}

/**
 * Workspace data for real-time collaboration tracking
 */
export interface WorkspaceData {
    phase: CollaborationPhase
    taskSummary?: string
    taskList: EnhancedTask[]
    currentTask?: string  // ID of currently active task
    finalResults?: StructuredCollaborationResult
    lastUpdated: Date
    stats?: {
        totalTasks: number
        completedTasks: number
        activeAgents: number
        estimatedTimeRemaining?: number
    }
}

/**
 * Collaboration message for natural conversation flow
 */
export interface CollaborationMessage {
    id: string
    type: CollaborationMessageType
    content: string
    sender: string
    senderType: 'moderator' | 'agent' | 'user'
    agentId?: string
    taskId?: string
    timestamp: Date
    isStreaming?: boolean
    metadata?: {
        phase: CollaborationPhase
        relatedTasks?: string[]
        confidence?: number
    }
}

/**
 * Agent activity status for real-time updates
 */
export interface AgentActivity {
    agentId: string
    name: string
    avatar: string
    status: 'idle' | 'thinking' | 'working' | 'completed'
    currentTask?: string
    progress?: number
    lastActivity?: Date
    estimatedCompletion?: Date
}

/**
 * Collaboration controls for user interaction
 */
export interface CollaborationControls {
    canPause: boolean
    canResume: boolean
    canInterrupt: boolean
    canRetry: boolean
    canImprove: boolean
    canFeedback: boolean
} 