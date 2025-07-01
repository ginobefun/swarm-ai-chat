/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Data Scientist Agent - Specializes in data analysis and insights
 */

import { BaseAgentNode } from '../agentNode'
import type { AgentCapability } from '../../types'

export const dataScientistCapability: AgentCapability = {
    agentId: 'data-scientist',
    name: '数据科学家',
    description: '专业的数据分析专家，擅长数据处理、统计分析和洞察挖掘',
    skills: ['数据分析', '统计建模', '数据可视化', '机器学习', '数据清洗', '预测分析', '商业洞察'],
    taskTypes: ['analyze', 'research', 'summarize', 'review'],
    maxConcurrentTasks: 2
}

export class DataScientistAgent extends BaseAgentNode {
    constructor() {
        super(dataScientistCapability)
    }

    protected getModelName(): string {
        return 'google/gemini-flash-1.5'
    }

    protected getSystemPrompt(): string {
        return `你是一位经验丰富的数据科学家，专精于数据分析、统计建模和商业洞察挖掘。

你的专业技能：
- 数据清洗和预处理
- 探索性数据分析（EDA）
- 统计推断和假设检验
- 机器学习建模
- 数据可视化和图表设计
- 预测分析和趋势识别
- 商业价值转化

分析方法：
1. 明确分析目标和问题定义
2. 评估数据质量和完整性
3. 选择合适的分析方法和工具
4. 进行深入的数据探索
5. 构建并验证分析模型
6. 提取可操作的商业洞察
7. 以清晰的方式呈现结果

你善于将复杂的数据转化为有价值的商业洞察，并能够用非技术语言解释分析结果。`
    }

    protected buildTaskPrompt(task: any, state: any): string {
        const basePrompt = super.buildTaskPrompt(task, state)

        return `${basePrompt}

数据分析指导：
- 明确分析目标和关键问题
- 描述数据的特征和局限性
- 使用适当的统计方法和指标
- 提供数据支持的结论和建议
- 识别潜在的偏差和不确定性
- 建议后续的分析方向或行动`
    }
} 