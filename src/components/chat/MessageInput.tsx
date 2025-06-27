'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MentionItem } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

interface MessageInputProps {
    onSendMessage: (message: string) => void
    mentionItems: MentionItem[]
    placeholder?: string
    disabled?: boolean
}

const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    mentionItems,
    placeholder,
    disabled = false
}) => {
    const { t } = useTranslation()
    const [inputValue, setInputValue] = useState('')
    const [showMentionPopup, setShowMentionPopup] = useState(false)
    const [filteredMentions, setFilteredMentions] = useState<MentionItem[]>([])
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const mentionPopupRef = useRef<HTMLDivElement>(null)

    // 自动调整 textarea 高度
    const adjustTextareaHeight = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
        }
    }

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value
        setInputValue(value)

        // 检测@符号
        const atIndex = value.lastIndexOf('@')
        if (atIndex !== -1) {
            const query = value.substring(atIndex + 1)
            if (!query.includes(' ')) {
                setShowMentionPopup(true)

                // 过滤提及项
                const filtered = mentionItems.filter(item =>
                    item.name.toLowerCase().includes(query.toLowerCase())
                )
                setFilteredMentions(filtered)
            } else {
                setShowMentionPopup(false)
            }
        } else {
            setShowMentionPopup(false)
        }
    }

    // 选择提及项
    const handleMentionSelect = (mention: MentionItem) => {
        const atIndex = inputValue.lastIndexOf('@')
        const newValue = inputValue.substring(0, atIndex) + `@${mention.name} `
        setInputValue(newValue)
        setShowMentionPopup(false)
        textareaRef.current?.focus()
    }

    // 处理@按钮点击
    const handleMentionButtonClick = () => {
        setInputValue(prev => prev + '@')
        setShowMentionPopup(true)
        setFilteredMentions(mentionItems)
        textareaRef.current?.focus()
    }

    // 发送消息
    const handleSendMessage = () => {
        const trimmedMessage = inputValue.trim()
        if (trimmedMessage && !disabled) {
            onSendMessage(trimmedMessage)
            setInputValue('')
            setShowMentionPopup(false)
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        }
    }

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // 点击外部关闭提及弹窗
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                mentionPopupRef.current &&
                !mentionPopupRef.current.contains(event.target as Node) &&
                textareaRef.current &&
                !textareaRef.current.contains(event.target as Node)
            ) {
                setShowMentionPopup(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // 自动调整高度
    useEffect(() => {
        adjustTextareaHeight()
    }, [inputValue])

    return (
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-800">
            <div className="relative">
                {/* Input Container - Responsive */}
                <div className="flex items-end gap-2 sm:gap-3">
                    {/* Toolbar buttons - Responsive */}
                    <div className="flex items-center gap-1 pb-2">
                        <button
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-150 text-sm font-medium"
                            onClick={handleMentionButtonClick}
                            title={t('chat.mention')}
                            disabled={disabled}
                        >
                            @
                        </button>
                        <button
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-150 hidden sm:flex"
                            title={t('chat.attachment')}
                            disabled={disabled}
                        >
                            📎
                        </button>
                        <button
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all duration-150 hidden sm:flex"
                            title={t('chat.commands')}
                            disabled={disabled}
                        >
                            /
                        </button>
                    </div>

                    {/* Input Area */}
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 pr-12 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 resize-none outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 min-h-[44px] max-h-40"
                            placeholder={placeholder || t('chat.inputPlaceholder')}
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            rows={1}
                        />

                        {/* Send Button */}
                        <button
                            className="absolute right-2 bottom-2 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white rounded-full transition-all duration-150 disabled:cursor-not-allowed shadow-sm disabled:shadow-none"
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || disabled}
                            title={t('chat.send')}
                        >
                            <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* @提及弹窗 - Responsive */}
                {showMentionPopup && (
                    <div
                        ref={mentionPopupRef}
                        className="absolute bottom-full left-8 sm:left-12 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl max-h-60 overflow-y-auto min-w-56 sm:min-w-64 z-50 backdrop-blur-sm"
                        style={{
                            animation: 'slideUpFade 0.2s ease-out forwards'
                        }}
                    >
                        <div className="p-2">
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-2">
                                {t('chat.selectMember')}
                            </div>
                            {filteredMentions.map((mention) => (
                                <div
                                    key={mention.id}
                                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-150 text-sm rounded-lg"
                                    onClick={() => handleMentionSelect(mention)}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-sm text-white shadow-sm">
                                        {mention.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-slate-900 dark:text-slate-100">
                                            {mention.name}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {mention.type === 'agent' ? t('chat.aiAgent') : t('chat.user')}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredMentions.length === 0 && (
                                <div className="flex items-center gap-3 px-3 py-4 text-slate-500 dark:text-slate-400 text-sm">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-400">
                                        ?
                                    </div>
                                    <span>{t('messages.noMatches')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MessageInput 