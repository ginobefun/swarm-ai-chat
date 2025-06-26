import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('�� 开始填充数据库种子数据...')

    // 1. 创建技能标签
    console.log('📝 创建技能标签...')
    const skills = await Promise.all([
        // 核心技能
        prisma.swarmSkillTag.create({
            data: {
                id: 'natural-language',
                name: '自然语言处理',
                category: 'CORE',
                color: '#3B82F6',
                description: '理解和生成自然语言文本的能力',
                sortOrder: 1
            }
        }),
        prisma.swarmSkillTag.create({
            data: {
                id: 'reasoning',
                name: '逻辑推理',
                category: 'CORE',
                color: '#8B5CF6',
                description: '进行逻辑分析和推理的能力',
                sortOrder: 2
        }
        }),
        prisma.swarmSkillTag.create({
            data: {
                id: 'creativity',
                name: '创意生成',
                category: 'CORE',
                color: '#F59E0B',
                description: '生成创新想法和创意内容的能力',
                sortOrder: 3
            }
        }),
        prisma.swarmSkillTag.create({
            data: {
            id: 'analysis',
            name: '数据分析',
                category: 'CORE',
            color: '#10B981',
                description: '分析和解释数据的能力',
                sortOrder: 4
            }
        }),
        // 工具技能
        prisma.swarmSkillTag.create({
            data: {
                id: 'code-generation',
                name: '代码生成',
                category: 'TOOL',
                color: '#6366F1',
                description: '生成和优化代码的能力',
                sortOrder: 5
            }
        }),
        prisma.swarmSkillTag.create({
            data: {
                id: 'web-search',
                name: '网络搜索',
                category: 'TOOL',
                color: '#EF4444',
                description: '搜索和获取网络信息的能力',
                sortOrder: 6
            }
        }),
        prisma.swarmSkillTag.create({
            data: {
                id: 'file-processing',
                name: '文件处理',
                category: 'TOOL',
                color: '#06B6D4',
                description: '处理各种文件格式的能力',
                sortOrder: 7
            }
        }),
        // 领域技能
        prisma.swarmSkillTag.create({
            data: {
                id: 'education',
                name: '教育培训',
                category: 'DOMAIN',
                color: '#84CC16',
                description: '教育和培训相关的专业能力',
                sortOrder: 8
            }
        }),
        prisma.swarmSkillTag.create({
            data: {
                id: 'business',
                name: '商业咨询',
                category: 'DOMAIN',
                color: '#F97316',
                description: '商业分析和咨询的专业能力',
                sortOrder: 9
            }
        }),
        prisma.swarmSkillTag.create({
            data: {
                id: 'creative-writing',
                name: '创意写作',
                category: 'DOMAIN',
                color: '#EC4899',
                description: '创意写作和内容创作的专业能力',
                sortOrder: 10
            }
        })
    ])

    // 2. 创建工具
    console.log('🔧 创建工具...')
    const tools = await Promise.all([
        prisma.swarmTool.create({
            data: {
                id: 'web-search-engine',
                name: '网络搜索引擎',
            icon: '🔍',
                description: '实时搜索网络信息',
                category: 'search',
                version: '1.0.0',
                costPerUse: 0.01,
                rateLimit: 100
            }
        }),
        prisma.swarmTool.create({
            data: {
                id: 'code-interpreter',
                name: '代码解释器',
            icon: '💻',
                description: '执行和分析代码',
            category: 'development',
                version: '1.0.0',
                costPerUse: 0.02,
                rateLimit: 50
            }
        }),
        prisma.swarmTool.create({
            data: {
                id: 'file-reader',
                name: '文件阅读器',
                icon: '📄',
                description: '读取和分析各种文件格式',
                category: 'utility',
                version: '1.0.0',
                costPerUse: 0.005,
                rateLimit: 200
            }
        }),
        prisma.swarmTool.create({
            data: {
                id: 'image-generator',
                name: '图像生成器',
                icon: '🎨',
                description: '生成和编辑图像',
                category: 'creative',
                version: '1.0.0',
                requiresAuth: true,
                costPerUse: 0.1,
                rateLimit: 20
            }
        }),
        prisma.swarmTool.create({
            data: {
                id: 'data-analyzer',
                name: '数据分析器',
                icon: '📊',
                description: '分析和可视化数据',
                category: 'analytics',
                version: '1.0.0',
                costPerUse: 0.03,
                rateLimit: 30
            }
        })
    ])

    // 3. 创建智能体
    console.log('🤖 创建智能体...')
    const agents = await Promise.all([
        prisma.swarmAIAgent.create({
            data: {
                id: 'general-assistant',
                name: '通用助手',
                avatar: '🤖',
                description: '我是一个通用的AI助手，可以帮助您处理各种任务',
                specialty: '通用助手，擅长多领域问题解答',
                personality: '友好、耐心、专业',
                systemPrompt: '你是一个友好且专业的AI助手，致力于为用户提供准确、有用的信息和建议。',
                tags: ['通用', '助手', '问答'],
                capabilityLevel: 5,
                averageResponseTime: 2000,
                costPerMessage: 0.01,
                isFeatured: true,
                usageCount: 150,
                rating: 4.8
            }
        }),
        prisma.swarmAIAgent.create({
            data: {
                id: 'code-expert',
                name: '代码专家',
                avatar: '👨‍💻',
                description: '专业的编程助手，精通多种编程语言和开发技术',
                specialty: '编程开发、代码审查、架构设计',
                personality: '严谨、细致、创新',
                systemPrompt: '你是一个经验丰富的软件工程师，专门帮助用户解决编程问题、代码优化和技术架构设计。',
                tags: ['编程', '开发', '技术'],
                capabilityLevel: 5,
                averageResponseTime: 3000,
                costPerMessage: 0.02,
                isFeatured: true,
                usageCount: 98,
                rating: 4.9
            }
        }),
        prisma.swarmAIAgent.create({
            data: {
                id: 'creative-writer',
                name: '创意作家',
                avatar: '✍️',
                description: '专业的创意写作助手，擅长各类文本创作',
                specialty: '创意写作、文案策划、故事创作',
                personality: '富有想象力、表达力强、善于启发',
                systemPrompt: '你是一位富有创意的作家，擅长各种文体的写作，能够根据用户需求创作高质量的文本内容。',
                tags: ['写作', '创意', '文案'],
            capabilityLevel: 4,
                averageResponseTime: 2500,
                costPerMessage: 0.015,
                isFeatured: true,
                usageCount: 76,
                rating: 4.7
            }
        }),
        prisma.swarmAIAgent.create({
            data: {
                id: 'data-scientist',
                name: '数据科学家',
                avatar: '📊',
                description: '专业的数据分析师，擅长数据处理和洞察分析',
                specialty: '数据分析、统计建模、可视化',
                personality: '逻辑性强、注重细节、善于发现模式',
                systemPrompt: '你是一位专业的数据科学家，精通数据分析、统计学和机器学习，能够从数据中提取有价值的洞察。',
                tags: ['数据', '分析', '统计'],
            capabilityLevel: 5,
                averageResponseTime: 3500,
                costPerMessage: 0.025,
                usageCount: 45,
                rating: 4.6
            }
        }),
        prisma.swarmAIAgent.create({
            data: {
                id: 'education-tutor',
                name: '教育导师',
                avatar: '👩‍🏫',
                description: '专业的教育助手，善于解释复杂概念',
                specialty: '教学辅导、知识解释、学习指导',
                personality: '耐心、善于启发、循循善诱',
                systemPrompt: '你是一位经验丰富的教育工作者，擅长用简单易懂的方式解释复杂概念，帮助学生更好地理解和掌握知识。',
                tags: ['教育', '辅导', '学习'],
            capabilityLevel: 4,
                averageResponseTime: 2200,
                costPerMessage: 0.012,
                usageCount: 67,
                rating: 4.8
            }
        })
    ])

    // 4. 创建智能体技能关联
    console.log('🔗 创建智能体技能关联...')
    await Promise.all([
        // 通用助手的技能
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'general-assistant',
                skillId: 'natural-language',
                isPrimary: true,
                proficiencyLevel: 5
            }
        }),
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'general-assistant',
                skillId: 'reasoning',
                isPrimary: true,
                proficiencyLevel: 4
            }
        }),
        // 代码专家的技能
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'code-expert',
                skillId: 'code-generation',
                isPrimary: true,
                proficiencyLevel: 5
            }
        }),
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'code-expert',
                skillId: 'reasoning',
                isPrimary: true,
                proficiencyLevel: 5
            }
        }),
        // 创意作家的技能
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'creative-writer',
                skillId: 'creativity',
                isPrimary: true,
                proficiencyLevel: 5
            }
        }),
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'creative-writer',
                skillId: 'creative-writing',
                isPrimary: true,
                proficiencyLevel: 5
            }
        }),
        // 数据科学家的技能
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'data-scientist',
                skillId: 'analysis',
                isPrimary: true,
                proficiencyLevel: 5
            }
        }),
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'data-scientist',
                skillId: 'reasoning',
                isPrimary: true,
                proficiencyLevel: 4
            }
        }),
        // 教育导师的技能
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'education-tutor',
                skillId: 'education',
                isPrimary: true,
                proficiencyLevel: 5
            }
        }),
        prisma.swarmAIAgentSkill.create({
            data: {
                agentId: 'education-tutor',
                skillId: 'natural-language',
                isPrimary: true,
                proficiencyLevel: 4
            }
        })
    ])

    // 5. 创建智能体工具关联
    console.log('🛠️ 创建智能体工具关联...')
    await Promise.all([
        // 通用助手的工具
        prisma.swarmAIAgentTool.create({
            data: {
                agentId: 'general-assistant',
                toolId: 'web-search-engine',
                isPrimary: true
            }
        }),
        prisma.swarmAIAgentTool.create({
            data: {
                agentId: 'general-assistant',
                toolId: 'file-reader',
                isPrimary: false
            }
        }),
        // 代码专家的工具
        prisma.swarmAIAgentTool.create({
            data: {
                agentId: 'code-expert',
                toolId: 'code-interpreter',
                isPrimary: true
            }
        }),
        prisma.swarmAIAgentTool.create({
            data: {
                agentId: 'code-expert',
                toolId: 'file-reader',
                isPrimary: true
            }
        }),
        // 创意作家的工具
        prisma.swarmAIAgentTool.create({
            data: {
                agentId: 'creative-writer',
                toolId: 'image-generator',
                isPrimary: false
            }
        }),
        // 数据科学家的工具
        prisma.swarmAIAgentTool.create({
            data: {
                agentId: 'data-scientist',
                toolId: 'data-analyzer',
                isPrimary: true
            }
        }),
        prisma.swarmAIAgentTool.create({
            data: {
                agentId: 'data-scientist',
                toolId: 'file-reader',
                isPrimary: true
                }
        }),
        // 教育导师的工具
        prisma.swarmAIAgentTool.create({
            data: {
                agentId: 'education-tutor',
                toolId: 'web-search-engine',
                isPrimary: true
            }
        })
    ])

    // 6. 创建使用示例
    console.log('📖 创建使用示例...')
    await Promise.all([
        // 通用助手示例
        prisma.swarmAIAgentUsageExample.create({
            data: {
                agentId: 'general-assistant',
                title: '日常问答',
                prompt: '请解释什么是人工智能？',
                description: '回答关于人工智能的基础问题',
                category: 'qa',
                difficultyLevel: 1,
                expectedOutput: '详细而易懂的AI概念解释',
                successRate: 0.95,
                orderIndex: 1
            }
        }),
        // 代码专家示例
        prisma.swarmAIAgentUsageExample.create({
            data: {
                agentId: 'code-expert',
                title: 'React组件开发',
                prompt: '帮我创建一个可复用的按钮组件',
                description: '创建现代化的React按钮组件',
                category: 'development',
                difficultyLevel: 2,
                expectedOutput: '完整的React组件代码和使用说明',
                successRate: 0.92,
                orderIndex: 1
            }
        }),
        // 创意作家示例
        prisma.swarmAIAgentUsageExample.create({
            data: {
                agentId: 'creative-writer',
                title: '产品文案撰写',
                prompt: '为我们的AI助手产品写一段吸引人的介绍文案',
                description: '创作产品营销文案',
                category: 'marketing',
            difficultyLevel: 2,
                expectedOutput: '富有创意且具有说服力的产品文案',
                successRate: 0.88,
                orderIndex: 1
            }
        }),
        // 数据科学家示例
        prisma.swarmAIAgentUsageExample.create({
            data: {
                agentId: 'data-scientist',
                title: '销售数据分析',
                prompt: '分析这个季度的销售数据，找出增长趋势',
                description: '分析销售数据并提供洞察',
                category: 'analytics',
                difficultyLevel: 3,
                expectedOutput: '详细的数据分析报告和可视化图表',
                successRate: 0.90,
                orderIndex: 1
            }
        }),
        // 教育导师示例
        prisma.swarmAIAgentUsageExample.create({
            data: {
                agentId: 'education-tutor',
                title: '数学概念解释',
                prompt: '请用简单的方式解释微积分的基本概念',
                description: '解释复杂的数学概念',
                category: 'education',
            difficultyLevel: 3,
                expectedOutput: '清晰易懂的概念解释和实例',
                successRate: 0.94,
                orderIndex: 1
            }
        })
    ])

    console.log('✅ 数据库种子数据填充完成！')
    console.log(`📊 创建了：`)
    console.log(`   - ${skills.length} 个技能标签`)
    console.log(`   - ${tools.length} 个工具`)
    console.log(`   - ${agents.length} 个智能体`)
    console.log(`   - 智能体技能和工具关联`)
    console.log(`   - 使用示例`)
}

main()
    .catch((e) => {
        console.error('❌ 填充种子数据时出错：', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 