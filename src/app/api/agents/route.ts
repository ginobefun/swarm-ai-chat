import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import type { Prisma } from '@prisma/client'

// GET: 获取AI角色列表
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const featured = searchParams.get('featured')
        const search = searchParams.get('search')

        // 构建查询条件
        const where: Prisma.AIAgentWhereInput = {}

        if (category) {
            where.tags = { has: category }
        }

        if (featured === 'true') {
            where.isFeatured = true
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { specialty: { contains: search, mode: 'insensitive' } }
            ]
        }

        // 只获取激活的公开角色
        where.isActive = true
        where.isPublic = true

        const agents = await prisma.aIAgent.findMany({
            where,
            include: {
                agentSkills: {
                    include: {
                        skill: true
                    }
                },
                agentTools: {
                    include: {
                        tool: true
                    }
                },
                usageExamples: {
                    orderBy: { orderIndex: 'asc' }
                }
            },
            orderBy: [
                { isFeatured: 'desc' },
                { rating: 'desc' },
                { usageCount: 'desc' }
            ]
        })

        // 转换数据格式以便前端使用
        const transformedAgents = agents.map(agent => ({
            id: agent.id,
            name: agent.name,
            avatar: agent.avatar,
            avatarStyle: agent.avatarStyle,
            description: agent.description,
            specialty: agent.specialty,
            personality: agent.personality,
            tags: agent.tags,
            capabilityLevel: agent.capabilityLevel,
            averageResponseTime: agent.averageResponseTime,
            rating: Number(agent.rating),
            usageCount: agent.usageCount,
            isFeatured: agent.isFeatured,
            skills: agent.agentSkills.map(as => ({
                id: as.skill.id,
                name: as.skill.name,
                category: as.skill.category.toLowerCase(),
                color: as.skill.color,
                isPrimary: as.isPrimary,
                proficiencyLevel: as.proficiencyLevel
            })),
            tools: agent.agentTools.filter(at => at.isEnabled).map(at => ({
                id: at.tool.id,
                name: at.tool.name,
                icon: at.tool.icon,
                category: at.tool.category,
                isPrimary: at.isPrimary
            })),
            examples: agent.usageExamples.map(ex => ({
                id: ex.id,
                title: ex.title,
                prompt: ex.prompt,
                description: ex.description,
                category: ex.category,
                difficultyLevel: ex.difficultyLevel
            }))
        }))

        return NextResponse.json({
            success: true,
            data: transformedAgents,
            count: transformedAgents.length
        })
    } catch (error) {
        console.error('获取AI角色列表失败:', error)
        return NextResponse.json(
            {
                success: false,
                error: '获取AI角色列表失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
    }
}

// POST: 创建新AI角色
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 验证必要字段
        if (!body.id || !body.name) {
            return NextResponse.json(
                { success: false, error: '缺少必要字段：id和name' },
                { status: 400 }
            )
        }

        const agentData = {
            id: body.id,
            name: body.name,
            avatar: body.avatar,
            avatarStyle: body.avatarStyle,
            description: body.description,
            specialty: body.specialty,
            personality: body.personality,
            modelPreference: body.modelPreference || 'gpt-4',
            systemPrompt: body.systemPrompt,
            tags: body.tags || [],
            capabilityLevel: body.capabilityLevel || 1,
            averageResponseTime: body.averageResponseTime || 3000,
            costPerMessage: body.costPerMessage || 0,
            isActive: body.isActive !== false,
            isPublic: body.isPublic !== false,
            isFeatured: body.isFeatured || false,
            createdById: body.createdById,
            version: body.version || '1.0.0'
        }

        const agent = await prisma.aIAgent.create({
            data: agentData,
            include: {
                agentSkills: {
                    include: {
                        skill: true
                    }
                },
                agentTools: {
                    include: {
                        tool: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: agent
        }, { status: 201 })
    } catch (error) {
        console.error('创建AI角色失败:', error)
        return NextResponse.json(
            {
                success: false,
                error: '创建AI角色失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
    }
}

// PUT: 更新AI角色
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: '缺少角色ID' },
                { status: 400 }
            )
        }

        const agent = await prisma.aIAgent.update({
            where: { id },
            data: updates,
            include: {
                agentSkills: {
                    include: {
                        skill: true
                    }
                },
                agentTools: {
                    include: {
                        tool: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            data: agent
        })
    } catch (error) {
        console.error('更新AI角色失败:', error)
        return NextResponse.json(
            {
                success: false,
                error: '更新AI角色失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
    }
} 