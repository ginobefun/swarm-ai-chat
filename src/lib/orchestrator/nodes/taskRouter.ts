/**
 * Task Router node - Routes tasks to appropriate agent nodes
 */

import { nanoid } from 'nanoid'
import type { OrchestratorState, Task, GraphEvent } from '../types'

export class TaskRouterNode {
    async process(state: OrchestratorState): Promise<Partial<OrchestratorState>> {
        console.log('🚦 TaskRouter processing:', {
            totalTasks: state.tasks.length,
            pendingTasks: state.tasks.filter(t => t.status === 'pending').length,
            inFlightCount: Object.keys(state.inFlight).length,
            resultsCount: state.results.length
        })

        // Debug: log task statuses
        if (state.tasks.length > 0) {
            console.log('🔍 Task details:', state.tasks.map(t => ({
                id: t.id.substring(0, 8),
                title: t.title.substring(0, 30),
                status: t.status,
                assignedTo: t.assignedTo,
                dependencies: t.dependencies || []
            })))
        }

        // Find tasks that are ready to be executed
        const readyTasks = state.tasks.filter(task => {
            // Task must be pending
            if (task.status !== 'pending') {
                console.log(`🔍 Task ${task.id.substring(0, 8)} not pending: ${task.status}`)
                return false
            }

            // Task must not be in flight
            if (state.inFlight[task.id]) {
                console.log(`🔍 Task ${task.id.substring(0, 8)} already in flight`)
                return false
            }

            // All dependencies must be completed
            if (task.dependencies && task.dependencies.length > 0) {
                const completedDeps = task.dependencies.filter(depId =>
                    state.results.some(result => result.taskId === depId)
                )
                const allDepsCompleted = completedDeps.length === task.dependencies.length

                console.log(`🔍 Task ${task.id.substring(0, 8)} dependencies:`, {
                    total: task.dependencies.length,
                    completed: completedDeps.length,
                    allCompleted: allDepsCompleted
                })

                if (!allDepsCompleted) return false
            }

            return true
        })

        console.log(`🚦 Found ${readyTasks.length} ready tasks out of ${state.tasks.length} total`)

        if (readyTasks.length === 0) {
            // Check if all tasks are completed
            const allCompleted = state.tasks.every(task =>
                task.status === 'completed' || state.results.some(r => r.taskId === task.id)
            )

            if (allCompleted) {
                console.log('🎉 All tasks completed, no more routing needed')
                return { shouldProceedToSummary: true }
            }

            console.log('🚦 No ready tasks to route (waiting for dependencies or agent availability)')
            return {}
        }

        // Route tasks to agents (respecting concurrency limits)
        const updates: Partial<OrchestratorState> = {
            inFlight: { ...state.inFlight },
            events: [...state.events]
        }

        // Group tasks by assigned agent
        const tasksByAgent = readyTasks.reduce((acc, task) => {
            if (!acc[task.assignedTo]) acc[task.assignedTo] = []
            acc[task.assignedTo].push(task)
            return acc
        }, {} as Record<string, Task[]>)

        // Route tasks to agents
        let routedCount = 0
        for (const [agentId, tasks] of Object.entries(tasksByAgent)) {
            // Check how many tasks this agent is already handling
            const currentAgentTasks = Object.values(state.inFlight)
                .filter(t => t.assignedTo === agentId).length

            // Simple concurrency limit (can be made configurable)
            const maxConcurrent = 2
            const availableSlots = maxConcurrent - currentAgentTasks

            if (availableSlots > 0) {
                const tasksToRoute = tasks.slice(0, availableSlots)

                for (const task of tasksToRoute) {
                    // Mark task as in-flight
                    updates.inFlight![task.id] = {
                        ...task,
                        status: 'in_progress',
                        startedAt: new Date()
                    }

                    // Create task_start event
                    const event: GraphEvent = {
                        id: nanoid(8),
                        type: 'task_start',
                        timestamp: new Date(),
                        agentId: task.assignedTo,
                        taskId: task.id,
                        content: `Starting task: ${task.title}`,
                        metadata: {
                            taskType: task.type,
                            priority: task.priority
                        }
                    }

                    updates.events!.push(event)
                    routedCount++
                }
            }
        }

        console.log(`🚦 Routed ${routedCount} tasks to agents`)

        // Update task statuses in the main tasks array
        if (routedCount > 0) {
            updates.tasks = state.tasks.map(task => {
                if (updates.inFlight![task.id]) {
                    return { ...task, status: 'in_progress', startedAt: new Date() }
                }
                return task
            })
        }

        return updates
    }

    /**
     * Determines which node to route to next based on in-flight tasks
     */
    getNextNode(state: OrchestratorState): string | null {
        const inFlightTasks = Object.values(state.inFlight)

        if (inFlightTasks.length === 0) {
            return null // No tasks to process
        }

        // Find the first agent with a task to process
        const agentId = inFlightTasks[0]?.assignedTo

        if (agentId) {
            return `agent-${agentId}`
        }

        return null
    }
}