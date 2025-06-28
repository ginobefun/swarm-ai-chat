'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Session, Message } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
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
    Bot
} from 'lucide-react'
import { aiAgents } from '@/constants/agents'
import { ChatRequestData, OrchestratorResponse } from '@/types/chat'

// Helper functions to get agent information
const getAgentName = (agentId: string): string => {
    const agent = aiAgents.find(a => a.id === agentId)
    if (agent) return agent.name

    const agentNames: Record<string, string> = {
        'gemini-flash': 'Gemini Flash',
        'gpt-4o': 'GPT-4o',
        'claude-sonnet': 'Claude Sonnet',
        'llama-3': 'Llama 3',
        'qwen-coder': 'Qwen Coder'
    }
    return agentNames[agentId] || 'AI Assistant'
}

const getAgentAvatar = (agentId: string): string => {
    const agent = aiAgents.find(a => a.id === agentId)
    if (agent) return agent.avatar

    const agentAvatars: Record<string, string> = {
        'gemini-flash': '⚡',
        'gpt-4o': '🤖',
        'claude-sonnet': '🎭',
        'llama-3': '🦙',
        'qwen-coder': '💻'
    }
    return agentAvatars[agentId] || '🤖'
}

interface ChatAreaProps {
    session: Session | null
    onSessionUpdate?: (sessionId: string, updates: Partial<Session>) => void
    isWorkspaceOpen?: boolean
    onWorkspaceToggle?: (isOpen: boolean) => void
}

/**
 * ChatArea component - Unified chat interface
 * 
 * Features:
 * - Unified interface for both single-agent and multi-agent modes
 * - Server-side mode detection and routing
 * - Traditional streaming for single agents
 * - LangGraph orchestration for multi-agent sessions
 * - Seamless user experience regardless of mode
 */
const ChatArea: React.FC<ChatAreaProps> = ({
    session,
    onSessionUpdate,
    isWorkspaceOpen = false,
    onWorkspaceToggle
}) => {
    const { t } = useTranslation()

    // Dialog states
    const [showAddAgentDialog, setShowAddAgentDialog] = useState(false)
    const [showSettingsDialog, setShowSettingsDialog] = useState(false)

    // Orchestrator response state for workspace
    const [orchestratorResponse, setOrchestratorResponse] = useState<OrchestratorResponse | null>(null)
    const [confirmedIntent, setConfirmedIntent] = useState<string>('')

    // Determine session characteristics for UI display
    const agentParticipants = session?.participants?.filter(p => p.type === 'agent') || []
    const isMultiAgentSession = agentParticipants.length > 1

    // Initialize unified chat
    const {
        messages,
        append,
        setMessages,
        isLoading,
        error,
        data
    } = useChat({
        api: '/api/chat',
        onError: (error) => {
            console.error('🔴 Chat error:', error)
        },
        onFinish: (message, { finishReason, usage }) => {
            console.log('✅ Chat response finished:', {
                finishReason,
                usage,
                messageLength: message.content?.length
            })

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
                    role: msg.senderType === 'USER' ? 'user' : 'assistant',
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

    // Monitor data changes for orchestrator responses
    useEffect(() => {
        if (data && data.length > 0) {
            const latestData = data[data.length - 1] as unknown as OrchestratorResponse
            if (latestData?.type === 'orchestrator') {
                console.log('🤖 Received orchestrator response via StreamData:', {
                    turnIndex: latestData.turnIndex,
                    shouldClarify: latestData.shouldClarify,
                    hasQuestion: !!latestData.clarificationQuestion,
                    tasksCount: latestData.tasks?.length || 0,
                    resultsCount: latestData.results?.length || 0
                })

                setOrchestratorResponse(latestData)

                // Reload messages to show collaboration results
                console.log('🔄 Reloading messages to display collaboration results')
                reloadMessages()
            }
        }
    }, [data, reloadMessages])

    // Handle unified message sending
    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !session?.id || isLoading) return

        console.log('📤 Sending unified message:', {
            sessionId: session.id,
            messageLength: message.length,
            agentParticipants: agentParticipants.length,
            isMultiAgentSession,
            confirmedIntent: confirmedIntent || 'auto'
        })

        // Prepare request data
        const requestData: ChatRequestData = {
            sessionId: session.id,
            mode: 'auto', // Let server decide based on session analysis
            confirmedIntent: confirmedIntent || undefined
        }

        // Clear confirmed intent after sending
        setConfirmedIntent('')

        // Use the unified chat interface with request data
        await append({
            role: 'user',
            content: message
        }, {
            data: JSON.parse(JSON.stringify(requestData))
        })
    }

    // Load existing messages when session changes
    useEffect(() => {
        reloadMessages()
    }, [session?.id, reloadMessages])

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

    // Convert messages for display
    const displayMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === 'user' ? 'You' : getAgentName(session?.primaryAgentId || 'gemini-flash'),
        senderType: msg.role === 'user' ? 'user' : 'ai',
        timestamp: msg.createdAt || new Date(),
        avatar: msg.role === 'user' ? 'You' : getAgentAvatar(session?.primaryAgentId || 'gemini-flash'),
        avatarStyle: undefined,
        // Pass through metadata for collaboration messages
        metadata: (msg as unknown as { metadata?: { senderType?: string; senderId?: string; contentType?: string; rawMetadata?: Record<string, unknown> } }).metadata
    }))

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
                                        协作模式
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isMultiAgentSession
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
                                    工作区
                                </Button>
                            </motion.div>
                        )}
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

                {/* Main Content Area - Traditional Chat Interface */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-hidden">
                        <MessageList
                            messages={displayMessages}
                            isTyping={isLoading}
                            typingUser={isLoading ? (isMultiAgentSession ? '智能体协作中...' : getAgentName(session?.primaryAgentId || 'gemini-flash')) : ''}
                            typingAvatar={isLoading ? (isMultiAgentSession ? '🤖' : getAgentAvatar(session?.primaryAgentId || 'gemini-flash')) : ''}
                        />
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
                                        handleSendMessage(confirmedIntent)
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

                    {/* Message Input */}
                    <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <MessageInput
                            onSendMessage={handleSendMessage}
                            mentionItems={[]}
                            disabled={isLoading}
                            placeholder={t('chat.inputPlaceholder')}
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

            {/* Workspace Panel - Integrated */}
            {isMultiAgentSession && isWorkspaceOpen && (
                <div className="hidden lg:flex w-[360px] min-w-[320px] max-w-[400px] border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <WorkspacePanel
                        session={session}
                        orchestratorResponse={orchestratorResponse}
                        isVisible={isWorkspaceOpen}
                        onClose={() => onWorkspaceToggle?.(false)}
                    />
                </div>
            )}
        </div>
    )
}

export default ChatArea