'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MentionItem } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

interface MentionDropdownProps {
    /** 显示或隐藏下拉框 */
    isOpen: boolean
    /** 筛选后的提及项列表 */
    items: MentionItem[]
    /** 已经被提及的agent IDs（用于高亮显示） */
    mentionedIds?: string[]
    /** 选择提及项的回调 */
    onSelect: (item: MentionItem) => void
    /** 关闭下拉框的回调 */
    onClose: () => void
    /** 搜索查询字符串（用于高亮匹配文本） */
    query?: string
}

/**
 * MentionDropdown - 智能体/用户提及下拉选择器
 *
 * 功能：
 * - 键盘导航支持 (↑↓ 导航, Enter 选择, Esc 关闭)
 * - 高亮已提及的智能体
 * - 搜索查询匹配高亮
 * - 无障碍访问支持
 * - 响应式设计
 */
const MentionDropdown: React.FC<MentionDropdownProps> = ({
    isOpen,
    items,
    mentionedIds = [],
    onSelect,
    onClose,
    query = ''
}) => {
    const { t } = useTranslation()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLDivElement | null)[]>([])

    // 重置选中索引当items改变时
    useEffect(() => {
        setSelectedIndex(0)
    }, [items])

    // 键盘导航处理
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev =>
                        prev < items.length - 1 ? prev + 1 : 0
                    )
                    break

                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev =>
                        prev > 0 ? prev - 1 : items.length - 1
                    )
                    break

                case 'Enter':
                    e.preventDefault()
                    if (items.length > 0 && items[selectedIndex]) {
                        onSelect(items[selectedIndex])
                    }
                    break

                case 'Escape':
                    e.preventDefault()
                    onClose()
                    break
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, items, selectedIndex, onSelect, onClose])

    // 滚动到选中的项目
    useEffect(() => {
        if (itemRefs.current[selectedIndex]) {
            itemRefs.current[selectedIndex]?.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            })
        }
    }, [selectedIndex])

    if (!isOpen) return null

    /**
     * 高亮匹配的文本
     */
    const highlightMatch = (text: string, query: string): React.ReactNode => {
        if (!query) return text

        const parts = text.split(new RegExp(`(${query})`, 'gi'))
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-slate-900 dark:text-slate-100">
                    {part}
                </mark>
            ) : (
                part
            )
        )
    }

    /**
     * 检查是否已被提及
     */
    const isMentioned = (id: string): boolean => {
        return mentionedIds.includes(id)
    }

    return (
        <div
            ref={dropdownRef}
            className="absolute bottom-full left-8 sm:left-12 mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl max-h-72 overflow-y-auto min-w-64 sm:min-w-80 z-50 backdrop-blur-sm"
            style={{
                animation: 'slideUpFade 0.2s ease-out forwards'
            }}
            role="listbox"
            aria-label={t('chat.selectMember')}
        >
            <div className="p-2">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 mb-1">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {t('chat.selectMember')}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {items.length} {t('common.results')}
                    </span>
                </div>

                {/* Items List */}
                {items.length > 0 ? (
                    items.map((item, index) => {
                        const mentioned = isMentioned(item.id)
                        const isSelected = index === selectedIndex

                        return (
                            <div
                                key={item.id}
                                ref={el => itemRefs.current[index] = el}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-150 text-sm rounded-lg
                                    ${isSelected
                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-2 ring-indigo-500/50'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }
                                    ${mentioned ? 'opacity-60' : 'opacity-100'}
                                `}
                                onClick={() => onSelect(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                role="option"
                                aria-selected={isSelected}
                            >
                                {/* Avatar */}
                                <div className={`
                                    w-9 h-9 rounded-full flex items-center justify-center text-sm text-white shadow-sm
                                    ${item.type === 'agent'
                                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                                        : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                    }
                                    ${mentioned ? 'ring-2 ring-green-400 dark:ring-green-500' : ''}
                                `}>
                                    {item.avatar}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                        {highlightMatch(item.name, query)}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                        {item.type === 'agent' ? (
                                            <>
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                {t('chat.aiAgent')}
                                            </>
                                        ) : (
                                            <>
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                {t('chat.user')}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Mentioned Badge */}
                                {mentioned && (
                                    <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>{t('chat.mentioned')}</span>
                                    </div>
                                )}

                                {/* Selected Indicator */}
                                {isSelected && !mentioned && (
                                    <div className="text-indigo-600 dark:text-indigo-400">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    /* No Results */
                    <div className="flex flex-col items-center gap-2 px-3 py-6 text-slate-500 dark:text-slate-400">
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl">
                            🔍
                        </div>
                        <span className="text-sm font-medium">{t('messages.noMatches')}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            {t('chat.tryDifferentQuery')}
                        </span>
                    </div>
                )}

                {/* Keyboard Hints */}
                <div className="flex items-center justify-center gap-3 px-3 py-2 mt-1 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">↑↓</kbd>
                        {t('chat.navigate')}
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">↵</kbd>
                        {t('chat.select')}
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded">Esc</kbd>
                        {t('chat.close')}
                    </span>
                </div>
            </div>
        </div>
    )
}

export default MentionDropdown
