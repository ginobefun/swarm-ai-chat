'use client'

import React, { useEffect, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import VirtualizedMessageList from './VirtualizedMessageList'
import MessageInput from './MessageInput'
import { Session, Message } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import AddAgentDialog from './AddAgentDialog'
import ChatSettingsDialog from './ChatSettingsDialog'
import { useSession } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { useChat } from '@ai-sdk/react'
import { apiClient } from '@/lib/api-client'
import {
    Plus,
    Settings
} from 'lucide-react'

interface ChatAreaProps {
    session: Session | null
    onSessionUpdate?: (sessionId: string, updates: Partial<Session>) => void
}

/**
 * ChatArea component - Main chat interface for active sessions
 * 
 * Features:
 * - Real-time message display and input
 * - Session header with participant information
 * - Add member and settings functionality
 * - Responsive design with proper spacing
 * - Dark mode support throughout
 * - Loading and typing indicators
 * - Accessibility features with ARIA labels
 * - AI streaming responses with useChat hook
 * 
 * Layout:
 * - Chat header with session info and controls
 * - Message list with scrolling capability
 * - Message input at bottom
 * 
 * @param props - ChatAreaProps containing session data and handlers
 * @returns JSX element representing the chat interface
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

    // Get agent information functions - moved to top to avoid hoisting issues
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

    // Vercel AI useChat hook for handling streaming responses
    const {
        messages,
        isLoading,
        error,
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
            console.error('🔴 Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            })
        },
        onFinish: (message) => {
            console.log('✅ Frontend - AI response finished:', message)
            // Update session message count
            if (session && onSessionUpdate) {
                onSessionUpdate(session.id, {
                    messageCount: (session.messageCount || 0) + 2 // +1 for user, +1 for AI
                })
            }
        }
    })

    // Load existing messages when session changes
    useEffect(() => {
        const loadSessionMessages = async () => {
            if (!session?.id) return

            try {
                const responseData = await apiClient.get(`/sessions/${session.id}/messages`)

                // Handle both direct array response and wrapped response
                const sessionMessages = responseData.data || responseData

                // Convert SwarmChatMessage format to AI SDK format
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
            } catch (error) {
                console.error('Error loading session messages:', error)
            }
        }

        loadSessionMessages()
    }, [session?.id, setMessages])

    // Handle manual message sending (from MessageInput component)
    const handleSendMessage = async (message: string) => {
        if (!session || !message.trim() || !currentUserId) return

        // Use append to add the user message and trigger AI response
        await append({
            role: 'user',
            content: message
        })
    }

    // Handle adding agent to session
    const handleAddAgent = async (agentId: string) => {
        if (!session || !onSessionUpdate) return

        // Get current participants or initialize as empty array
        const currentParticipants = session.participants || []

        // Check if agent is already added
        if (currentParticipants.some(p => p.id === agentId)) {
            console.log('Agent already added to session')
            return
        }

        // Add new agent participant
        const newParticipant = {
            id: agentId,
            name: getAgentName(agentId),
            avatar: getAgentAvatar(agentId),
            type: 'agent' as const
        }

        const updatedParticipants = [...currentParticipants, newParticipant]

        // Update session
        onSessionUpdate(session.id, {
            participants: updatedParticipants
        })

        console.log(`Added agent ${agentId} to session ${session.id}`)
    }


    // Convert AI SDK messages to our Message format for display
    const displayMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === 'user' ? 'You' : getAgentName(session?.primaryAgentId || 'gemini-flash'),
        senderType: msg.role === 'user' ? 'user' : 'agent',
        timestamp: msg.createdAt || new Date(),
        avatar: msg.role === 'user' ? 'You' : getAgentAvatar(session?.primaryAgentId || 'gemini-flash'),
        avatarStyle: undefined
    }))


    // ChatArea should only render when there's an active session
    if (!session) {
        return null
    }

    return (
        <main className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
            {/* Chat Header - Fixed at top with responsive design */}
            <header className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Agent Avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-base sm:text-lg font-medium shadow-md flex-shrink-0">
                        {getAgentAvatar(session?.primaryAgentId || 'gemini-flash')}
                    </div>

                    {/* Session Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {session.title}
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                            {getAgentName(session?.primaryAgentId || 'gemini-flash')} · {messages.length || 0} {t('chat.messages')}
                        </p>
                        {/* Mobile-only compact info */}
                        <p className="text-xs text-slate-500 dark:text-slate-400 sm:hidden">
                            {messages.length || 0} {t('chat.messages')}
                        </p>
                    </div>
                </div>

                {/* Header Actions - Responsive */}
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
                </div>
            </header>

            {/* Error Banner - Fixed position below header */}
            {error && (
                <div className="flex-shrink-0 mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                        <span className="text-red-500">⚠️</span>
                        {error.message || 'Something went wrong. Please try again.'}
                    </div>
                </div>
            )}

            {/* Messages Container - Scrollable content area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Message List - Flexible content with proper scrolling and virtualization */}
                <div className="flex-1 overflow-hidden">
                    <VirtualizedMessageList
                        messages={displayMessages}
                        isTyping={isLoading}
                        typingUser={getAgentName(session?.primaryAgentId || 'gemini-flash')}
                        typingAvatar={getAgentAvatar(session?.primaryAgentId || 'gemini-flash')}
                        height="auto"
                    />
                </div>

                {/* Message Input - Fixed at bottom */}
                <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <MessageInput
                        onSendMessage={handleSendMessage}
                        mentionItems={session.participants.filter(p => p.type === 'agent').map(p => ({
                            id: p.id,
                            name: p.name,
                            avatar: p.avatar || '🤖',
                            type: 'agent' as const
                        }))}
                        disabled={isLoading || !currentUserId}
                        placeholder={
                            !currentUserId ? t('chat.loginToSendMessage') :
                                isLoading ? t('chat.aiThinking') :
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
                currentAgentIds={session.participants?.filter(p => p.type === 'agent').map(p => p.id) || []}
            />

            <ChatSettingsDialog
                isOpen={showSettingsDialog}
                onClose={() => setShowSettingsDialog(false)}
                session={session}
                onUpdateSession={onSessionUpdate}
                onDeleteSession={(sessionId) => {
                    // This would be handled by parent component
                    console.log('Delete session:', sessionId)
                }}
            />
        </main>
    )
}

export default ChatArea 