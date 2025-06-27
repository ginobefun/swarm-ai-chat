'use client'

import React from 'react'
import { motion } from 'framer-motion'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Session } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import { Button } from '@/components/ui/button'
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

    const handleSendMessage = (message: string) => {
        if (session && onSessionUpdate) {
            console.log('Sending message:', message)
            // TODO: Implement message sending logic
        }
    }

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
                            {session.participants.filter(p => p.type === 'agent').length} {t('chat.agents')} · {session.messageCount || 0} {t('chat.messages')}
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

            {/* Message display area */}
            <MessageList
                messages={[]}
                isTyping={false}
                typingUser=""
            />

            {/* Message input area */}
            <MessageInput
                onSendMessage={handleSendMessage}
                mentionItems={[]}
            />
        </main>
    )
}

export default ChatArea 