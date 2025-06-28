'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Session, Message } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import AddAgentDialog from './AddAgentDialog'
import ChatSettingsDialog from './ChatSettingsDialog'
import { useSession } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { useChat } from '@ai-sdk/react'
import type { GraphEvent, Task } from '@/lib/orchestrator/types'
import {
    Plus,
    Settings,
    MessageCircle,
    CheckCircle2,
    Clock,
    AlertCircle,
    Sparkles,
    Users,
    Bot
} from 'lucide-react'

interface ChatAreaProps {
    session: Session | null
    onSessionUpdate?: (sessionId: string, updates: Partial<Session>) => void
}

// Orchestrator response interface
interface OrchestratorResponse {
    success: boolean
    turnIndex: number
    shouldClarify?: boolean
    clarificationQuestion?: string
    summary?: string
    events: GraphEvent[]
    tasks: Task[]
    results: Array<{
        taskId: string
        agentId: string
        content: string
    }>
    costUSD: number
}

/**
 * ChatArea component - Main chat interface with multi-agent coordination
 * 
 * Features:
 * - Automatic mode detection (single-agent vs multi-agent)
 * - Traditional streaming chat for single agents
 * - LangGraph coordination for multi-agent sessions
 * - Real-time task tracking and results display
 * - Integrated workspace for collaboration results
 * - Seamless switching between modes
 */
const ChatArea: React.FC<ChatAreaProps> = ({
    session,
    onSessionUpdate
}) => {
    const { t } = useTranslation()

    // Get user authentication state
    const { data: sessionData } = useSession()
    const user = sessionData?.user
    const currentUserId = user?.id

    // Dialog states
    const [showAddAgentDialog, setShowAddAgentDialog] = useState(false)
    const [showSettingsDialog, setShowSettingsDialog] = useState(false)

    // Multi-agent coordination states
    const [isProcessing, setIsProcessing] = useState(false)
    const [orchestratorResponse, setOrchestratorResponse] = useState<OrchestratorResponse | null>(null)
    const [confirmedIntent, setConfirmedIntent] = useState<string>('')
    type ActiveTabType = 'chat' | 'tasks' | 'results'
    const [activeTab, setActiveTab] = useState<ActiveTabType>('chat')

    // Determine if this is a multi-agent session
    const agentParticipants = session?.participants?.filter(p => p.type === 'agent') || []
    const isMultiAgentMode = agentParticipants.length > 1

    // Get agent information functions
    const getAgentName = useCallback((agentId: string): string => {
        const agentNames: Record<string, string> = {
            'gemini-flash': 'Gemini Flash',
            'article-summarizer': '文章摘要师',
            'critical-thinker': '批判性思考者',
            'creative-writer': '创意作家',
            'data-scientist': '数据科学家',
            'code-expert': '代码专家'
        }
        return agentNames[agentId] || 'AI Assistant'
    }, [])

    const getAgentAvatar = useCallback((agentId: string): string => {
        const agentAvatars: Record<string, string> = {
            'gemini-flash': '⚡',
            'article-summarizer': '📝',
            'critical-thinker': '🤔',
            'creative-writer': '✍️',
            'data-scientist': '📊',
            'code-expert': '💻'
        }
        return agentAvatars[agentId] || '🤖'
    }, [])

    // Traditional single-agent chat using Vercel AI SDK
    const {
        messages,
        isLoading: isSingleAgentLoading,
        error: singleAgentError,
        setMessages,
        append
    } = useChat({
        api: '/api/chat',
        body: {
            sessionId: session?.id,
            userId: currentUserId,
            agentId: session?.primaryAgentId || 'gemini-flash'
        },
        onError: (error) => {
            console.error('🔴 Frontend Chat error:', error)
        },
        onFinish: (message) => {
            console.log('✅ Frontend - AI response finished:', message)
            if (session && onSessionUpdate) {
                onSessionUpdate(session.id, {
                    messageCount: (session.messageCount || 0) + 2
                })
            }
        }
    })

    // Multi-agent coordination functions
    const handleOrchestratorMessage = async (message: string) => {
        if (!session || !message.trim() || !currentUserId || isProcessing) return

        console.log('🚀 Starting orchestrator message:', {
            sessionId: session.id,
            userId: currentUserId,
            messageLength: message.length,
            confirmedIntent: confirmedIntent || 'none',
            sessionCreatedBy: session.createdById,
            isMultiAgentMode,
            agentCount: agentParticipants.length
        })

        setIsProcessing(true)
        try {
            const requestBody = {
                message,
                userId: currentUserId,
                confirmedIntent: confirmedIntent || undefined
            }

            console.log('📤 Sending request to dispatch API:', {
                url: `/api/chat/${session.id}/dispatch`,
                method: 'POST',
                body: requestBody
            })

            const response = await fetch(`/api/chat/${session.id}/dispatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })

            console.log('📥 Received response:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            })

            if (!response.ok) {
                const errorText = await response.text()
                console.error('❌ API Response Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorBody: errorText,
                    requestBody
                })

                let errorMessage = 'Failed to send message'
                try {
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.error || errorMessage
                    console.error('❌ Parsed error data:', errorData)
                } catch {
                    console.error('❌ Could not parse error response as JSON:', errorText)
                }

                throw new Error(`${errorMessage} (Status: ${response.status})`)
            }

            const data: OrchestratorResponse = await response.json()
            console.log('✅ Orchestrator response received:', {
                success: data.success,
                turnIndex: data.turnIndex,
                shouldClarify: data.shouldClarify,
                tasksCount: data.tasks?.length || 0,
                resultsCount: data.results?.length || 0,
                eventsCount: data.events?.length || 0,
                costUSD: data.costUSD
            })

            setOrchestratorResponse(data)

            // Clear confirmed intent after successful send
            setConfirmedIntent('')

            // Auto-switch to appropriate tab based on response
            if (data.tasks && data.tasks.length > 0) {
                console.log('🔄 Auto-switching to tasks tab')
                setActiveTab('tasks')
            } else if (data.results && data.results.length > 0) {
                console.log('🔄 Auto-switching to results tab')
                setActiveTab('results')
            }

        } catch (error) {
            console.error('❌ Error in orchestrator message:', {
                error: error instanceof Error ? error.message : error,
                stack: error instanceof Error ? error.stack : undefined,
                sessionId: session.id,
                userId: currentUserId
            })

            // Show user-friendly error message
            alert(`协作请求失败：${error instanceof Error ? error.message : '未知错误'}`)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCancelFlow = async () => {
        if (!session || !currentUserId) return

        try {
            await fetch(`/api/chat/${session.id}/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'cancel',
                    userId: currentUserId
                })
            })
        } catch (error) {
            console.error('Error cancelling flow:', error)
        }
    }

    // Handle message sending based on mode
    const handleSendMessage = async (message: string) => {
        if (isMultiAgentMode) {
            await handleOrchestratorMessage(message)
        } else {
            // Traditional single-agent chat
            await append({
                role: 'user',
                content: message
            })
        }
    }

    // Load existing messages when session changes (for single-agent mode)
    useEffect(() => {
        if (isMultiAgentMode) return // Skip for multi-agent mode

        const loadSessionMessages = async () => {
            if (!session?.id) return

            try {
                const response = await fetch(`/api/sessions/${session.id}/messages`)
                if (response.ok) {
                    const responseData = await response.json()
                    const sessionMessages = responseData.data || responseData

                    const formattedMessages = sessionMessages.map((msg: {
                        id: string
                        senderType: string
                        content: string
                        createdAt: string
                    }) => ({
                        id: msg.id,
                        role: msg.senderType === 'user' ? 'user' : 'assistant',
                        content: msg.content,
                        createdAt: new Date(msg.createdAt)
                    }))

                    setMessages(formattedMessages)
                }
            } catch (error) {
                console.error('Error loading session messages:', error)
            }
        }

        loadSessionMessages()
    }, [session?.id, setMessages, isMultiAgentMode])

    // Handle adding agent to session
    const handleAddAgent = async (agentId: string) => {
        if (!session || !onSessionUpdate) return

        const currentParticipants = session.participants || []

        if (currentParticipants.some(p => p.id === agentId)) {
            console.log('Agent already added to session')
            return
        }

        const newParticipant = {
            id: agentId,
            name: getAgentName(agentId),
            avatar: getAgentAvatar(agentId),
            type: 'agent' as const
        }

        const updatedParticipants = [...currentParticipants, newParticipant]

        onSessionUpdate(session.id, {
            participants: updatedParticipants
        })

        console.log(`Added agent ${agentId} to session ${session.id}`)
    }

    // Render functions for orchestrator UI
    const renderEvent = (event: GraphEvent) => {
        const icons = {
            ask_user: <MessageCircle className="w-4 h-4" />,
            tasks_created: <Sparkles className="w-4 h-4" />,
            task_start: <Clock className="w-4 h-4" />,
            agent_reply: <MessageCircle className="w-4 h-4" />,
            task_done: <CheckCircle2 className="w-4 h-4" />,
            summary: <Sparkles className="w-4 h-4" />,
            flow_cancelled: <AlertCircle className="w-4 h-4" />,
            system: <AlertCircle className="w-4 h-4" />
        }

        return (
            <div key={event.id} className="flex items-start gap-3 p-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div className="text-muted-foreground">
                    {icons[event.type]}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium capitalize">
                            {event.type.replace('_', ' ')}
                        </span>
                        {event.agentId && (
                            <Badge variant="secondary" className="text-xs">
                                {getAgentName(event.agentId)}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                    </div>
                    {event.content && (
                        <p className="text-sm text-muted-foreground">
                            {event.content}
                        </p>
                    )}
                </div>
            </div>
        )
    }

    const renderTask = (task: Task) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
            in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
        }

        return (
            <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge className={statusColors[task.status]}>
                        {task.status.replace('_', ' ')}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                    {task.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Assigned to: {getAgentName(task.assignedTo)}</span>
                    <span>•</span>
                    <span>Priority: {task.priority}</span>
                </div>
            </Card>
        )
    }

    // Convert messages for display (single-agent mode)
    const displayMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === 'user' ? 'You' : getAgentName(session?.primaryAgentId || 'gemini-flash'),
        senderType: msg.role === 'user' ? 'user' : 'ai',
        timestamp: msg.createdAt || new Date(),
        avatar: msg.role === 'user' ? 'You' : getAgentAvatar(session?.primaryAgentId || 'gemini-flash'),
        avatarStyle: undefined
    }))

    // Determine loading state and error based on mode
    const isLoading = isMultiAgentMode ? isProcessing : isSingleAgentLoading
    const error = isMultiAgentMode ? null : singleAgentError

    if (!session) {
        return null
    }

    return (
        <main className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            {/* Chat Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Mode Indicator */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-base sm:text-lg font-medium shadow-md flex-shrink-0">
                        {isMultiAgentMode ? <Users className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {session.title}
                            </h1>
                            {isMultiAgentMode && (
                                <Badge variant="secondary" className="text-xs">
                                    协作模式
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {isMultiAgentMode
                                ? `${agentParticipants.length} 个智能体协作`
                                : `${getAgentName(session?.primaryAgentId || 'gemini-flash')} · ${messages.length || 0} ${t('chat.messages')}`
                            }
                            {orchestratorResponse && (
                                <span className="ml-2">• Turn #{orchestratorResponse.turnIndex}</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hidden sm:flex"
                            title={t('chat.addMember')}
                            onClick={() => setShowAddAgentDialog(true)}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </motion.div>
                    {isMultiAgentMode && isProcessing && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 px-3 text-xs"
                                onClick={handleCancelFlow}
                            >
                                取消
                            </Button>
                        </motion.div>
                    )}
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title={t('chat.settings')}
                            onClick={() => setShowSettingsDialog(true)}
                        >
                            <Settings className="w-4 h-4" />
                        </Button>
                    </motion.div>
                </div>
            </header>

            {/* Error Banner */}
            {error && (
                <div className="flex-shrink-0 mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                        <span className="text-red-500">⚠️</span>
                        {error.message || 'Something went wrong. Please try again.'}
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {isMultiAgentMode ? (
                    /* Multi-Agent Coordination Interface */
                    <>
                        {/* Tabs for different views */}
                        <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ActiveTabType)} className="w-full">
                                <TabsList className="grid grid-cols-3 mx-4 my-2">
                                    <TabsTrigger value="chat" className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4" />
                                        对话
                                    </TabsTrigger>
                                    <TabsTrigger value="tasks" className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        任务
                                        {orchestratorResponse?.tasks.length ? (
                                            <Badge variant="secondary" className="ml-1 text-xs">
                                                {orchestratorResponse.tasks.length}
                                            </Badge>
                                        ) : null}
                                    </TabsTrigger>
                                    <TabsTrigger value="results" className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        结果
                                        {orchestratorResponse?.results.length ? (
                                            <Badge variant="secondary" className="ml-1 text-xs">
                                                {orchestratorResponse.results.length}
                                            </Badge>
                                        ) : null}
                                    </TabsTrigger>
                                </TabsList>

                                {/* Chat Events Tab */}
                                <TabsContent value="chat" className="flex-1 overflow-y-auto">
                                    <div className="p-4 space-y-3">
                                        {orchestratorResponse?.events.map(renderEvent)}
                                        {!orchestratorResponse && (
                                            <div className="text-center text-muted-foreground py-8">
                                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>发送消息开始多智能体协作</p>
                                                <p className="text-sm mt-1">
                                                    系统会自动分析任务并分配给合适的智能体
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Tasks Tab */}
                                <TabsContent value="tasks" className="flex-1 overflow-y-auto">
                                    <div className="p-4 space-y-3">
                                        {orchestratorResponse?.tasks.map(renderTask)}
                                        {!orchestratorResponse?.tasks.length && (
                                            <div className="text-center text-muted-foreground py-8">
                                                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>暂无任务</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                {/* Results Tab */}
                                <TabsContent value="results" className="flex-1 overflow-y-auto">
                                    <div className="p-4 space-y-4">
                                        {orchestratorResponse?.results.map((result) => (
                                            <Card key={result.taskId} className="p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Badge variant="secondary">{getAgentName(result.agentId)}</Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        Task: {result.taskId}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap">{result.content}</p>
                                            </Card>
                                        ))}
                                        {!orchestratorResponse?.results.length && (
                                            <div className="text-center text-muted-foreground py-8">
                                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                <p>暂无结果</p>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Clarification Section */}
                        {orchestratorResponse?.shouldClarify && (
                            <div className="flex-shrink-0 p-4 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800/50">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                                    需要澄清：
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                                    {orchestratorResponse.clarificationQuestion}
                                </p>
                                <input
                                    type="text"
                                    value={confirmedIntent}
                                    onChange={(e) => setConfirmedIntent(e.target.value)}
                                    placeholder="请回复..."
                                    className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && confirmedIntent.trim()) {
                                            handleOrchestratorMessage(confirmedIntent)
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Summary Section */}
                        {orchestratorResponse?.summary && (
                            <div className="flex-shrink-0 p-4 bg-green-50 dark:bg-green-950/20 border-t border-green-200 dark:border-green-800/50">
                                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                    协作总结：
                                </p>
                                <p className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                                    {orchestratorResponse.summary}
                                </p>
                                {orchestratorResponse.costUSD > 0 && (
                                    <p className="text-xs text-green-600 dark:text-green-500 mt-2">
                                        本次协作成本：${orchestratorResponse.costUSD.toFixed(4)}
                                    </p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    /* Single-Agent Traditional Chat */
                    <div className="flex-1 overflow-hidden">
                        <MessageList
                            messages={displayMessages}
                            isTyping={isSingleAgentLoading}
                            typingUser={getAgentName(session?.primaryAgentId || 'gemini-flash')}
                            typingAvatar={getAgentAvatar(session?.primaryAgentId || 'gemini-flash')}
                        />
                    </div>
                )}

                {/* Message Input */}
                <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        mentionItems={agentParticipants.map(p => ({
                            id: p.id,
                            name: p.name,
                            avatar: p.avatar || '🤖',
                            type: 'agent' as const
                        }))}
                        disabled={isLoading || !currentUserId}
                        placeholder={
                            !currentUserId ? t('chat.loginToSendMessage') :
                                isLoading ? (isMultiAgentMode ? '智能体协作中...' : t('chat.aiThinking')) :
                                    orchestratorResponse?.shouldClarify ? "回复上方的澄清问题..." :
                                        isMultiAgentMode ? "描述你的任务，我们的智能体团队会协作完成..." :
                                            t('chat.inputPlaceholder')
                        }
                    />
                </div>
            </div>

            {/* Dialogs */}
            <AddAgentDialog
                isOpen={showAddAgentDialog}
                onClose={() => setShowAddAgentDialog(false)}
                onAddAgent={handleAddAgent}
                currentAgentIds={agentParticipants.map(p => p.id)}
            />

            <ChatSettingsDialog
                isOpen={showSettingsDialog}
                onClose={() => setShowSettingsDialog(false)}
                session={session}
                onUpdateSession={onSessionUpdate}
                onDeleteSession={(sessionId) => {
                    console.log('Delete session:', sessionId)
                }}
            />
        </main>
    )
}

export default ChatArea 