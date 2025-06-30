import { NextResponse } from 'next/server'
import { swarmConfigService } from '@/lib/services/SwarmConfigService'

/**
 * POST /api/config/agents/[agentId]/usage - Update agent usage statistics
 */
export async function POST(
    request: Request,
    context: { params: Promise<{ agentId: string }> }
) {
    try {
        const params = await context.params
        const { agentId } = params
        const body = await request.json()
        const { usageTimeSeconds, rating } = body

        console.log(`📡 API: Updating usage for agent ${agentId}...`)

        if (typeof usageTimeSeconds !== 'number') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid request',
                    message: 'usageTimeSeconds must be a number'
                },
                { status: 400 }
            )
        }

        await swarmConfigService.updateAgentUsage(agentId, usageTimeSeconds, rating)

        console.log(`✅ API: Updated usage for agent ${agentId}`)

        return NextResponse.json({
            success: true,
            message: 'Agent usage updated successfully'
        })

    } catch (error) {
        console.error(`❌ API: Error updating usage for agent:`, error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update agent usage',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
} 