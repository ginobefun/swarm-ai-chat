import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database/prisma'
import type { Prisma, SwarmAgentCategory } from '@prisma/client'

// GET: 获取 AI 智能体列表
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const featured = searchParams.get('featured')
        const search = searchParams.get('search')

        // 构建查询条件
        const where: Prisma.SwarmAIAgentWhereInput = {}

        if (category) {
            where.category = category as SwarmAgentCategory
        }

        if (featured === 'true') {
            where.averageRating = { gte: 4.0 } // 高评分作为推荐
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { longDescription: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } }
            ]
        }

        // 只获取激活的系统智能体
        where.isActive = true
        where.isSystemAgent = true

        const agents = await prisma.swarmAIAgent.findMany({
            where,
            include: {
                model: true
            },
            orderBy: [
                { averageRating: 'desc' },
                { totalTasks: 'desc' },
                { name: 'asc' }
            ]
        })

        // 转换数据格式以便前端使用
        const transformedAgents = agents.map(agent => ({
            id: agent.id,
            name: agent.name,
            avatar: agent.icon || '🤖',
            description: agent.description || '',
            longDescription: agent.longDescription || '',
            category: agent.category,
            taskTypes: agent.taskTypes,
            specializations: agent.specializations,
            tags: agent.tags,
            systemPrompt: agent.systemPrompt,
            communicationStyle: agent.communicationStyle,
            verbosity: agent.verbosity,
            approach: agent.approach,
            traits: agent.traits,
            difficulty: agent.difficulty,
            color: agent.color || '#3B82F6',
            temperature: agent.temperature ? Number(agent.temperature) : undefined,
            maxTokens: agent.maxTokens,
            functionCalling: agent.functionCalling,
            averageRating: Number(agent.averageRating),
            totalTasks: agent.totalTasks,
            totalUsageTime: agent.totalUsageTime,
            lastUsed: agent.lastUsed,
            isActive: agent.isActive,
            model: {
                id: agent.model.id,
                displayName: agent.model.displayName,
                modelName: agent.model.modelName,
                provider: agent.model.provider,
                baseUrl: agent.model.baseUrl,
                defaultTemperature: Number(agent.model.defaultTemperature),
                intelligenceScore: agent.model.intelligenceScore,
                capabilities: agent.model.capabilities,
                contextWindow: agent.model.contextWindow,
                maxOutputTokens: agent.model.maxOutputTokens,
                inputPricePerK: Number(agent.model.inputPricePerK),
                outputPricePerK: Number(agent.model.outputPricePerK),
                tier: agent.model.tier
            }
        }))

        return NextResponse.json({
            success: true,
            data: transformedAgents,
            count: transformedAgents.length
        })
    } catch (error) {
        console.error('获取 AI 智能体列表失败：', error)
        return NextResponse.json(
            {
                success: false,
                error: '获取 AI 智能体列表失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
    }
}

// POST: 创建新 AI 智能体
export async function POST(request: Request) {
    try {
        const body = await request.json()

        // 验证必要字段
        if (!body.id || !body.name || !body.modelId) {
            return NextResponse.json(
                { success: false, error: '缺少必要字段：id, name, 和 modelId' },
                { status: 400 }
            )
        }

        const agentData = {
            id: body.id,
            name: body.name,
            description: body.description,
            longDescription: body.longDescription,
            category: body.category || 'GENERAL',
            modelId: body.modelId,
            systemPrompt: body.systemPrompt,
            icon: body.icon || '🤖',
            color: body.color || '#3B82F6',
            taskTypes: body.taskTypes || [],
            specializations: body.specializations || [],
            communicationStyle: body.communicationStyle || 'FRIENDLY',
            verbosity: body.verbosity || 'BALANCED',
            approach: body.approach || 'PRACTICAL',
            traits: body.traits || [],
            difficulty: body.difficulty || 'BEGINNER',
            temperature: body.temperature,
            maxTokens: body.maxTokens,
            functionCalling: body.functionCalling || false,
            tags: body.tags || [],
            isActive: body.isActive !== false,
            isSystemAgent: false // 用户创建的不是系统智能体
        }

        const agent = await prisma.swarmAIAgent.create({
            data: agentData,
            include: {
                model: true
            }
        })

        return NextResponse.json({
            success: true,
            data: agent
        }, { status: 201 })
    } catch (error) {
        console.error('创建 AI 智能体失败：', error)
        return NextResponse.json(
            {
                success: false,
                error: '创建 AI 智能体失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
    }
}

// PUT: 更新 AI 智能体
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json(
                { success: false, error: '缺少智能体 ID' },
                { status: 400 }
            )
        }

        const agent = await prisma.swarmAIAgent.update({
            where: { id },
            data: updates,
            include: {
                model: true
            }
        })

        return NextResponse.json({
            success: true,
            data: agent
        })
    } catch (error) {
        console.error('更新 AI 智能体失败：', error)
        return NextResponse.json(
            {
                success: false,
                error: '更新 AI 智能体失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
    }
}

// DELETE: 删除 AI 智能体
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, error: '缺少智能体 ID' },
                { status: 400 }
            )
        }

        await prisma.swarmAIAgent.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: '智能体删除成功'
        })
    } catch (error) {
        console.error('删除 AI 智能体失败：', error)
        return NextResponse.json(
            {
                success: false,
                error: '删除 AI 智能体失败',
                details: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        )
    }
} 