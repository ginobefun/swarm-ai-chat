import { NextResponse } from 'next/server'
import { swarmConfigService } from '@/lib/services/SwarmConfigService'

/**
 * GET /api/config/agents/[agentId]/config - Get agent configuration for LangGraph
 */
export async function GET(
    request: Request,
    context: { params: Promise<{ agentId: string }> }
) {
    try {
        const params = await context.params
        const { agentId } = params

        console.log(`📡 API: Fetching config for agent ${agentId}...`)

        const config = await swarmConfigService.getAgentLangGraphConfig(agentId)

        if (!config) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Agent not found',
                    message: `Agent with ID ${agentId} not found`
                },
                { status: 404 }
            )
        }

        console.log(`✅ API: Returning config for agent ${agentId}`)

        return NextResponse.json({
            success: true,
            data: config
        })

    } catch (error) {
        console.error(`❌ API: Error fetching config for agent:`, error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch agent config',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
} 