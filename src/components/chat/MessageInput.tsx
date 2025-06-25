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
        <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
            <div className="relative max-w-4xl mx-auto">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1 z-10">
                    <button
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-150"
                        onClick={handleMentionButtonClick}
                        title={t('chat.mention')}
                    >
                        @
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-150"
                        title={t('chat.attachment')}
                    >
                        📎
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors duration-150"
                        title={t('chat.commands')}
                    >
                        /
                    </button>
                </div>

                <textarea
                    ref={textareaRef}
                    className="w-full bg-gray-100 dark:bg-slate-800 border-0 rounded-2xl pl-28 pr-12 py-4 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 min-h-[52px] max-h-32"
                    placeholder={placeholder || t('chat.inputPlaceholder')}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    rows={1}
                />

                <button
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full transition-colors duration-150 disabled:cursor-not-allowed"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || disabled}
                    title={t('chat.send')}
                >
                    ➤
                </button>

                {/* @提及弹窗 */}
                {showMentionPopup && (
                    <div
                        ref={mentionPopupRef}
                        className="absolute bottom-full left-3 mb-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-64 animate-menu-slide-in z-20"
                    >
                        {filteredMentions.map((mention) => (
                            <div
                                key={mention.id}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors duration-150 text-sm first:rounded-t-lg last:rounded-b-lg"
                                onClick={() => handleMentionSelect(mention)}
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs text-white">
                                    {mention.avatar}
                                </div>
                                <span>{mention.name}</span>
                            </div>
                        ))}
                        {filteredMentions.length === 0 && (
                            <div className="flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-gray-400 cursor-default text-sm">
                                {t('messages.noMatches')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MessageInput 