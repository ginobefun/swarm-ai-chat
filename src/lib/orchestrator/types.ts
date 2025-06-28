/**
 * Core types for the LangGraph orchestrator
 */

export interface Task {
  id: string
  type: 'research' | 'analyze' | 'summarize' | 'develop' | 'review'
  title: string
  description: string
  assignedTo: string // agent ID
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  priority: 'high' | 'medium' | 'low'
  dependencies?: string[] // task IDs
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  result?: string
  error?: string
}

export interface Result {
  taskId: string
  agentId: string
  content: string
  confidence?: number
  metadata?: Record<string, any>
  timestamp: Date
}

export interface GraphEvent {
  id: string
  type: 'ask_user' | 'tasks_created' | 'task_start' | 'agent_reply' | 'task_done' | 'summary' | 'flow_cancelled' | 'system'
  timestamp: Date
  agentId?: string
  taskId?: string
  content?: string
  metadata?: Record<string, any>
}

export interface OrchestratorState {
  sessionId: string
  turnIndex: number
  userMessage: string
  confirmedIntent?: string
  tasks: Task[]
  inFlight: Record<string, Task>
  results: Result[]
  summary?: string
  events: GraphEvent[]
  costUSD: number
  // Additional state for control flow
  shouldClarify?: boolean
  clarificationQuestion?: string
  isCancelled?: boolean
}

export interface AgentCapability {
  agentId: string
  name: string
  description: string
  skills: string[]
  taskTypes: Task['type'][]
  maxConcurrentTasks: number
}

export interface ModeratorContext {
  sessionId: string
  participants: AgentCapability[]
  sessionHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface TaskPlan {
  tasks: Array<{
    type: Task['type']
    title: string
    description: string
    assignedTo: string
    priority: Task['priority']
    dependencies?: string[]
  }>
  rationale: string
}