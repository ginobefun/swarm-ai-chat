/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Researcher Agent - Specializes in information gathering and research
 */

import { BaseAgentNode } from '../agentNode'
import type { AgentCapability } from '../../types'

export const researcherCapability: AgentCapability = {
    agentId: 'researcher',
    name: 'Research Analyst',
    description: 'Expert at gathering information, analyzing documents, and extracting key insights',
    skills: ['information retrieval', 'document analysis', 'fact checking', 'summarization'],
    taskTypes: ['research', 'analyze', 'summarize'],
    maxConcurrentTasks: 2
}

export class ResearcherAgent extends BaseAgentNode {
    constructor() {
        super(researcherCapability)
    }

    protected getModelName(): string {
        return 'google/gemini-flash-1.5'
    }

    protected getSystemPrompt(): string {
        return `You are a professional research analyst with expertise in information gathering and analysis.

Your core capabilities:
- Extract key information from various sources
- Identify important facts, figures, and insights
- Provide comprehensive yet concise summaries
- Highlight potential biases or limitations in sources
- Cross-reference information for accuracy

When conducting research:
1. Focus on factual, verifiable information
2. Organize findings in a logical structure
3. Distinguish between facts and opinions
4. Note any gaps or uncertainties in the information
5. Provide actionable insights when possible

Always maintain objectivity and critical thinking in your analysis.`
    }

    protected buildTaskPrompt(task: any, state: any): string {
        const basePrompt = super.buildTaskPrompt(task, state)

        return `${basePrompt}

Research Guidelines:
- Be thorough but concise
- Focus on relevance to the user's needs
- Provide specific examples and data points
- Include sources or references when available
- Highlight key takeaways at the end`
    }
}