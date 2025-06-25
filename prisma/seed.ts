import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('开始数据库种子操作...')

    // 创建默认用户
    const defaultUser = await prisma.user.upsert({
        where: { email: 'demo@swarm.ai' },
        update: {},
        create: {
            email: 'demo@swarm.ai',
            name: '演示用户',
            role: 'USER',
            subscriptionStatus: 'FREE'
        }
    })

    console.log(`创建用户：${defaultUser.email}`)

    // 创建技能标签
    const skills = [
        {
            id: 'analysis',
            name: '数据分析',
            category: 'CORE' as const,
            color: '#3B82F6',
            description: '擅长数据处理和分析'
        },
        {
            id: 'creativity',
            name: '创意设计',
            category: 'CORE' as const,
            color: '#F59E0B',
            description: '创意思维和设计能力'
        },
        {
            id: 'coding',
            name: '编程开发',
            category: 'TOOL' as const,
            color: '#10B981',
            description: '软件开发和编程'
        },
        {
            id: 'research',
            name: '研究调研',
            category: 'DOMAIN' as const,
            color: '#8B5CF6',
            description: '市场研究和用户调研'
        }
    ]

    for (const skill of skills) {
        await prisma.skillTag.upsert({
            where: { id: skill.id },
            update: {},
            create: skill
        })
    }

    console.log('创建技能标签完成')

    // 创建工具
    const tools = [
        {
            id: 'web-search',
            name: 'Web 搜索',
            icon: '🔍',
            category: 'research',
            description: '互联网信息搜索工具'
        },
        {
            id: 'data-viz',
            name: '数据可视化',
            icon: '📊',
            category: 'analysis',
            description: '数据图表生成工具'
        },
        {
            id: 'code-gen',
            name: '代码生成',
            icon: '💻',
            category: 'development',
            description: '代码自动生成工具'
        }
    ]

    for (const tool of tools) {
        await prisma.tool.upsert({
            where: { id: tool.id },
            update: {},
            create: tool
        })
    }

    console.log('创建工具完成')

    // 创建 AI 角色
    const agents = [
        {
            id: 'analyst',
            name: '需求分析师',
            avatar: '👨‍💼',
            avatarStyle: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            description: '专业的产品需求分析专家，擅长用户故事分析和产品规划',
            specialty: '需求分析，产品规划',
            personality: '理性、逻辑清晰、善于总结',
            systemPrompt: '你是一位专业的需求分析师，擅长分析用户需求并转化为具体的产品功能。',
            tags: ['分析', '产品', '需求'],
            capabilityLevel: 4,
            createdById: defaultUser.id
        },
        {
            id: 'researcher',
            name: '用户研究员',
            avatar: '👩‍🔬',
            avatarStyle: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            description: '专注用户行为研究和市场调研的专业人员',
            specialty: '用户研究，市场调研',
            personality: '细致、客观、数据驱动',
            systemPrompt: '你是一位用户研究专家，专注于用户行为分析和市场研究。',
            tags: ['研究', '用户', '市场'],
            capabilityLevel: 4,
            createdById: defaultUser.id
        },
        {
            id: 'evaluator',
            name: '技术评估师',
            avatar: '👨‍🔧',
            avatarStyle: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            description: '技术可行性评估和架构设计专家',
            specialty: '技术评估，架构设计',
            personality: '严谨、专业、技术导向',
            systemPrompt: '你是一位技术评估专家，专注于技术可行性分析和系统架构设计。',
            tags: ['技术', '架构', '评估'],
            capabilityLevel: 5,
            createdById: defaultUser.id
        },
        {
            id: 'creative',
            name: '创意大师',
            avatar: '🎨',
            avatarStyle: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            description: '富有创意的设计师，擅长创新思维和视觉设计',
            specialty: '创意设计，视觉传达',
            personality: '富有想象力、艺术感强、思维发散',
            systemPrompt: '你是一位创意设计专家，擅长提供创新的解决方案和视觉设计建议。',
            tags: ['创意', '设计', '视觉'],
            capabilityLevel: 4,
            createdById: defaultUser.id
        }
    ]

    for (const agent of agents) {
        await prisma.aIAgent.upsert({
            where: { id: agent.id },
            update: {},
            create: agent
        })
    }

    console.log('创建 AI 角色完成')

    // 创建技能关联
    const agentSkills = [
        { agentId: 'analyst', skillId: 'analysis', isPrimary: true, proficiencyLevel: 5 },
        { agentId: 'analyst', skillId: 'research', isPrimary: false, proficiencyLevel: 4 },
        { agentId: 'researcher', skillId: 'research', isPrimary: true, proficiencyLevel: 5 },
        { agentId: 'researcher', skillId: 'analysis', isPrimary: false, proficiencyLevel: 4 },
        { agentId: 'evaluator', skillId: 'coding', isPrimary: true, proficiencyLevel: 5 },
        { agentId: 'evaluator', skillId: 'analysis', isPrimary: false, proficiencyLevel: 4 },
        { agentId: 'creative', skillId: 'creativity', isPrimary: true, proficiencyLevel: 5 }
    ]

    for (const agentSkill of agentSkills) {
        await prisma.agentSkill.upsert({
            where: {
                agentId_skillId: {
                    agentId: agentSkill.agentId,
                    skillId: agentSkill.skillId
                }
            },
            update: {},
            create: agentSkill
        })
    }

    console.log('创建技能关联完成')

    // 创建工具关联
    const agentTools = [
        { agentId: 'researcher', toolId: 'web-search', isPrimary: true },
        { agentId: 'analyst', toolId: 'data-viz', isPrimary: true },
        { agentId: 'evaluator', toolId: 'code-gen', isPrimary: true }
    ]

    for (const agentTool of agentTools) {
        await prisma.agentTool.upsert({
            where: {
                agentId_toolId: {
                    agentId: agentTool.agentId,
                    toolId: agentTool.toolId
                }
            },
            update: {},
            create: agentTool
        })
    }

    console.log('创建工具关联完成')

    // 创建使用示例
    const examples = [
        {
            agentId: 'analyst',
            title: '用户故事分析',
            prompt: '帮我分析这个用户故事：作为一个新用户，我希望能够快速注册账户，以便开始使用产品功能',
            description: '分析用户故事的完整性和可实现性',
            category: 'analysis',
            difficultyLevel: 2,
            expectedOutput: '详细的需求分析报告，包括功能点拆解和实现建议'
        },
        {
            agentId: 'researcher',
            title: '竞品调研',
            prompt: '请帮我调研市场上类似的 AI 聊天产品，分析它们的核心功能和用户体验',
            description: '竞品分析和市场调研',
            category: 'research',
            difficultyLevel: 3,
            expectedOutput: '完整的竞品分析报告，包含功能对比和优劣势分析'
        }
    ]

    for (const example of examples) {
        await prisma.usageExample.create({
            data: example
        })
    }

    console.log('创建使用示例完成')

    console.log('数据库种子操作完成！')
}

main()
    .catch((e) => {
        console.error('种子操作失败：', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    }) 