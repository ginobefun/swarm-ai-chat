import { NextResponse } from 'next/server'
import { swarmConfigService } from '@/lib/services/SwarmConfigService'

/**
 * GET /api/config/models - Get all active models
 */
export async function GET() {
    try {
        console.log('📡 API: Fetching active models from database...')

        const models = await swarmConfigService.getActiveModels()

        // Transform to frontend-friendly format
        const transformedModels = models.map(model => ({
            id: model.id,
            name: model.modelName,
            displayName: model.displayName || model.modelName,
            provider: model.provider,
            baseUrl: model.baseUrl,
            defaultTemperature: Number(model.defaultTemperature),
            maxInputTokens: model.contextWindow,
            maxOutputTokens: model.maxOutputTokens,
            intelligenceScore: model.intelligenceScore,
            capabilities: model.capabilities,
            pricing: {
                inputCostPer1k: Number(model.inputPricePerK),
                outputCostPer1k: Number(model.outputPricePerK)
            },
            isActive: model.isActive,
            isSystemModel: model.isSystemModel
        }))

        console.log(`✅ API: Returning ${transformedModels.length} models`)

        return NextResponse.json({
            success: true,
            data: transformedModels,
            count: transformedModels.length
        })

    } catch (error) {
        console.error('❌ API: Error fetching models:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch models',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
} 