import { NextRequest, NextResponse } from 'next/server'
import { AgentConfigService } from '@/lib/services/AgentConfigService'

/**
 * POST /api/agents/batch - Get multiple agents info in batch
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { agentIds } = body

        if (!Array.isArray(agentIds) || agentIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'agentIds array is required' },
                { status: 400 }
            )
        }

        // Validate agentIds are strings
        if (!agentIds.every(id => typeof id === 'string')) {
            return NextResponse.json(
                { success: false, error: 'All agentIds must be strings' },
                { status: 400 }
            )
        }

        const configService = AgentConfigService.getInstance()
        const configs = await configService.getBatchAgentConfigurations(agentIds)

        // Convert to display info format
        const agentInfos: Record<string, { id: string; name: string; avatar: string }> = {}

        for (const [agentId, config] of configs.entries()) {
            agentInfos[agentId] = {
                id: config.agentId,
                name: config.name,
                avatar: config.avatar || '🤖' // Use configured avatar or default
            }
        }

        return NextResponse.json({
            success: true,
            data: agentInfos,
            count: Object.keys(agentInfos).length
        })

    } catch (error) {
        console.error('❌ Error in batch agent fetch:', error)

        const errorMessage = (error as Error).message
        if (errorMessage.includes('not found') || errorMessage.includes('inactive')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Some agents not found',
                    message: errorMessage
                },
                { status: 404 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch agent information',
                message: errorMessage
            },
            { status: 500 }
        )
    }
} 