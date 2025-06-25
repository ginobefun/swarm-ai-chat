'use client'

import React from 'react'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import { Session } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

interface ChatAreaProps {
    session: Session | null
    onSessionUpdate?: (sessionId: string, updates: Partial<Session>) => void
}

const ChatArea: React.FC<ChatAreaProps> = ({
    session,
    onSessionUpdate
}) => {
    const { t } = useTranslation()

    const handleSendMessage = (message: string) => {
        if (session && onSessionUpdate) {
            // 这里应该添加发送消息的逻辑
            console.log('Sending message:', message)
        }
    }

    if (!session) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-medium mb-2">{t('chat.selectSession')}</h3>
                    <p className="text-sm">{t('chat.selectSessionDesc')}</p>
                </div>
            </div>
        )
    }

    return (
        <main className="flex flex-col flex-1 bg-white dark:bg-slate-900">
            {/* 对话头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <div>
                    <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {session.title}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        {session.participants.filter(p => p.type === 'agent').length} {t('session.agentsCount')}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={t('chat.addMember')}
                    >
                        ➕
                    </button>
                    <button
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={t('chat.settings')}
                    >
                        ⚙️
                    </button>
                    <button
                        className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title={t('chat.workspace')}
                    >
                        📊
                    </button>
                </div>
            </div>

            {/* 消息列表 */}
            <MessageList
                messages={[]}
                isTyping={false}
                typingUser=""
            />

            {/* 输入区 */}
            <MessageInput
                onSendMessage={handleSendMessage}
                mentionItems={[]}
            />
        </main>
    )
}

export default ChatArea 