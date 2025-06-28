/**
 * Moderator node - The orchestrator that manages the conversation flow
 */

import { ChatOpenAI } from '@langchain/openai'
import { SystemMessage } from '@langchain/core/messages'
import { nanoid } from 'nanoid'
import type { OrchestratorState, Task, ModeratorContext, TaskPlan, GraphEvent } from '../types'

const moderatorModel = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
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

export class ModeratorNode {
    private context: ModeratorContext

    constructor(context: ModeratorContext) {
        this.context = context
    }

    async process(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
        console.log('🎯 Moderator processing state:', {
            sessionId: state.sessionId,
            turnIndex: state.turnIndex,
            hasUserMessage: !!state.userMessage,
            userMessageLength: state.userMessage?.length || 0,
            userMessagePreview: state.userMessage?.substring(0, 100) || 'NO MESSAGE',
            hasTasks: state.tasks.length > 0,
            hasResults: state.results.length > 0,
            confirmedIntent: state.confirmedIntent,
            shouldClarify: state.shouldClarify
        })

        console.log('🔍 Full state object keys:', Object.keys(state))
        console.log('🔍 State.userMessage direct check:', JSON.stringify(state.userMessage))

        // If cancelled, skip processing
        if (state.isCancelled) {
            return this.createCancellationSummary(state)
        }

        // Phase 1: Check if we need to clarify intent
        if (!state.confirmedIntent && !state.shouldClarify) {
            const clarification = await this.checkClarification(state)
            if (clarification.shouldClarify) {
                return clarification
            }
        }

        // Phase 2: Plan tasks if we have confirmed intent but no tasks
        if ((state.confirmedIntent || !state.shouldClarify) && state.tasks.length === 0) {
            return await this.planTasks(state)
        }

        // Phase 3: Summarize results if all tasks are completed or flagged for summary
        const allCompleted = state.tasks.every(task =>
            state.results.some(result => result.taskId === task.id)
        )

        if ((allCompleted && state.tasks.length > 0) || state.shouldProceedToSummary) {
            console.log('🎯 All tasks completed, generating summary...')
            return await this.summarizeResults(state)
        }

        // Phase 4: If we have tasks but they seem stuck, ask for clarification
        if (state.tasks.length > 0 && state.results.length > 0) {
            const completedCount = state.results.length
            const totalCount = state.tasks.length
            const progressStalled = completedCount < totalCount && !state.inFlight

            if (progressStalled && !state.shouldClarify) {
                console.log('🎯 Progress stalled, requesting clarification...')
                const clarificationEvent: GraphEvent = {
                    id: nanoid(8),
                    type: 'ask_user',
                    timestamp: new Date(),
                    content: `我已经完成了 ${completedCount}/${totalCount} 个任务。是否需要更多信息来完成剩余任务？`,
                    metadata: { source: 'moderator', reason: 'progress_stalled' }
                }

                return {
                    shouldClarify: true,
                    clarificationQuestion: clarificationEvent.content,
                    events: [...state.events, clarificationEvent]
                }
            }
        }

        // Otherwise, return empty update (let other nodes process)
        return {}
    }

    private async checkClarification(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
        const prompt = `You are a conversation moderator in a multi-agent chat system.
Analyze the user's message and determine if their intent is clear enough to create specific tasks.

User message: "${state.userMessage}"

Available agents in this session:
${this.context.participants.map(p => `- ${p.name}: ${p.description}`).join('\n')}

If the intent is CLEAR, respond with:
CLEAR_INTENT: [Brief description of what the user wants]

If the intent is UNCLEAR and needs clarification, respond with:
NEEDS_CLARIFICATION: [Specific question to ask the user]

Focus on understanding:
1. What specific outcome the user wants
2. Any constraints or preferences
3. The scope of the request`

        const response = await moderatorModel.invoke([
            new SystemMessage(prompt)
        ])

        const content = response.content as string

        if (content.startsWith('CLEAR_INTENT:')) {
            const intent = content.replace('CLEAR_INTENT:', '').trim()
            return {
                confirmedIntent: intent,
                shouldClarify: false
            }
        } else if (content.startsWith('NEEDS_CLARIFICATION:')) {
            const question = content.replace('NEEDS_CLARIFICATION:', '').trim()
            const event: GraphEvent = {
                id: nanoid(8),
                type: 'ask_user',
                timestamp: new Date(),
                content: question,
                metadata: { source: 'moderator' }
            }

            return {
                shouldClarify: true,
                clarificationQuestion: question,
                events: [...state.events, event]
            }
        }

        // Default to proceeding without clarification
        return {
            confirmedIntent: state.userMessage,
            shouldClarify: false
        }
    }

    private async planTasks(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
        const intent = state.confirmedIntent || state.userMessage

        const prompt = `You are a task planner for a multi-agent system.
Create a detailed task plan based on the user's intent.

User's intent: "${intent}"

Available agents and their capabilities:
${this.context.participants.map(p =>
            `- ${p.agentId} (${p.name}): ${p.description}
   Skills: ${p.skills.join(', ')}
   Can handle: ${p.taskTypes.join(', ')}`
        ).join('\n\n')}

Create a task plan with 2-5 specific tasks. Each task should:
1. Have a clear, actionable title
2. Include detailed description of what needs to be done
3. Be assigned to the most suitable agent
4. Have appropriate priority (high/medium/low)
5. List any dependencies on other tasks

Respond in JSON format:
{
  "tasks": [
    {
      "type": "research|analyze|summarize|develop|review",
      "title": "Clear task title",
      "description": "Detailed description",
      "assignedTo": "agent-id",
      "priority": "high|medium|low",
      "dependencies": []
    }
  ],
  "rationale": "Brief explanation of the task breakdown"
}`

        const response = await moderatorModel.invoke([
            new SystemMessage(prompt)
        ])

        try {
            const plan: TaskPlan = JSON.parse(response.content as string)

            // Convert plan to actual tasks
            const tasks: Task[] = plan.tasks.map((taskDef) => ({
                id: nanoid(8),
                ...taskDef,
                status: 'pending' as const,
                createdAt: new Date()
            }))

            // Create tasks_created event
            const event: GraphEvent = {
                id: nanoid(8),
                type: 'tasks_created',
                timestamp: new Date(),
                content: `Created ${tasks.length} tasks: ${tasks.map(t => t.title).join(', ')}`,
                metadata: {
                    taskCount: tasks.length,
                    rationale: plan.rationale
                }
            }

            return {
                tasks,
                events: [...state.events, event]
            }
        } catch (error) {
            console.error('Failed to parse task plan:', error)
            // Fallback: create a single research task
            const fallbackTask: Task = {
                id: nanoid(8),
                type: 'research',
                title: 'Analyze user request',
                description: intent,
                assignedTo: this.context.participants[0]?.agentId || 'gemini-flash',
                status: 'pending',
                priority: 'medium',
                createdAt: new Date()
            }

            return {
                tasks: [fallbackTask],
                events: [...state.events, {
                    id: nanoid(8),
                    type: 'system',
                    timestamp: new Date(),
                    content: 'Using fallback task planning'
                }]
            }
        }
    }

    private async summarizeResults(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
        const resultsText = state.results.map(r =>
            `Agent ${r.agentId} (Task: ${state.tasks.find(t => t.id === r.taskId)?.title}):
${r.content}`
        ).join('\n\n---\n\n')

        const prompt = `You are summarizing the results of a multi-agent collaboration.

Original user request: "${state.userMessage}"

Results from agents:
${resultsText}

Create a comprehensive summary that:
1. Synthesizes all agent outputs into a coherent response
2. Highlights key findings and insights
3. Provides actionable recommendations if applicable
4. Maintains a professional and helpful tone

Keep the summary concise but complete.`

        const response = await moderatorModel.invoke([
            new SystemMessage(prompt)
        ])

        const summary = response.content as string

        // Create summary event
        const event: GraphEvent = {
            id: nanoid(8),
            type: 'summary',
            timestamp: new Date(),
            content: summary,
            metadata: {
                taskCount: state.tasks.length,
                agentCount: new Set(state.results.map(r => r.agentId)).size
            }
        }

        return {
            summary,
            events: [...state.events, event]
        }
    }

    private createCancellationSummary(state: OrchestratorState): Partial<OrchestratorState> {
        const completedTasks = state.tasks.filter(t =>
            state.results.some(r => r.taskId === t.id)
        ).length

        const summary = `The workflow was cancelled by the user.
Completed ${completedTasks} out of ${state.tasks.length} tasks.
${completedTasks > 0 ? 'Partial results were saved to the workspace.' : ''}`

        const event: GraphEvent = {
            id: nanoid(8),
            type: 'flow_cancelled',
            timestamp: new Date(),
            content: summary
        }

        return {
            summary,
            events: [...state.events, event]
        }
    }
}