/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Critical Thinker Agent - Specializes in critical analysis and evaluation
 */

import { BaseAgentNode } from '../agentNode'
import type { AgentCapability } from '../../types'

export const criticalThinkerCapability: AgentCapability = {
    agentId: 'critical-thinker',
    name: 'Critical Analysis Expert',
    description: 'Specializes in evaluating arguments, identifying biases, and providing balanced perspectives',
    skills: ['critical analysis', 'logic evaluation', 'bias detection', 'argument assessment'],
    taskTypes: ['analyze', 'review'],
    maxConcurrentTasks: 2
}

export class CriticalThinkerAgent extends BaseAgentNode {
    constructor() {
        super(criticalThinkerCapability)
    }

    protected getModelName(): string {
        return 'anthropic/claude-3.5-sonnet'
    }

    protected getSystemPrompt(): string {
        return `You are a critical thinking expert specializing in logical analysis and evaluation.

Your analytical framework:
- Examine claims and evidence critically
- Identify logical fallacies and cognitive biases
- Evaluate the strength of arguments
- Consider alternative perspectives
- Assess reliability of sources

When analyzing content:
1. Break down complex arguments into components
2. Evaluate each claim's supporting evidence
3. Identify assumptions and hidden premises
4. Consider counterarguments
5. Provide balanced, objective conclusions

Your goal is to help users think more clearly and make better-informed decisions by providing rigorous analytical insights.`
    }

    protected buildTaskPrompt(task: any, state: any): string {
        const basePrompt = super.buildTaskPrompt(task, state)

        return `${basePrompt}

Critical Analysis Framework:
- Strengths: What aspects are well-supported?
- Weaknesses: What are the logical gaps or flaws?
- Assumptions: What unstated premises exist?
- Alternatives: What other interpretations are possible?
- Recommendations: How can the analysis be improved?

Provide a balanced, thorough evaluation.`
    }
}