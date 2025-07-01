'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    WorkspaceData,
    StructuredCollaborationResult,
    AgentActivity,
    CollaborationPhase
} from '@/types/chat'
import { Session } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
    Clock,
    CheckCircle,
    Users,
    BarChart3,
    Download,
    Eye,
    Lightbulb,
    Tag,
    Quote,
    List,
    Check,
    X,
    Sparkles
} from 'lucide-react'
import { useTranslation } from '@/contexts/AppContext'

interface EnhancedWorkspacePanelProps {
    session?: Session | null
    workspaceData?: WorkspaceData
    structuredResult?: StructuredCollaborationResult
    agentActivities?: AgentActivity[]
    isVisible?: boolean
    onClose?: () => void
    onExportMarkdown?: () => void
    onExportJson?: () => void
}

/**
 * Enhanced Workspace Panel Component
 * Provides comprehensive collaboration insights with multiple views
 */
export function EnhancedWorkspacePanel({
    session,
    workspaceData,
    structuredResult,
    agentActivities = [],
    isVisible = true,
    onClose,
    onExportMarkdown,
    onExportJson
}: EnhancedWorkspacePanelProps) {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState('overview')

    if (!isVisible) return null

    // Get phase display information
    const getPhaseInfo = (phase: CollaborationPhase) => {
        const phaseMap = {
            idle: { label: t('collaboration.idle'), color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
            clarifying: { label: t('collaboration.clarifying'), color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-800' },
            planning: { label: t('collaboration.planning'), color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-800' },
            executing: { label: t('collaboration.executing'), color: 'text-green-500', bgColor: 'bg-green-100 dark:bg-green-800' },
            summarizing: { label: t('collaboration.summarizing'), color: 'text-purple-500', bgColor: 'bg-purple-100 dark:bg-purple-800' },
            completed: { label: t('collaboration.completed'), color: 'text-emerald-500', bgColor: 'bg-emerald-100 dark:bg-emerald-800' },
            interrupted: { label: t('collaboration.interrupted'), color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-800' }
        }
        return phaseMap[phase] || phaseMap.idle
    }

    const currentPhase = workspaceData?.phase || 'idle'
    const phaseInfo = getPhaseInfo(currentPhase)

    // Calculate statistics
    const totalTasks = workspaceData?.taskList?.length || 0
    const completedTasks = workspaceData?.taskList?.filter(task => task.status === 'completed').length || 0
    const failedTasks = workspaceData?.taskList?.filter(task => task.status === 'failed').length || 0
    const inProgressTasks = workspaceData?.taskList?.filter(task => task.status === 'in_progress').length || 0

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 flex flex-col"
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {t('workspace.title')}
                    </h2>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Current Phase Indicator */}
                <div className="mt-2 flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${phaseInfo.bgColor}`} />
                    <span className={`text-sm font-medium ${phaseInfo.color}`}>
                        {phaseInfo.label}
                    </span>
                    {workspaceData?.lastUpdated && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                            • {new Date(workspaceData.lastUpdated).toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Tabs Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="mx-4 mt-4 grid w-full grid-cols-3">
                        <TabsTrigger value="overview">{t('workspace.overview')}</TabsTrigger>
                        <TabsTrigger value="results">{t('workspace.results')}</TabsTrigger>
                        <TabsTrigger value="insights">{t('workspace.insights')}</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="flex-1 overflow-y-auto p-4 space-y-4">
                        {/* Session Info */}
                        {session && (
                            <Card className="p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        {t('session.sessionInfo')}
                                    </h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">{t('session.sessionName')}:</span>
                                        <span className="text-slate-900 dark:text-white font-medium">
                                            {session.title || t('session.untitled')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">{t('session.participants')}:</span>
                                        <span className="text-slate-900 dark:text-white">
                                            {session.participants?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600 dark:text-slate-400">{t('session.messagesCount')}:</span>
                                        <span className="text-slate-900 dark:text-white">
                                            {session.messageCount || 0}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Task Progress */}
                        {totalTasks > 0 && (
                            <Card className="p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <BarChart3 className="w-5 h-5 text-green-500" />
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        {t('collaboration.taskProgress')}
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            {t('collaboration.tasksCompleted')}
                                        </span>
                                        <span className="text-slate-900 dark:text-white font-medium">
                                            {completedTasks}/{totalTasks}
                                        </span>
                                    </div>

                                    <Progress value={(completedTasks / totalTasks) * 100} className="h-2" />

                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                            <div className="font-medium text-green-700 dark:text-green-300">{completedTasks}</div>
                                            <div className="text-green-600 dark:text-green-400">已完成</div>
                                        </div>
                                        <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                            <div className="font-medium text-blue-700 dark:text-blue-300">{inProgressTasks}</div>
                                            <div className="text-blue-600 dark:text-blue-400">进行中</div>
                                        </div>
                                        <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                            <div className="font-medium text-red-700 dark:text-red-300">{failedTasks}</div>
                                            <div className="text-red-600 dark:text-red-400">失败</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Agent Status */}
                        {agentActivities.length > 0 && (
                            <Card className="p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-purple-500" />
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        智能体状态
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    {agentActivities.map((agent) => (
                                        <div key={agent.agentId} className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                                                {agent.avatar || agent.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                                    {agent.name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {t(`collaboration.agentStatus.${agent.status}`)}
                                                </p>
                                            </div>
                                            <Badge variant={agent.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                                {agent.status === 'completed' ? (
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                ) : agent.status === 'working' ? (
                                                    <Clock className="w-3 h-3 mr-1" />
                                                ) : null}
                                                {t(`collaboration.agentStatus.${agent.status}`)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Task Summary */}
                        {workspaceData?.taskSummary && (
                            <Card className="p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <Eye className="w-5 h-5 text-indigo-500" />
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        任务理解
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {workspaceData.taskSummary}
                                </p>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Results Tab */}
                    <TabsContent value="results" className="flex-1 overflow-y-auto p-4 space-y-4">
                        {structuredResult ? (
                            <>
                                {/* Export Actions */}
                                <div className="flex justify-end space-x-2">
                                    {onExportMarkdown && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onExportMarkdown}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            导出Markdown
                                        </Button>
                                    )}
                                    {onExportJson && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onExportJson}
                                        >
                                            <Download className="w-4 h-4 mr-1" />
                                            导出JSON
                                        </Button>
                                    )}
                                </div>

                                {/* Title & Summary */}
                                <Card className="p-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        {structuredResult.title}
                                    </h3>
                                    {structuredResult.confidence && (
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Badge variant="secondary">
                                                置信度: {structuredResult.confidence}%
                                            </Badge>
                                            {structuredResult.isRecommended && (
                                                <Badge variant="default">推荐</Badge>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                        {structuredResult.summary}
                                    </p>
                                </Card>

                                {/* Key Points */}
                                {structuredResult.keyPoints.length > 0 && (
                                    <Card className="p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <List className="w-5 h-5 text-blue-500" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                关键要点
                                            </h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {structuredResult.keyPoints.map((point, index) => (
                                                <li key={index} className="flex items-start space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                                        {point}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}

                                {/* Pros & Cons */}
                                {(structuredResult.pros.length > 0 || structuredResult.cons.length > 0) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Pros */}
                                        {structuredResult.pros.length > 0 && (
                                            <Card className="p-4">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <Check className="w-5 h-5 text-green-500" />
                                                    <h4 className="font-medium text-slate-900 dark:text-white">
                                                        优点
                                                    </h4>
                                                </div>
                                                <ul className="space-y-2">
                                                    {structuredResult.pros.map((pro, index) => (
                                                        <li key={index} className="flex items-start space-x-2">
                                                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                                {pro}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Card>
                                        )}

                                        {/* Cons */}
                                        {structuredResult.cons.length > 0 && (
                                            <Card className="p-4">
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <X className="w-5 h-5 text-red-500" />
                                                    <h4 className="font-medium text-slate-900 dark:text-white">
                                                        缺点
                                                    </h4>
                                                </div>
                                                <ul className="space-y-2">
                                                    {structuredResult.cons.map((con, index) => (
                                                        <li key={index} className="flex items-start space-x-2">
                                                            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                                {con}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Card>
                                        )}
                                    </div>
                                )}

                                {/* Action Items */}
                                {structuredResult.actionItems.length > 0 && (
                                    <Card className="p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <CheckCircle className="w-5 h-5 text-indigo-500" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                行动建议
                                            </h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {structuredResult.actionItems.map((item, index) => (
                                                <li key={index} className="flex items-start space-x-2">
                                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                                        {item}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}

                                {/* Quotes */}
                                {structuredResult.quotes.length > 0 && (
                                    <Card className="p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Quote className="w-5 h-5 text-purple-500" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                重要引用
                                            </h4>
                                        </div>
                                        <div className="space-y-3">
                                            {structuredResult.quotes.map((quote, index) => (
                                                <blockquote key={index} className="border-l-4 border-purple-300 pl-4 italic text-sm text-slate-600 dark:text-slate-400">
                                                    &ldquo;{quote}&rdquo;
                                                </blockquote>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                                <Download className="w-12 h-12 mb-4" />
                                <p className="text-center">
                                    暂无协作结果<br />
                                    <span className="text-xs">完成协作后这里将显示结构化结果</span>
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Insights Tab */}
                    <TabsContent value="insights" className="flex-1 overflow-y-auto p-4 space-y-4">
                        {structuredResult ? (
                            <>
                                {/* Critical Thoughts */}
                                {structuredResult.criticalThoughts.length > 0 && (
                                    <Card className="p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Lightbulb className="w-5 h-5 text-yellow-500" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                批判性思考
                                            </h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {structuredResult.criticalThoughts.map((thought, index) => (
                                                <li key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                                                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                                                        {thought}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}

                                {/* Tags */}
                                {structuredResult.tags && structuredResult.tags.length > 0 && (
                                    <Card className="p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Tag className="w-5 h-5 text-indigo-500" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                标签
                                            </h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {structuredResult.tags.map((tag, index) => (
                                                <Badge key={index} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {/* Metadata */}
                                {structuredResult.metadata && (
                                    <Card className="p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <BarChart3 className="w-5 h-5 text-gray-500" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                元数据分析
                                            </h4>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">分析类型:</span>
                                                <span className="text-slate-900 dark:text-white">
                                                    {structuredResult.metadata.analysisType}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">复杂度:</span>
                                                <Badge variant={
                                                    structuredResult.metadata.complexity === 'complex' ? 'destructive' :
                                                        structuredResult.metadata.complexity === 'medium' ? 'secondary' : 'default'
                                                }>
                                                    {structuredResult.metadata.complexity}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">处理时间:</span>
                                                <span className="text-slate-900 dark:text-white">
                                                    {structuredResult.metadata.processingTime}秒
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-600 dark:text-slate-400">参与智能体:</span>
                                                <span className="text-slate-900 dark:text-white">
                                                    {structuredResult.metadata.agentsInvolved.length}个
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* References */}
                                {structuredResult.references && structuredResult.references.length > 0 && (
                                    <Card className="p-4">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Download className="w-5 h-5 text-green-500" />
                                            <h4 className="font-medium text-slate-900 dark:text-white">
                                                参考资料
                                            </h4>
                                        </div>
                                        <ul className="space-y-2">
                                            {structuredResult.references.map((ref, index) => (
                                                <li key={index} className="text-sm">
                                                    <span className="text-slate-600 dark:text-slate-400">{index + 1}. </span>
                                                    <span className="text-slate-900 dark:text-white">{ref}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </Card>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400">
                                <Lightbulb className="w-12 h-12 mb-4" />
                                <p className="text-center">
                                    暂无深度洞察<br />
                                    <span className="text-xs">智能体分析完成后这里将显示深度见解</span>
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </motion.div>
    )
} 