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
        <div className="input-area">
            <div className="input-wrapper">
                <div className="input-actions">
                    <button
                        className="input-btn"
                        onClick={handleMentionButtonClick}
                        title={t('chat.mention')}
                    >
                        @
                    </button>
                    <button className="input-btn" title={t('chat.attachment')}>
                        📎
                    </button>
                    <button className="input-btn" title={t('chat.commands')}>
                        /
                    </button>
                </div>

                <textarea
                    ref={textareaRef}
                    className="input-field"
                    placeholder={placeholder || t('chat.inputPlaceholder')}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    rows={1}
                />

                <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || disabled}
                    title={t('chat.send')}
                >
                    ➤
                </button>

                {/* @提及弹窗 */}
                {showMentionPopup && (
                    <div ref={mentionPopupRef} className="mention-popup" style={{ display: 'block' }}>
                        {filteredMentions.map((mention) => (
                            <div
                                key={mention.id}
                                className="mention-item"
                                onClick={() => handleMentionSelect(mention)}
                            >
                                <div className="mention-avatar">{mention.avatar}</div>
                                <span>{mention.name}</span>
                            </div>
                        ))}
                        {filteredMentions.length === 0 && (
                            <div className="mention-item" style={{ color: '#86868b', cursor: 'default' }}>
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