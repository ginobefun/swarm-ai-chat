import { NextRequest, NextResponse } from 'next/server'
import { AgentConfigService } from '@/lib/services/AgentConfigService'

/**
 * GET /api/agents/[agentId] - Get agent basic info (name, avatar)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ agentId: string }> }
) {
    try {
        const { agentId } = await params

        if (!agentId) {
            return NextResponse.json(
                { success: false, error: 'Agent ID is required' },
                { status: 400 }
            )
        }

        const configService = AgentConfigService.getInstance()
        const config = await configService.getAgentConfiguration(agentId)

        // Return only basic display info needed by frontend
        const agentInfo = {
            id: config.agentId,
            name: config.name,
            avatar: config.avatar || '🤖', // Use configured avatar or default
        }

        return NextResponse.json({
            success: true,
            data: agentInfo
        })

    } catch (error) {
        console.error(`❌ Error fetching agent ${(await params).agentId}:`, error)

        // Return user-friendly error for not found agents
        const errorMessage = (error as Error).message
        if (errorMessage.includes('not found') || errorMessage.includes('inactive')) {
            return NextResponse.json(
                { success: false, error: 'Agent not found' },
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