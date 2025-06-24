import { NextRequest, NextResponse } from 'next/server'
import { testConnection, isDatabaseConfigured } from '@/lib/database/connection'
import { runMigrations, checkDatabaseStatus, dropAllTables } from '@/lib/database/migrate'
import { runSeedData, getDataStats } from '@/lib/database/seed'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action')

        // 检查数据库是否配置
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        switch (action) {
            case 'status':
                const isConnected = await testConnection()
                const dbStatus = await checkDatabaseStatus()
                const stats = await getDataStats()

                return NextResponse.json({
                    success: true,
                    data: {
                        connected: isConnected,
                        tables: dbStatus.tables,
                        stats
                    }
                })

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 })
        }
    } catch (error) {
        console.error('Database API error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        // 检查数据库是否配置
        if (!isDatabaseConfigured()) {
            return NextResponse.json({
                success: false,
                error: 'DATABASE_URL environment variable is not set or configured'
            }, { status: 500 })
        }

        const { action } = await request.json()

        switch (action) {
            case 'migrate':
                await runMigrations()
                return NextResponse.json({
                    success: true,
                    message: 'Database migration completed'
                })

            case 'seed':
                await runSeedData()
                return NextResponse.json({
                    success: true,
                    message: 'Database seeding completed'
                })

            case 'setup':
                await runMigrations()
                await runSeedData()
                return NextResponse.json({
                    success: true,
                    message: 'Database setup completed'
                })

            case 'reset':
                await dropAllTables()
                await runMigrations()
                await runSeedData()
                return NextResponse.json({
                    success: true,
                    message: 'Database reset completed'
                })

            case 'drop':
                await dropAllTables()
                return NextResponse.json({
                    success: true,
                    message: 'All tables dropped'
                })

            default:
                return NextResponse.json({
                    success: false,
                    error: 'Invalid action'
                }, { status: 400 })
        }
    } catch (error) {
        console.error('Database operation error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 