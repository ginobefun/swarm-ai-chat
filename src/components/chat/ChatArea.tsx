'use client'

import React, { useEffect, useCallback, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Session, Message } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import { useSession } from '@/components/providers/AuthProvider'
import AddAgentDialog from './AddAgentDialog'
import ChatSettingsDialog from './ChatSettingsDialog'

import WorkspacePanel from '@/components/workspace/WorkspacePanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChat } from '@ai-sdk/react'
import {
    Plus,
    Settings,
    Users,
    Bot,
    RefreshCw,
    AlertCircle,
    StopCircle
} from 'lucide-react'
import { useAgentInfo, AgentInfo } from '@/hooks/useAgentInfo'
import {
    ChatRequestData,
    StreamEvent,
    EnhancedOrchestratorResponse,
    UserAction,
    UserActionType,
    WorkspaceData,
    EnhancedTask
} from '@/types/chat'

interface ChatAreaProps {
    session: Session | null
    onSessionUpdate?: (sessionId: string, updates: Partial<Session>) => void
    isWorkspaceOpen?: boolean
    onWorkspaceToggle?: (isOpen: boolean) => void
}

/**
 * ChatArea component - Enhanced unified chat interface
 * 
 * Features:
 * - Natural streaming display of multi-agent collaboration
 * - Real-time task progress visualization
 * - User interaction controls (interrupt, retry, feedback)
 * - Enhanced workspace panel with structured results
 * - Improved UX with @ mentions and task assignments
 */
const ChatArea: React.FC<ChatAreaProps> = ({
    session,
    onSessionUpdate,
    isWorkspaceOpen = false,
    onWorkspaceToggle
}) => {
    const { t } = useTranslation()
    const { data: authSession } = useSession()
    const { getBatchAgentInfo } = useAgentInfo()

    // Simplified agent info state - only store loaded info, no complex caching
    const [loadedAgentInfo, setLoadedAgentInfo] = useState<Map<string, AgentInfo>>(new Map())

    // Dialog states
    const [showAddAgentDialog, setShowAddAgentDialog] = useState(false)
    const [showSettingsDialog, setShowSettingsDialog] = useState(false)

    // Enhanced orchestrator state
    const [orchestratorResponse, setOrchestratorResponse] = useState<EnhancedOrchestratorResponse | null>(null)
    const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([])
    const [confirmedIntent, setConfirmedIntent] = useState<string>('')
    const [isOrchestrating, setIsOrchestrating] = useState(false)
    const [currentTasks, setCurrentTasks] = useState<EnhancedTask[]>([])

    // Workspace data for real-time display
    const [workspaceData, setWorkspaceData] = useState<WorkspaceData>({
        taskList: [],
        lastUpdated: new Date(),
        phase: 'idle'
    })

    // Enhanced state management for error handling and reliability
    const [sendingState, setSendingState] = useState<'idle' | 'sending' | 'error'>('idle')
    const [lastError, setLastError] = useState<Error | null>(null)
    const [lastFailedMessage, setLastFailedMessage] = useState<string>('')
    const [userErrorMessage, setUserErrorMessage] = useState<string>('')

    // Concurrent request management
    const pendingRequests = React.useRef(new Set<string>())
    const MAX_CONCURRENT_REQUESTS = 3

    // Memory management constants
    const MAX_DATA_ITEMS = 50
    const ORCHESTRATOR_RESPONSE_CLEANUP_DELAY = 30000

    // Determine session characteristics for UI display
    const agentParticipants = useMemo(() =>
        session?.participants?.filter(p => p.type === 'agent') || [],
        [session?.participants]
    )
    const isMultiAgentSession = agentParticipants.length > 1

    // Simple agent info getter with fallback (no async state updates in render)
    const getAgentDisplayInfo = useCallback((agentId: string): { name: string; avatar: string } => {
        const loaded = loadedAgentInfo.get(agentId)
        if (loaded) {
            return { name: loaded.name, avatar: loaded.avatar }
        }
        // Return fallback immediately, no async operations
        return { name: 'AI Assistant', avatar: '🤖' }
    }, [loadedAgentInfo])

    // Load agent info when session changes (simplified)
    useEffect(() => {
        if (!session) return

        const agentIds = [
            ...agentParticipants.map(p => p.id),
            ...(session.primaryAgentId ? [session.primaryAgentId] : [])
        ]

        if (agentIds.length > 0) {
            // Load all agent info in batch, no complex caching logic
            getBatchAgentInfo(agentIds).then(batchInfo => {
                const newMap = new Map<string, AgentInfo>()
                Object.entries(batchInfo).forEach(([id, info]) => {
                    newMap.set(id, info)
                })
                setLoadedAgentInfo(newMap)
            }).catch(error => {
                console.error('Error loading agent info:', error)
                // Set fallback info for all agents
                const fallbackMap = new Map<string, AgentInfo>()
                agentIds.forEach(id => {
                    fallbackMap.set(id, { id, name: 'AI Assistant', avatar: '🤖' })
                })
                setLoadedAgentInfo(fallbackMap)
            })
        }
    }, [session, agentParticipants, getBatchAgentInfo])

    // Enhanced error handling with user-friendly feedback (no auto-retry)
    const handleChatError = useCallback((error: Error) => {
        console.error('🔴 Chat error:', error)
        setLastError(error)
        setSendingState('error')

        // Error classification and user feedback
        const errorMessage = error.message.toLowerCase()
        let errorType = 'generic_error'
        let userMessage = t('chat.sendMessageFailed')

        if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
            errorType = 'network_timeout'
            userMessage = t('chat.networkTimeout')
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
            errorType = 'rate_limit'
            userMessage = t('chat.rateLimitExceeded')
        } else if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication')) {
            errorType = 'authentication_failed'
            userMessage = t('chat.authenticationFailed')
        } else if (errorMessage.includes('quota') || errorMessage.includes('limit exceeded')) {
            errorType = 'quota_exceeded'
            userMessage = t('chat.quotaExceeded')
        }

        // Store user-friendly error message for UI display
        setUserErrorMessage(userMessage)

        // Log error classification for debugging (English for developers)
        console.warn('❌ Chat error classified as:', errorType, 'Original error:', error.message)
    }, [t])

    // Component cleanup and memory management
    useEffect(() => {
        const currentPendingRequests = pendingRequests.current
        return () => {
            // Clear all pending requests
            currentPendingRequests.clear()
            console.log('🧹 Component cleanup: cleared pending requests')
        }
    }, [])

    // Session change cleanup
    useEffect(() => {
        // Reset states when session changes
        setSendingState('idle')
        setLastError(null)
        setLastFailedMessage('')
        setUserErrorMessage('')
        setOrchestratorResponse(null)
        setStreamEvents([])
        setCurrentTasks([])
        setIsOrchestrating(false)
        pendingRequests.current.clear()

        console.log('🔄 Session changed, states reset')
    }, [session?.id])

    // Initialize unified chat with enhanced error handling
    const {
        messages,
        append,
        setMessages,
        isLoading,
        error,
        data
    } = useChat({
        api: '/api/chat',
        onError: handleChatError,
        onFinish: (message, { finishReason, usage }) => {
            console.log('✅ Chat response finished:', {
                finishReason,
                usage,
                messageLength: message.content?.length
            })

            // Reset error state on successful completion
            setSendingState('idle')
            setLastError(null)
            setLastFailedMessage('')
            setUserErrorMessage('')
            setIsOrchestrating(false)

            // For single-agent mode, update session message count
            if (session && onSessionUpdate) {
                console.log('📊 Updating session message count for response')
                onSessionUpdate(session.id, {
                    messageCount: (session.messageCount || 0) + 2
                })
            }
        }
    })

    // Reload messages from database
    const reloadMessages = useCallback(async () => {
        if (!session?.id) return

        try {
            const response = await fetch(`/api/sessions/${session.id}/messages`)
            if (response.ok) {
                const responseData = await response.json()
                const sessionMessages = responseData.data || responseData

                const formattedMessages = sessionMessages.map((msg: {
                    id: string
                    senderType: string
                    senderId: string
                    content: string
                    contentType: string
                    createdAt: string
                    metadata?: string
                }) => ({
                    id: msg.id,
                    role: msg.senderType === 'user' ? 'user' : 'assistant',
                    content: msg.content,
                    createdAt: new Date(msg.createdAt),
                    metadata: {
                        senderType: msg.senderType,
                        senderId: msg.senderId,
                        contentType: msg.contentType,
                        rawMetadata: msg.metadata && msg.metadata.length > 10 ? JSON.parse(msg.metadata) : undefined
                    }
                }))

                setMessages(formattedMessages)
            }
        } catch (error) {
            console.error('Error reloading messages:', error)
        }
    }, [session?.id, setMessages])

    // Monitor data changes for stream events and orchestrator responses
    useEffect(() => {
        if (data && data.length > 0) {
            // Memory management: Limit data array size to prevent memory leaks
            if (data.length > MAX_DATA_ITEMS) {
                console.warn(`🧹 Data array size (${data.length}) exceeds limit (${MAX_DATA_ITEMS}), cleanup recommended`)
            }

            const latestData = data[data.length - 1] as unknown

            // Handle stream events
            if (latestData && typeof latestData === 'object' && 'type' in latestData) {
                const eventData = latestData as StreamEvent
                if (eventData.type && eventData.timestamp) {
                    console.log('🔔 Received stream event:', eventData.type)
                    setStreamEvents(prev => [...prev, eventData])

                    // Update task list for workspace
                    if (eventData.type === 'task_created' && eventData.taskId) {
                        const newTask: EnhancedTask = {
                            id: eventData.taskId,
                            title: eventData.content || '',
                            description: '',
                            assignedTo: eventData.agentId || '',
                            status: 'pending',
                            priority: 'medium',
                            createdAt: new Date(eventData.timestamp),
                            progress: 0
                        }
                        setCurrentTasks(prev => [...prev, newTask])
                        setWorkspaceData(prev => ({
                            ...prev,
                            taskList: [...prev.taskList, newTask],
                            lastUpdated: new Date()
                        }))
                    } else if (eventData.type === 'task_started' && eventData.taskId) {
                        setCurrentTasks(prev => prev.map(task =>
                            task.id === eventData.taskId
                                ? { ...task, status: 'in_progress', startedAt: new Date(), progress: 30 }
                                : task
                        ))
                        setWorkspaceData(prev => ({
                            ...prev,
                            taskList: prev.taskList.map(task =>
                                task.id === eventData.taskId
                                    ? { ...task, status: 'in_progress', startedAt: new Date(), progress: 30 }
                                    : task
                            ),
                            lastUpdated: new Date()
                        }))
                    } else if (eventData.type === 'task_completed' && eventData.taskId) {
                        setCurrentTasks(prev => prev.map(task =>
                            task.id === eventData.taskId
                                ? { ...task, status: 'completed', completedAt: new Date(), progress: 100 }
                                : task
                        ))
                        setWorkspaceData(prev => ({
                            ...prev,
                            taskList: prev.taskList.map(task =>
                                task.id === eventData.taskId
                                    ? { ...task, status: 'completed', completedAt: new Date(), progress: 100 }
                                    : task
                            ),
                            lastUpdated: new Date()
                        }))
                    } else if (eventData.type === 'task_planning') {
                        setIsOrchestrating(true)
                        setWorkspaceData(prev => ({
                            ...prev,
                            taskSummary: eventData.content,
                            lastUpdated: new Date()
                        }))
                    } else if (eventData.type === 'summary_completed') {
                        setIsOrchestrating(false)
                        // Parse structured results if available
                        // This would typically come from the final orchestrator response
                    }
                }
            }

            // Handle orchestrator response
            if (latestData && typeof latestData === 'object' && 'type' in latestData) {
                const response = latestData as EnhancedOrchestratorResponse
                if (response.type === 'orchestrator') {
                    const orchResponse = response
                    console.log('🤖 Received enhanced orchestrator response:', {
                        turnIndex: orchResponse.turnIndex,
                        streamEventsCount: orchResponse.streamEvents?.length || 0,
                        tasksCount: orchResponse.tasks?.length || 0,
                        isStreaming: orchResponse.isStreaming,
                        canInterrupt: orchResponse.canInterrupt
                    })

                    setOrchestratorResponse(orchResponse)

                    // Update workspace with final results
                    if (orchResponse.tasks) {
                        setCurrentTasks(orchResponse.tasks)
                        setWorkspaceData(prev => ({
                            ...prev,
                            taskList: orchResponse.tasks,
                            lastUpdated: new Date()
                        }))
                    }

                    // Delayed cleanup of orchestrator response to prevent memory leaks
                    setTimeout(() => {
                        setOrchestratorResponse(prev =>
                            prev?.turnIndex === orchResponse.turnIndex ? null : prev
                        )
                    }, ORCHESTRATOR_RESPONSE_CLEANUP_DELAY)

                    // Reload messages to show collaboration results
                    console.log('🔄 Reloading messages to display collaboration results')
                    reloadMessages()
                }
            }
        }
    }, [data, reloadMessages])

    // Handle user actions (interrupt, retry, feedback)
    const handleUserAction = useCallback(async (action: UserActionType, metadata?: Record<string, unknown>) => {
        if (!session?.id) return

        const userAction: UserAction = {
            type: action,
            sessionId: session.id,
            timestamp: new Date(),
            ...metadata
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [],
                    data: {
                        sessionId: session.id,
                        userAction
                    }
                })
            })

            if (response.ok) {
                const result = await response.json()
                console.log('✅ User action handled:', result)

                if (action === 'interrupt') {
                    setIsOrchestrating(false)
                    setSendingState('idle')
                    // Add system message about interruption
                    const interruptMessage = {
                        id: crypto.randomUUID(),
                        role: 'system' as const,
                        content: t('chat.processInterrupted'),
                        createdAt: new Date()
                    }
                    setMessages(prev => [...prev, interruptMessage])
                }
            }
        } catch (error) {
            console.error('❌ Failed to handle user action:', error)
        }
    }, [session?.id, setMessages, t])

    // Handle unified message sending with enhanced reliability and concurrency control
    const handleSendMessage = useCallback(async (message: string) => {
        // Input validation and state checks
        if (!message.trim() || !session?.id) {
            console.warn('⚠️ Invalid message or session')
            return
        }

        // Prevent sending while already processing
        if (sendingState === 'sending' || isOrchestrating) {
            console.warn('⚠️ Message already being sent or orchestration in progress')
            return
        }

        // Concurrent request limit check
        if (pendingRequests.current.size >= MAX_CONCURRENT_REQUESTS) {
            console.warn(`⚠️ Maximum concurrent requests (${MAX_CONCURRENT_REQUESTS}) reached`)
            return
        }

        const requestId = crypto.randomUUID()

        try {
            // Add to pending requests for concurrency control
            pendingRequests.current.add(requestId)
            setSendingState('sending')
            setLastFailedMessage(message)
            setLastError(null)
            setStreamEvents([]) // Clear previous stream events
            setCurrentTasks([]) // Clear previous tasks

            // Set orchestrating state for multi-agent sessions
            if (isMultiAgentSession) {
                setIsOrchestrating(true)
            }

            console.log('📤 Sending unified message:', {
                requestId,
                sessionId: session.id,
                messageLength: message.length,
                agentParticipants: agentParticipants.length,
                isMultiAgentSession,
                confirmedIntent: confirmedIntent || 'auto',
                pendingRequests: pendingRequests.current.size
            })

            // Prepare request data
            const requestData: ChatRequestData = {
                sessionId: session.id,
                mode: 'auto', // Let server decide based on session analysis
                confirmedIntent: confirmedIntent || undefined
            }

            // Clear confirmed intent after sending
            setConfirmedIntent('')

            // Use the unified chat interface with request data and tracking headers
            await append({
                role: 'user',
                content: message,
                id: crypto.randomUUID(),
                createdAt: new Date()
            }, {
                data: JSON.parse(JSON.stringify(requestData)),
                headers: {
                    'X-Request-ID': requestId,
                    'X-Session-ID': session.id
                }
            })

            // Success: message will be handled by onFinish callback
            console.log('✅ Message sent successfully:', requestId)

        } catch (error) {
            console.error('❌ Failed to send message:', error)
            setSendingState('error')
            setLastError(error as Error)
            setIsOrchestrating(false)
            // Error will be handled by onError callback via useChat
        } finally {
            // Always clean up the pending request
            pendingRequests.current.delete(requestId)
        }
    }, [
        session?.id,
        sendingState,
        isOrchestrating,
        agentParticipants.length,
        isMultiAgentSession,
        confirmedIntent,
        append
    ])

    // Simple manual retry function
    const handleRetry = useCallback(() => {
        if (lastFailedMessage && sendingState === 'error') {
            console.log('🔄 Manual retry triggered')
            setLastError(null)
            setUserErrorMessage('')
            handleSendMessage(lastFailedMessage)
        }
    }, [lastFailedMessage, sendingState, handleSendMessage])

    // Load existing messages when session changes
    useEffect(() => {
        if (session?.id) {
            reloadMessages()
        }
    }, [session?.id, reloadMessages])

    // Handle adding agent to session
    const handleAddAgent = async (agentId: string) => {
        if (!session || !onSessionUpdate) return

        const currentParticipants = session.participants || []

        if (currentParticipants.some(p => p.id === agentId)) {
            console.log('Agent already added to session')
            return
        }

        const agentDisplayInfo = getAgentDisplayInfo(agentId)
        const newParticipant = {
            id: agentId,
            name: agentDisplayInfo.name,
            avatar: agentDisplayInfo.avatar,
            type: 'agent' as const
        }

        const updatedParticipants = [...currentParticipants, newParticipant]

        onSessionUpdate(session.id, {
            participants: updatedParticipants
        })

        console.log(`Added agent ${agentId} to session ${session.id}`)
    }

    // Convert messages for display with proper sender identification
    const displayMessages: Message[] = messages.map((msg) => {
        if (msg.role === 'user') {
            // Get user info from better-auth session
            const user = authSession?.user
            const userName = user?.name || user?.username || user?.email || 'You'
            const userAvatar = user?.image || user?.avatarUrl || userName.charAt(0).toUpperCase()

            return {
                id: msg.id,
                content: msg.content,
                sender: userName,
                senderType: 'user' as const,
                timestamp: msg.createdAt || new Date(),
                avatar: userAvatar,
                avatarStyle: undefined,
                metadata: (msg as unknown as { metadata?: { senderType?: string; senderId?: string; contentType?: string; rawMetadata?: Record<string, unknown> } }).metadata
            }
        } else {
            // For AI messages, use the actual senderId from metadata if available, otherwise use primaryAgentId
            const metadata = (msg as unknown as { metadata?: { senderType?: string; senderId?: string; contentType?: string; rawMetadata?: Record<string, unknown> } }).metadata
            const actualSenderId = metadata?.senderId || session?.primaryAgentId || 'gemini-flash'
            const agentDisplayInfo = getAgentDisplayInfo(actualSenderId)

            return {
                id: msg.id,
                content: msg.content,
                sender: agentDisplayInfo.name,
                senderType: 'ai' as const,
                timestamp: msg.createdAt || new Date(),
                avatar: agentDisplayInfo.avatar,
                avatarStyle: undefined,
                metadata
            }
        }
    })

    if (!session) {
        return null
    }

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-900">
            {/* Main Chat Area */}
            <main className="flex flex-col flex-1 min-w-0">
                {/* Chat Header */}
                <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Mode Indicator */}
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-base sm:text-lg font-medium shadow-md flex-shrink-0">
                            {isMultiAgentSession ? <Users className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        {/* Session Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                                    {session.title}
                                </h1>
                                {isMultiAgentSession && (
                                    <Badge variant="secondary" className="text-xs">
                                        {t('chat.collaborationMode')}
                                    </Badge>
                                )}
                                {isOrchestrating && (
                                    <Badge variant="default" className="text-xs animate-pulse">
                                        {t('chat.orchestrating')}
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isMultiAgentSession
                                    ? `${agentParticipants.length}${t('chat.agentsCollaborating')}`
                                    : `${getAgentDisplayInfo(session?.primaryAgentId || 'gemini-flash').name} · ${messages.length || 0} ${t('chat.messages')}`
                                }
                                {orchestratorResponse && (
                                    <span className="ml-2">• Turn #{orchestratorResponse.turnIndex}</span>
                                )}
                                {currentTasks.length > 0 && (
                                    <span className="ml-2">• {currentTasks.filter(t => t.status === 'completed').length}/{currentTasks.length} tasks</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Interrupt button - only show when orchestrating */}
                        {isOrchestrating && orchestratorResponse?.canInterrupt !== false && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                    title={t('chat.interrupt')}
                                    onClick={() => handleUserAction('interrupt')}
                                >
                                    <StopCircle className="w-4 h-4 mr-1" />
                                    {t('chat.interrupt')}
                                </Button>
                            </motion.div>
                        )}
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
                        {/* Workspace Toggle */}
                        {isMultiAgentSession && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant={isWorkspaceOpen ? "default" : "ghost"}
                                    size="sm"
                                    className="h-8 px-3 text-xs"
                                    onClick={() => onWorkspaceToggle?.(!isWorkspaceOpen)}
                                >
                                    {t('chat.workspace')}
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </header>

                {/* Simplified Error Banner */}
                {(error || lastError) && (
                    <div className="flex-shrink-0 mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                <span>
                                    {userErrorMessage || (error || lastError)?.message || 'Something went wrong. Please try again.'}
                                </span>
                            </div>

                            {/* Simple Manual Retry Button */}
                            {sendingState === 'error' && lastFailedMessage && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
                                    onClick={handleRetry}
                                    disabled={sendingState !== 'error'}
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    {t('chat.retry')}
                                </Button>
                            )}
                        </div>

                        {/* Simple progress indicator for sending */}
                        {sendingState === 'sending' && (
                            <div className="mt-2 w-full bg-red-100 dark:bg-red-900/30 rounded-full h-1">
                                <div className="bg-red-500 h-1 rounded-full animate-pulse" style={{ width: '30%' }} />
                            </div>
                        )}
                    </div>
                )}

                {/* Main Content Area - Traditional Chat Interface */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-hidden">
                        <MessageList
                            messages={displayMessages}
                            isTyping={isLoading || isOrchestrating}
                            typingUser={isLoading || isOrchestrating ? (
                                isMultiAgentSession
                                    ? t('chat.agentsCollaboratingInProgress')
                                    : getAgentDisplayInfo(session?.primaryAgentId || 'gemini-flash').name
                            ) : ''}
                            typingAvatar={isLoading || isOrchestrating ? (
                                isMultiAgentSession
                                    ? '🤖'
                                    : getAgentDisplayInfo(session?.primaryAgentId || 'gemini-flash').avatar
                            ) : ''}
                            streamEvents={streamEvents}
                            onUserAction={handleUserAction}
                        />
                    </div>

                    {/* Clarification Section */}
                    {orchestratorResponse?.shouldClarify && (
                        <div className="flex-shrink-0 p-4 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-800/50">
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                                {t('chat.needsClarification')}
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                                {orchestratorResponse.clarificationQuestion}
                            </p>
                            <input
                                type="text"
                                value={confirmedIntent}
                                onChange={(e) => setConfirmedIntent(e.target.value)}
                                placeholder={t('chat.pleaseReply')}
                                className="w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && confirmedIntent.trim()) {
                                        handleSendMessage(confirmedIntent)
                                    }
                                }}
                            />
                        </div>
                    )}

                    {/* Message Input */}
                    <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <MessageInput
                            onSendMessage={handleSendMessage}
                            mentionItems={[]}
                            disabled={isLoading || isOrchestrating}
                            placeholder={
                                isOrchestrating
                                    ? t('chat.waitingForAgents')
                                    : t('chat.inputPlaceholder')
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

            {/* Enhanced Workspace Panel */}
            {isMultiAgentSession && isWorkspaceOpen && (
                <div className="hidden lg:flex w-[360px] min-w-[320px] max-w-[400px] border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <WorkspacePanel
                        session={session}
                        orchestratorResponse={orchestratorResponse}
                        workspaceData={workspaceData}
                        isVisible={isWorkspaceOpen}
                        onClose={() => onWorkspaceToggle?.(false)}
                    />
                </div>
            )}
        </div>
    )
}

export default ChatArea