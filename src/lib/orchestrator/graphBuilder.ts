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

export class OrchestratorGraphBuilder {
  private options: GraphBuilderOptions
  private moderatorContext: ModeratorContext

  constructor(options: GraphBuilderOptions) {
    this.options = options
    
    // Build moderator context from participants
    const capabilities = options.participants
      .map(id => agentCatalog.getAgentCapability(id))
      .filter((cap): cap is AgentCapability => cap !== undefined)

    this.moderatorContext = {
      sessionId: options.sessionId,
      participants: capabilities
    }
  }

  build() {
    // Initialize the graph with our state type
    const workflow = new StateGraph<OrchestratorState>({
      channels: {
        sessionId: {
          value: () => this.options.sessionId,
          default: () => this.options.sessionId
        },
        turnIndex: {
          value: (prev: number) => prev,
          default: () => 0
        },
        userMessage: {
          value: (prev: string) => prev,
          default: () => ''
        },
        confirmedIntent: {
          value: (prev?: string) => prev,
          default: () => undefined
        },
        tasks: {
          value: (prev: any[]) => prev,
          default: () => []
        },
        inFlight: {
          value: (prev: Record<string, any>) => prev,
          default: () => ({})
        },
        results: {
          value: (prev: any[]) => prev,
          default: () => []
        },
        summary: {
          value: (prev?: string) => prev,
          default: () => undefined
        },
        events: {
          value: (prev: any[]) => prev,
          default: () => []
        },
        costUSD: {
          value: (prev: number) => prev,
          default: () => 0
        },
        shouldClarify: {
          value: (prev?: boolean) => prev,
          default: () => false
        },
        clarificationQuestion: {
          value: (prev?: string) => prev,
          default: () => undefined
        },
        isCancelled: {
          value: (prev?: boolean) => prev,
          default: () => false
        }
      }
    })

    // Create nodes
    const moderator = new ModeratorNode(this.moderatorContext)
    const taskRouter = new TaskRouterNode()

    // Add nodes to the graph
    workflow.addNode('moderator', async (state) => {
      const updates = await moderator.process(state)
      return updates
    })

    workflow.addNode('taskRouter', async (state) => {
      return await taskRouter.process(state)
    })

    // Add agent nodes dynamically
    for (const agentId of this.options.participants) {
      const agentNode = agentCatalog.createAgentNode(agentId)
      if (agentNode) {
        workflow.addNode(`agent-${agentId}`, async (state) => {
          return await agentNode.process(state)
        })
      }
    }

    // Set up edges - start with moderator
    (workflow as any).addEdge('__start__', 'moderator')

    // Add edges
    workflow.addConditionalEdges('moderator', (state) => {
      // If we need clarification, end for now (wait for user)
      if (state.shouldClarify) {
        return '__end__' as any
      }
      
      // If we have a summary, we're done
      if (state.summary) {
        return '__end__' as any
      }
      
      // If we have tasks but no summary, route them
      if (state.tasks.length > 0) {
        return 'taskRouter'
      }
      
      // Otherwise end
      return '__end__' as any
    })

    // Task router decides which agent to route to
    workflow.addConditionalEdges('taskRouter', (state) => {
      const inFlightTasks = Object.values(state.inFlight)
      
      if (inFlightTasks.length === 0) {
        // No tasks to process, go back to moderator
        return 'moderator'
      }
      
      // Route to the first agent with a task
      const agentId = inFlightTasks[0]?.assignedTo
      if (agentId && this.options.participants.includes(agentId)) {
        return `agent-${agentId}`
      }
      
      return 'moderator'
    })

    // Each agent goes back to task router after processing
    for (const agentId of this.options.participants) {
      workflow.addEdge(`agent-${agentId}`, 'taskRouter')
    }

    // Compile the graph
    return workflow.compile()
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