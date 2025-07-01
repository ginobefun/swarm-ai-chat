'use client'

/**
 * Configuration Initializer Component
 * 
 * This component is responsible for initializing the SwarmAI configuration
 * when the application loads. It ensures all models and agents are properly
 * registered before the user can interact with the system.
 */

import { useEffect, useState } from 'react'
import { databaseConfigAdapter } from '@/lib/services/DatabaseConfigAdapter'
import type { DatabaseInitializationResult } from '@/lib/services/DatabaseConfigAdapter'

interface ConfigInitializerProps {
    children: React.ReactNode
}

interface LoadingState {
    isLoading: boolean
    isError: boolean
    result: DatabaseInitializationResult | null
    retryCount: number
}

export function ConfigInitializer({ children }: ConfigInitializerProps) {
    const [state, setState] = useState<LoadingState>({
        isLoading: true,
        isError: false,
        result: null,
        retryCount: 0
    })

    const initializeConfig = async () => {
        try {
            console.log('🚀 Initializing SwarmAI database configuration...')
            const result = await databaseConfigAdapter.initialize()

            setState(prev => ({
                ...prev,
                isLoading: false,
                isError: !result.success,
                result
            }))

            if (result.success) {
                console.log('✅ SwarmAI database configuration initialized successfully:', {
                    models: result.modelsLoaded,
                    agents: result.agentsLoaded,
                    warnings: result.warnings.length
                })
            } else {
                console.error('❌ SwarmAI database configuration initialization failed:', {
                    errors: result.errors,
                    warnings: result.warnings
                })
            }
        } catch (error) {
            console.error('💥 Fatal error during database configuration initialization:', error)
            setState(prev => ({
                ...prev,
                isLoading: false,
                isError: true,
                result: {
                    success: false,
                    modelsLoaded: 0,
                    agentsLoaded: 0,
                    errors: [error instanceof Error ? error.message : 'Unknown database initialization error'],
                    warnings: []
                }
            }))
        }
    }

    useEffect(() => {
        initializeConfig()
    }, [])

    const handleRetry = async () => {
        setState(prev => ({
            ...prev,
            isLoading: true,
            isError: false,
            retryCount: prev.retryCount + 1
        }))
        await initializeConfig()
    }

    // Show loading state
    if (state.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">
                            正在从数据库加载 SwarmAI 配置...
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            正在从数据库加载AI模型和智能体配置，请稍候
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Show error state with retry option
    if (state.isError && state.result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <div className="max-w-md text-center space-y-6">
                    <div className="space-y-2">
                        <div className="text-destructive text-4xl">⚠️</div>
                        <h2 className="text-xl font-semibold text-foreground">
                            数据库配置加载失败
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            SwarmAI 无法从数据库加载AI模型和智能体配置，应用可能无法正常工作
                        </p>
                    </div>

                    {/* Error details */}
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-left">
                        <h3 className="font-medium text-destructive mb-2">错误详情：</h3>
                        <div className="space-y-1 text-sm">
                            {state.result.errors.map((error, index) => (
                                <div key={index} className="text-destructive/80">
                                    • {error}
                                </div>
                            ))}
                        </div>

                        {/* Show partial loading info */}
                        <div className="mt-3 pt-3 border-t border-destructive/20">
                            <div className="text-xs text-muted-foreground">
                                已加载: {state.result.modelsLoaded} 个模型, {state.result.agentsLoaded} 个智能体
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleRetry}
                            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium transition-colors"
                        >
                            重试数据库连接 {state.retryCount > 0 && `(${state.retryCount})`}
                        </button>

                        <button
                            onClick={() => {
                                setState(prev => ({ ...prev, isError: false }))
                            }}
                            className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors"
                        >
                            继续使用
                        </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        如果问题持续出现，请检查网络连接或联系技术支持
                    </p>
                </div>
            </div>
        )
    }

    // Show success state with warnings (if any)
    if (state.result?.success && state.result.warnings.length > 0) {
        console.warn('⚠️ Configuration initialized with warnings:', state.result.warnings)
    }

    // Configuration successful, render children
    return <>{children}</>
} 