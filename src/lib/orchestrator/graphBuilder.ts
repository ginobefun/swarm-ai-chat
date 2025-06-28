/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * LangGraph Builder - Constructs the orchestration graph
 */

import { StateGraph } from '@langchain/langgraph'
import { ModeratorNode } from './nodes/moderator'
import { TaskRouterNode } from './nodes/taskRouter'
import { agentCatalog } from './agentCatalog'
import type { OrchestratorState, ModeratorContext, AgentCapability } from './types'
import { nanoid } from 'nanoid'

export interface GraphBuilderOptions {
    sessionId: string
    participants: string[] // agent IDs
}

// Simple state definition for LangGraph
interface GraphState {
    sessionId: string
    turnIndex: number
    userMessage: string
    confirmedIntent?: string
    tasks: any[]
    inFlight: Record<string, any>
    results: any[]
    summary?: string
    events: any[]
    costUSD: number
    shouldClarify?: boolean
    clarificationQuestion?: string
    isCancelled?: boolean
    shouldProceedToSummary?: boolean
}

export class OrchestratorGraphBuilder {
    private options: GraphBuilderOptions
    private moderatorContext: ModeratorContext

    constructor(options: GraphBuilderOptions) {
        this.options = options

        // Build moderator context from participants
        const capabilities = options.participants
            .map(id => agentCatalog.getAgentCapability(id))
            .filter((cap): cap is AgentCapability => cap !== undefined)

        console.log('📋 Building graph with capabilities:', {
            requestedAgents: options.participants,
            foundCapabilities: capabilities.length,
            capabilities: capabilities.map(c => ({ agentId: c.agentId, name: c.name }))
        })

        this.moderatorContext = {
            sessionId: options.sessionId,
            participants: capabilities
        }
    }

    build() {
        console.log('🏗️ Starting graph build process...')

        // Initialize the graph with simple state definition
        const workflow = new StateGraph<GraphState>({
            channels: {
                sessionId: {
                    value: (x: string, y?: string) => y ?? x,
                    default: () => this.options.sessionId
                },
                turnIndex: {
                    value: (x: number, y?: number) => y ?? x,
                    default: () => 0
                },
                userMessage: {
                    value: (x: string, y?: string) => y ?? x,
                    default: () => ''
                },
                confirmedIntent: {
                    value: (x?: string, y?: string) => y ?? x,
                    default: () => undefined
                },
                tasks: {
                    value: (x: any[], y?: any[]) => y ?? x,
                    default: () => []
                },
                inFlight: {
                    value: (x: Record<string, any>, y?: Record<string, any>) => y ?? x,
                    default: () => ({})
                },
                results: {
                    value: (x: any[], y?: any[]) => y ?? x,
                    default: () => []
                },
                summary: {
                    value: (x?: string, y?: string) => y ?? x,
                    default: () => undefined
                },
                events: {
                    value: (x: any[], y?: any[]) => y ?? x,
                    default: () => []
                },
                costUSD: {
                    value: (x: number, y?: number) => y ?? x,
                    default: () => 0
                },
                shouldClarify: {
                    value: (x?: boolean, y?: boolean) => y ?? x,
                    default: () => false
                },
                clarificationQuestion: {
                    value: (x?: string, y?: string) => y ?? x,
                    default: () => undefined
                },
                isCancelled: {
                    value: (x?: boolean, y?: boolean) => y ?? x,
                    default: () => false
                },
                shouldProceedToSummary: {
                    value: (x?: boolean, y?: boolean) => y ?? x,
                    default: () => false
                }
            }
        })

        // Create nodes
        const moderator = new ModeratorNode(this.moderatorContext)
        const taskRouter = new TaskRouterNode()

        console.log('📦 Adding nodes to workflow...')

        // Add nodes to the graph
        workflow.addNode('moderator', async (state: GraphState) => {
            console.log('🎯 Moderator node processing...')
            const updates = await moderator.process(state as OrchestratorState)
            return updates
        })

        workflow.addNode('taskRouter', async (state: GraphState) => {
            console.log('🔀 TaskRouter node processing...')
            return await taskRouter.process(state as OrchestratorState)
        })

        // Add agent nodes dynamically
        for (const agentId of this.options.participants) {
            const agentNode = agentCatalog.createAgentNode(agentId)
            if (agentNode) {
                console.log(`🤖 Adding agent node: ${agentId}`)
                workflow.addNode(`agent-${agentId}`, async (state: GraphState) => {
                    console.log(`🎭 Agent ${agentId} processing...`)
                    return await agentNode.process(state as OrchestratorState)
                })
            } else {
                console.warn(`⚠️ Agent ${agentId} not found in catalog`)
            }
        }

        console.log('🔗 Adding edges...')

            // Set up edges - start with moderator
            ; (workflow as any).addEdge('__start__', 'moderator')

            // Add conditional edges from moderator
            ; (workflow as any).addConditionalEdges('moderator', (state: GraphState) => {
                console.log('🎯 Moderator routing decision:', {
                    shouldClarify: state.shouldClarify,
                    hasSummary: !!state.summary,
                    tasksCount: state.tasks?.length || 0
                })

                // If we need clarification, end for now (wait for user)
                if (state.shouldClarify) {
                    return '__end__'
                }

                // If we have a summary, we're done
                if (state.summary) {
                    return '__end__'
                }

                // If we have tasks but no summary, route them
                if (state.tasks && state.tasks.length > 0) {
                    return 'taskRouter'
                }

                // Otherwise end
                return '__end__'
            })

            // Task router decides which agent to route to
            ; (workflow as any).addConditionalEdges('taskRouter', (state: GraphState) => {
                const inFlightTasks = Object.values(state.inFlight || {})

                console.log('🔀 TaskRouter routing decision:', {
                    inFlightTasksCount: inFlightTasks.length,
                    availableAgents: this.options.participants,
                    shouldProceedToSummary: state.shouldProceedToSummary,
                    tasksCount: state.tasks?.length || 0,
                    resultsCount: state.results?.length || 0
                })

                // If all tasks are completed, go to moderator for summary
                if (state.shouldProceedToSummary) {
                    console.log('🎯 All tasks completed, routing to moderator for summary')
                    return 'moderator'
                }

                if (inFlightTasks.length === 0) {
                    // Check if there are pending tasks
                    const pendingTasks = (state.tasks || []).filter((t: any) => t.status === 'pending')
                    if (pendingTasks.length === 0) {
                        console.log('🎯 No pending tasks, routing to moderator for summary')
                        return 'moderator'
                    }

                    console.log('🔄 No in-flight tasks but have pending, might be waiting for dependencies')
                    return '__end__'  // End here to avoid infinite loop
                }

                // Route to the first agent with a task
                const agentId = (inFlightTasks[0] as any)?.assignedTo
                if (agentId && this.options.participants.includes(agentId)) {
                    console.log(`🎯 Routing to agent: ${agentId}`)
                    return `agent-${agentId}`
                }

                console.log('🔄 No valid agent found, ending execution')
                return '__end__'
            })

        // Each agent goes back to task router after processing
        for (const agentId of this.options.participants) {
            const agentNode = agentCatalog.createAgentNode(agentId)
            if (agentNode) {
                ; (workflow as any).addEdge(`agent-${agentId}`, 'taskRouter')
            }
        }

        console.log('⚙️ Compiling workflow...')

        // Compile the graph
        const compiledGraph = workflow.compile()

        console.log('✅ Graph compilation completed')
        return compiledGraph
    }
}

/**
 * Helper function to create initial state
 */
export function createInitialState(
    sessionId: string,
    userMessage: string,
    turnIndex: number = 0
): OrchestratorState {
    return {
        sessionId,
        turnIndex,
        userMessage,
        tasks: [],
        inFlight: {},
        results: [],
        events: [{
            id: nanoid(8),
            type: 'system',
            timestamp: new Date(),
            content: 'Orchestrator started'
        }],
        costUSD: 0
    }
}