/**
 * Base Agent Node - Handles task execution for specific agents
 */

import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage, HumanMessage } from '@langchain/core/messages'
import { nanoid } from 'nanoid'
import type { OrchestratorState, Task, Result, GraphEvent, AgentCapability } from '../types'

export abstract class BaseAgentNode {
  protected model: ChatOpenAI
  protected capability: AgentCapability

  constructor(capability: AgentCapability) {
    this.capability = capability
    this.model = new ChatOpenAI({
      modelName: this.getModelName(),
      temperature: 0.7,
      maxTokens: 2048,
      openAIApiKey: process.env.OPENROUTER_API_KEY!,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': process.env.BETTER_AUTH_URL || 'http://localhost:3000',
          'X-Title': 'SwarmAI.chat'
        }
      }
    })
  }

  protected abstract getModelName(): string
  protected abstract getSystemPrompt(): string

  async process(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
    // Find tasks assigned to this agent
    const myTasks = Object.values(state.inFlight).filter(
      task => task.assignedTo === this.capability.agentId
    )

    if (myTasks.length === 0) {
      return {}
    }

    // Process the first task (could be made parallel)
    const task = myTasks[0]
    console.log(`🤖 ${this.capability.name} processing task:`, task.title)

    try {
      const result = await this.executeTask(task, state)
      
      // Remove task from inFlight
      const newInFlight = { ...state.inFlight }
      delete newInFlight[task.id]

      // Update task status
      const updatedTasks = state.tasks.map(t => 
        t.id === task.id 
          ? { ...t, status: 'completed' as const, completedAt: new Date() }
          : t
      )

      // Create events
      const events: GraphEvent[] = [
        ...state.events,
        {
          id: nanoid(8),
          type: 'agent_reply',
          timestamp: new Date(),
          agentId: this.capability.agentId,
          taskId: task.id,
          content: result.content.substring(0, 200) + '...',
          metadata: {
            confidence: result.confidence,
            tokenCount: result.metadata?.tokenCount
          }
        },
        {
          id: nanoid(8),
          type: 'task_done',
          timestamp: new Date(),
          agentId: this.capability.agentId,
          taskId: task.id,
          content: `Completed: ${task.title}`
        }
      ]

      return {
        inFlight: newInFlight,
        tasks: updatedTasks,
        results: [...state.results, result],
        events,
        costUSD: state.costUSD + (result.metadata?.cost || 0)
      }
    } catch (error) {
      console.error(`❌ ${this.capability.name} failed:`, error)
      
      // Mark task as failed
      const updatedTasks = state.tasks.map(t => 
        t.id === task.id 
          ? { ...t, status: 'failed' as const, error: error?.toString() }
          : t
      )

      // Remove from inFlight
      const newInFlight = { ...state.inFlight }
      delete newInFlight[task.id]

      const event: GraphEvent = {
        id: nanoid(8),
        type: 'system',
        timestamp: new Date(),
        agentId: this.capability.agentId,
        taskId: task.id,
        content: `Task failed: ${error?.toString()}`
      }

      return {
        inFlight: newInFlight,
        tasks: updatedTasks,
        events: [...state.events, event]
      }
    }
  }

  protected async executeTask(task: Task, state: OrchestratorState): Promise<Result> {
    const systemPrompt = this.getSystemPrompt()
    const userPrompt = this.buildTaskPrompt(task, state)

    const startTime = Date.now()
    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ])

    const content = response.content as string
    const processingTime = Date.now() - startTime

    // Calculate approximate token count and cost
    const tokenCount = Math.ceil(content.length / 4) // Rough estimate
    const cost = this.calculateCost(tokenCount)

    return {
      taskId: task.id,
      agentId: this.capability.agentId,
      content,
      confidence: 0.85, // Could be extracted from response
      metadata: {
        processingTime,
        tokenCount,
        cost,
        model: this.getModelName()
      },
      timestamp: new Date()
    }
  }

  protected buildTaskPrompt(task: Task, state: OrchestratorState): string {
    return `Task: ${task.title}

Description: ${task.description}

Context: The user's original request was: "${state.userMessage}"

Please complete this task thoroughly and provide a detailed response.`
  }

  protected calculateCost(tokenCount: number): number {
    const modelPricing: Record<string, number> = {
      'google/gemini-flash-1.5': 0.075,
      'anthropic/claude-3.5-sonnet': 3.0,
      'openai/gpt-4o': 2.5,
      'openai/gpt-4o-mini': 0.15
    }

    const pricePerMillion = modelPricing[this.getModelName()] || 0.075
    return (tokenCount / 1000000) * pricePerMillion
  }
}