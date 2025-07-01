'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CollaborationPhase,
    CollaborationMessage,
    AgentActivity,
    EnhancedTask,
    UserAction,
    CollaborationControls,
    StructuredCollaborationResult
} from '@/types/chat'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    X,
    RotateCcw,
    ThumbsUp,
    ThumbsDown,
    Lightbulb,
    Clock,
    CheckCircle,
    AlertTriangle,
    Sparkles
} from 'lucide-react'
import { useTranslation } from '@/contexts/AppContext'

interface CollaborationDisplayProps {
    phase: CollaborationPhase
    messages: CollaborationMessage[]
    agentActivities: AgentActivity[]
    tasks: EnhancedTask[]
    structuredResult?: StructuredCollaborationResult
    controls: CollaborationControls
    onUserAction: (action: UserAction) => void
    isStreaming?: boolean
}

/**
 * Collaboration Display Component
 * Provides a natural and user-friendly interface for multi-agent collaboration
 */
export function CollaborationDisplay({
    phase,
    messages,
    agentActivities,
    tasks,
    structuredResult,
    controls,
    onUserAction,
    isStreaming = false
}: CollaborationDisplayProps) {
    const { t } = useTranslation()
    const [feedback, setFeedback] = useState('')
    const [showFeedbackInput, setShowFeedbackInput] = useState(false)

    // Calculate overall progress
    const completedTasks = tasks.filter(task => task.status === 'completed').length
    const totalTasks = tasks.length
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    // Get phase display information
    const getPhaseInfo = (currentPhase: CollaborationPhase) => {
        const phaseMap = {
            idle: { label: t('collaboration.idle'), color: 'bg-gray-500', icon: '⏸️' },
            clarifying: { label: t('collaboration.clarifying'), color: 'bg-blue-500', icon: '❓' },
            planning: { label: t('collaboration.planning'), color: 'bg-yellow-500', icon: '📋' },
            executing: { label: t('collaboration.executing'), color: 'bg-green-500', icon: '⚡' },
            summarizing: { label: t('collaboration.summarizing'), color: 'bg-purple-500', icon: '📝' },
            completed: { label: t('collaboration.completed'), color: 'bg-emerald-500', icon: '✅' },
            interrupted: { label: t('collaboration.interrupted'), color: 'bg-red-500', icon: '⏹️' }
        }
        return phaseMap[currentPhase] || phaseMap.idle
    }

    const phaseInfo = getPhaseInfo(phase)

    // Handle user feedback submission
    const handleFeedbackSubmit = () => {
        if (feedback.trim()) {
            onUserAction({
                type: 'suggest',
                sessionId: 'current', // This should come from props
                suggestion: feedback,
                timestamp: new Date()
            })
            setFeedback('')
            setShowFeedbackInput(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            {/* Collaboration Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <motion.div
                            animate={{
                                scale: isStreaming ? [1, 1.1, 1] : 1,
                                rotate: isStreaming ? [0, 5, -5, 0] : 0
                            }}
                            transition={{ duration: 2, repeat: isStreaming ? Infinity : 0 }}
                            className={`w-3 h-3 rounded-full ${phaseInfo.color}`}
                        />
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                                <span>{phaseInfo.icon}</span>
                                <span>{t('collaboration.multiAgentMode')}</span>
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {phaseInfo.label} • {t('collaboration.taskProgress')}: {completedTasks}/{totalTasks}
                            </p>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center space-x-2">
                        {controls.canInterrupt && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUserAction({ type: 'interrupt', sessionId: 'current', timestamp: new Date() })}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <X className="w-4 h-4 mr-1" />
                                {t('collaboration.interrupt')}
                            </Button>
                        )}
                        {controls.canRetry && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUserAction({ type: 'retry', sessionId: 'current', timestamp: new Date() })}
                            >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                {t('collaboration.retry')}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                {totalTasks > 0 && (
                    <div className="mt-3">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {progress.toFixed(0)}% {t('collaboration.tasksCompleted')}
                        </p>
                    </div>
                )}
            </div>

            {/* Agent Activity Cards */}
            {agentActivities.length > 0 && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        {t('collaboration.agentsCollaborating')}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {agentActivities.map((agent) => (
                            <motion.div
                                key={agent.agentId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700 shadow-sm"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                        {agent.avatar || agent.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                            {agent.name}
                                        </p>
                                        <div className="flex items-center space-x-1">
                                            <Badge
                                                variant={agent.status === 'completed' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {t(`collaboration.agentStatus.${agent.status}`)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                {agent.currentTask && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                        {agent.currentTask}
                                    </p>
                                )}
                                {agent.progress !== undefined && (
                                    <Progress value={agent.progress} className="h-1 mt-2" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Collaboration Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-2"
                        >
                            <div className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 ${message.senderType === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : message.senderType === 'moderator'
                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                    }`}>
                                    <div className="flex items-center space-x-2 mb-1">
                                        <span className="text-sm font-medium">{message.sender}</span>
                                        {message.type === 'task_planning' && <Sparkles className="w-4 h-4" />}
                                        {message.isStreaming && (
                                            <motion.div
                                                animate={{ opacity: [1, 0.5, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                                className="w-2 h-2 bg-current rounded-full"
                                            />
                                        )}
                                    </div>
                                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                    {message.metadata?.confidence && (
                                        <div className="mt-2 text-xs opacity-75">
                                            置信度: {message.metadata.confidence}%
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Task Progress Section */}
            {tasks.length > 0 && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        任务进度
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-center space-x-3 text-sm">
                                <div className="flex-shrink-0">
                                    {task.status === 'completed' ? (
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : task.status === 'failed' ? (
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                    ) : task.status === 'in_progress' ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Clock className="w-4 h-4 text-blue-500" />
                                        </motion.div>
                                    ) : (
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-slate-900 dark:text-white truncate">{task.title}</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs">
                                        {task.assignedTo} • {task.priority}
                                    </p>
                                </div>
                                {task.progress !== undefined && (
                                    <div className="text-xs text-slate-500">
                                        {task.progress}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* User Feedback Section */}
            {phase === 'completed' && structuredResult && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {t('collaboration.feedback')}
                        </h4>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUserAction({ type: 'like', sessionId: 'current', timestamp: new Date() })}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                                <ThumbsUp className="w-4 h-4 mr-1" />
                                {t('collaboration.helpful')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onUserAction({ type: 'dislike', sessionId: 'current', timestamp: new Date() })}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <ThumbsDown className="w-4 h-4 mr-1" />
                                {t('collaboration.notHelpful')}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFeedbackInput(true)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                                <Lightbulb className="w-4 h-4 mr-1" />
                                {t('collaboration.suggest')}
                            </Button>
                        </div>
                    </div>

                    {showFeedbackInput && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder={t('collaboration.improvementPlaceholder')}
                                className="w-full p-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white resize-none"
                                rows={3}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowFeedbackInput(false)}
                                >
                                    {t('common.cancel')}
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleFeedbackSubmit}
                                    disabled={!feedback.trim()}
                                >
                                    {t('collaboration.submitSuggestion')}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    )
} 