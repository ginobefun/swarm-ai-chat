import { NextResponse } from 'next/server'
import { swarmConfigService } from '@/lib/services/SwarmConfigService'

/**
 * GET /api/config/agents/featured - Get featured/recommended agents
 */
export async function GET() {
    try {
        console.log('📡 API: Fetching featured agents from database...')

        const agents = await swarmConfigService.getFeaturedAgents()

        // Transform to frontend-friendly format
        const transformedAgents = agents.map(agent => ({
            id: agent.id,
            name: agent.name,
            avatar: agent.icon || '🤖',
            description: agent.description || '',
            category: agent.category,
            modelName: agent.model.modelName,
            systemPrompt: agent.systemPrompt,
            icon: agent.icon || '🤖',
            color: agent.color || '#3B82F6',
            temperature: agent.temperature ? Number(agent.temperature) : Number(agent.model.defaultTemperature),
            maxTokens: agent.maxTokens || agent.model.maxOutputTokens,
            functionCalling: agent.functionCalling,
            tags: agent.tags,
            specializations: agent.specializations,
            difficulty: agent.difficulty,
            traits: agent.traits
        }))

        console.log(`✅ API: Returning ${transformedAgents.length} featured agents`)

        return NextResponse.json({
            success: true,
            data: transformedAgents,
            count: transformedAgents.length
        })

    } catch (error) {
        console.error('❌ API: Error fetching featured agents:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch featured agents',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
} 