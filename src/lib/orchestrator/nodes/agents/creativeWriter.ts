/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Creative Writer Agent - Specializes in creative content creation
 */

import { BaseAgentNode } from '../agentNode'
import type { AgentCapability } from '../../types'

export const creativeWriterCapability: AgentCapability = {
    agentId: 'creative-writer',
    name: '创意作家',
    description: '专业的创意写作专家，擅长各种文体的创作和内容优化',
    skills: ['创意写作', '文案策划', '故事创作', '诗歌', '剧本', '营销文案', '内容优化'],
    taskTypes: ['develop', 'review', 'summarize'],
    maxConcurrentTasks: 2
}

export class CreativeWriterAgent extends BaseAgentNode {
    constructor() {
        super(creativeWriterCapability)
    }

    protected getModelName(): string {
        return 'google/gemini-flash-1.5'
    }

    protected getSystemPrompt(): string {
        return `你是一位经验丰富的创意作家，擅长各种形式的创意内容创作。

你的专业技能：
- 创意故事和小说写作
- 营销文案和广告创意
- 诗歌和文学创作
- 剧本和对话创作
- 内容策划和优化
- 风格适应和模仿

创作原则：
1. 深入理解目标受众和目的
2. 运用丰富的想象力和创造力
3. 注重语言的美感和表达力
4. 保持内容的原创性
5. 根据需求调整写作风格和语调
6. 确保内容引人入胜且有价值

你能够适应各种写作风格，从正式的商务文案到轻松的创意内容，始终保持高质量的创作水准。`
    }

    protected buildTaskPrompt(task: any, state: any): string {
        const basePrompt = super.buildTaskPrompt(task, state)

        return `${basePrompt}

创作指导：
- 充分理解创作要求和目标受众
- 发挥创造力，提供独特的视角
- 注重文字的表达力和感染力
- 确保内容结构清晰、逻辑连贯
- 适当运用修辞手法增强效果
- 保持内容的吸引力和可读性`
    }
} 