'use client'

import React, { useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Session, Message } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import { useSession } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { useChat } from '@ai-sdk/react'
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
                const response = await fetch(`/api/sessions/${session.id}/messages`)
                if (response.ok) {
                    const responseData = await response.json()

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
                }
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


    // Convert AI SDK messages to our Message format for display
    const displayMessages: Message[] = messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        sender: msg.role === 'user' ? 'You' : getAgentName(session?.primaryAgentId || 'gemini-flash'),
        senderType: msg.role === 'user' ? 'user' : 'ai',
        timestamp: msg.createdAt || new Date(),
        avatar: msg.role === 'user' ? 'You' : getAgentAvatar(session?.primaryAgentId || 'gemini-flash'),
        avatarStyle: undefined
    }))


    // ChatArea should only render when there's an active session
    if (!session) {
        return null
    }

    return (
        <main className="flex flex-col flex-1 bg-background">
            {/* Chat header with proper top spacing to match SessionList */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-card shadow-sm mt-4">
                <div className="flex items-center gap-4">
                    {/* Participant avatars */}
                    <div className="flex -space-x-2">
                        {session.participants.filter(p => p.type === 'agent').slice(0, 3).map((participant) => (
                            <motion.div
                                key={participant.id}
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-medium border-2 border-background shadow-sm"
                                title={participant.name}
                                whileHover={{ scale: 1.1, zIndex: 10 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                {participant.avatar || '🤖'}
                            </motion.div>
                        ))}
                        {session.participants.filter(p => p.type === 'agent').length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-medium border-2 border-background shadow-sm">
                                +{session.participants.filter(p => p.type === 'agent').length - 3}
                            </div>
                        )}
                    </div>

                    {/* Session info */}
                    <div>
                        <div className="text-lg font-semibold text-foreground">
                            {session.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {session.participants.filter(p => p.type === 'agent').length} {t('chat.agents')} · {messages.length || 0} {t('chat.messages')}
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('chat.addMember')}
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="text-sm text-destructive">
                        ❌ {error.message || 'Something went wrong. Please try again.'}
                    </div>
                </div>
            )}

            {/* Message display area */}
            <MessageList
                messages={displayMessages}
                isTyping={isLoading}
                typingUser={getAgentName(session?.primaryAgentId || 'gemini-flash')}
                typingAvatar={getAgentAvatar(session?.primaryAgentId || 'gemini-flash')}
            />

            {/* Message input area */}
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
                    !currentUserId ? 'Please login to send messages...' :
                        isLoading ? 'AI is thinking...' :
                            'Type your message...'
                }
            />
        </main>
    )
}

export default ChatArea 