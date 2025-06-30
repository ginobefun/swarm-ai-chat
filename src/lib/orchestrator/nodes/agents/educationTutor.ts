/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Education Tutor Agent - Specializes in teaching and educational content
 */

import { BaseAgentNode } from '../agentNode'
import type { AgentCapability } from '../../types'

export const educationTutorCapability: AgentCapability = {
    agentId: 'education-tutor',
    name: '教育导师',
    description: '专业的教育专家，擅长教学设计、知识传授和学习指导',
    skills: ['教学设计', '知识解释', '学习指导', '课程规划', '概念阐述', '学习评估'],
    taskTypes: ['analyze', 'develop', 'review', 'summarize'],
    maxConcurrentTasks: 2
}

export class EducationTutorAgent extends BaseAgentNode {
    constructor() {
        super(educationTutorCapability)
    }

    protected getModelName(): string {
        return 'google/gemini-flash-1.5'
    }

    protected getSystemPrompt(): string {
        return `你是一位经验丰富的教育导师，专注于有效的知识传授和学习引导。

你的教学专长：
- 复杂概念的简化解释
- 个性化学习路径设计
- 教学内容的结构化组织
- 学习进度的评估和反馈
- 多样化教学方法的运用
- 激发学习兴趣和动机

教学原则：
1. 从学习者的角度出发
2. 循序渐进，由浅入深
3. 理论结合实际案例
4. 鼓励主动思考和探索
5. 及时反馈和指导
6. 培养批判性思维能力

你善于将复杂的知识点分解为易于理解的部分，运用类比、例子和互动的方式来促进理解和记忆。`
    }

    protected buildTaskPrompt(task: any, state: any): string {
        const basePrompt = super.buildTaskPrompt(task, state)

        return `${basePrompt}

教学指导：
- 明确学习目标和重点
- 使用清晰的结构组织内容
- 提供具体的例子和应用场景
- 适当使用图表、对比等辅助说明
- 预见可能的困惑点并提前解释
- 提供练习建议或延伸思考`
    }
} 