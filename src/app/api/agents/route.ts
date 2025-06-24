import { NextRequest, NextResponse } from 'next/server'
import { getAllAgents, searchAgents } from '@/lib/database/operations'
import { isDatabaseConfigured } from '@/lib/database/connection'

export async function GET(request: NextRequest) {
    try {
        // 检查数据库是否配置
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')

        let agents
        if (query) {
            agents = await searchAgents(query)
        } else {
            agents = await getAllAgents()
        }

        return NextResponse.json({
            success: true,
            agents: agents,
            count: agents.length
        })
    } catch (error) {
        console.error('Error fetching agents:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch agents'
        }, { status: 500 })
    }
} 