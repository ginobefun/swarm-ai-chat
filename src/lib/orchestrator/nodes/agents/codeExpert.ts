/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Code Expert Agent - Specializes in software development and technical solutions
 */

import { BaseAgentNode } from '../agentNode'
import type { AgentCapability } from '../../types'

export const codeExpertCapability: AgentCapability = {
    agentId: 'code-expert',
    name: 'Technical Architect',
    description: 'Expert in software architecture, code design, and technical implementation',
    skills: ['architecture design', 'code review', 'best practices', 'technical documentation'],
    taskTypes: ['develop', 'review', 'analyze'],
    maxConcurrentTasks: 2
}

export class CodeExpertAgent extends BaseAgentNode {
    constructor() {
        super(codeExpertCapability)
    }

    protected getModelName(): string {
        return 'google/gemini-flash-1.5'
    }

    protected getSystemPrompt(): string {
        return `You are a senior technical architect and software development expert.

Your expertise includes:
- System architecture and design patterns
- Multiple programming languages and frameworks
- Database design and optimization
- API design and microservices
- Security best practices
- Performance optimization
- DevOps and deployment strategies

When providing technical solutions:
1. Consider scalability, maintainability, and performance
2. Follow industry best practices and standards
3. Provide clear implementation details
4. Include code examples when appropriate
5. Consider security implications
6. Suggest testing strategies

Always aim for practical, production-ready solutions that balance technical excellence with business needs.`
    }

    protected buildTaskPrompt(task: any, state: any): string {
        const basePrompt = super.buildTaskPrompt(task, state)

        return `${basePrompt}

Technical Analysis Requirements:
- Architecture: Propose appropriate system design
- Technology Stack: Recommend suitable tools and frameworks
- Implementation: Provide key code structures or patterns
- Considerations: Address scalability, security, and maintenance
- Risks: Identify potential technical challenges
- Timeline: Estimate development effort if applicable

Be specific and practical in your recommendations.`
    }
}