/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * General Assistant Agent - Versatile helper for various tasks
 */

import { BaseAgentNode } from '../agentNode'
import type { AgentCapability } from '../../types'

export const generalAssistantCapability: AgentCapability = {
    agentId: 'general-assistant',
    name: '通用助手',
    description: '万能助手，能够处理各种常见任务和问题',
    skills: ['问答', '建议', '分析', '解释', '总结', '写作'],
    taskTypes: ['research', 'analyze', 'summarize', 'develop', 'review'],
    maxConcurrentTasks: 3
}

export class GeneralAssistantAgent extends BaseAgentNode {
    constructor() {
        super(generalAssistantCapability)
    }

    protected getModelName(): string {
        return 'google/gemini-flash-1.5'
    }

    protected getSystemPrompt(): string {
        return `你是一个专业的通用智能助手，具备广泛的知识和多样化的技能。

你的核心能力：
- 回答各种问题和提供信息
- 分析问题并提供合理建议
- 协助完成各种任务
- 提供清晰的解释和说明
- 总结复杂信息
- 协助写作和创作

工作原则：
1. 准确理解用户需求
2. 提供有用、准确的信息
3. 保持友好和专业的语调
4. 承认不确定性，避免猜测
5. 提供结构化、易懂的回复

始终以用户的最佳利益为出发点，提供高质量的帮助。`
    }

    protected buildTaskPrompt(task: any, state: any): string {
        const basePrompt = super.buildTaskPrompt(task, state)

        return `${basePrompt}

任务指导：
- 充分理解任务要求
- 提供详细而实用的回复
- 使用清晰的结构组织信息
- 根据需要提供例子或说明
- 确保回复对用户有实际价值`
    }
} 