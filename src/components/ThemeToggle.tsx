'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from '../contexts/AppContext'

interface ThemeToggleProps {
    className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const { t } = useTranslation()
    const { theme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [focusedIndex, setFocusedIndex] = useState(0)
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Theme options for keyboard navigation
    const themeOptions = ['light', 'dark', 'system'] as const

    // Only render after hydration to prevent mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // Set focused index based on current theme when menu opens
    useEffect(() => {
        if (isOpen && theme) {
            const index = themeOptions.indexOf(theme as typeof themeOptions[number])
            setFocusedIndex(index >= 0 ? index : 0)
        }
    }, [isOpen, theme])

    // 切换主题
    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme)
        setIsOpen(false)
        // Return focus to trigger button
        buttonRef.current?.focus()
    }

    // 键盘导航处理
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            // Open menu with ArrowDown or ArrowUp
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault()
                setIsOpen(true)
            }
            return
        }

        switch (e.key) {
            case 'Escape':
                e.preventDefault()
                setIsOpen(false)
                buttonRef.current?.focus()
                break
            case 'ArrowDown':
                e.preventDefault()
                setFocusedIndex((prev) => (prev + 1) % themeOptions.length)
                break
            case 'ArrowUp':
                e.preventDefault()
                setFocusedIndex((prev) => (prev - 1 + themeOptions.length) % themeOptions.length)
                break
            case 'Enter':
            case ' ':
                e.preventDefault()
                handleThemeChange(themeOptions[focusedIndex])
                break
            case 'Home':
                e.preventDefault()
                setFocusedIndex(0)
                break
            case 'End':
                e.preventDefault()
                setFocusedIndex(themeOptions.length - 1)
                break
            default:
                break
        }
    }

    // 获取当前主题图标
    const getThemeIcon = () => {
        switch (theme) {
            case 'light':
                return '☀️'
            case 'dark':
                return '🌙'
            case 'system':
                return '💻'
            default:
                return '💻'
        }
    }

    // 获取当前主题文案
    const getThemeLabel = () => {
        switch (theme) {
            case 'light':
                return t('navbar.lightMode')
            case 'dark':
                return t('navbar.darkMode')
            case 'system':
                return t('navbar.systemMode')
            default:
                return t('navbar.systemMode')
        }
    }

    // Get theme data
    const themeData = [
        { value: 'light', icon: '☀️', label: t('navbar.lightMode') },
        { value: 'dark', icon: '🌙', label: t('navbar.darkMode') },
        { value: 'system', icon: '💻', label: t('navbar.systemMode') },
    ]

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return (
            <div className="relative inline-block">
                <button
                    className={`flex items-center gap-2 px-3 py-2 text-slate-700 cursor-pointer text-sm font-medium transition-all duration-200 hover:border-indigo-500 dark:text-slate-200 ${className}`}
                    title={t('navbar.theme')}
                    disabled
                >
                    <span className="text-base">💻</span>
                    <span className="font-medium hidden md:inline">{t('navbar.systemMode')}</span>
                    <span className="text-xs text-slate-400">▼</span>
                </button>
            </div>
        )
    }

    return (
        <div className="relative inline-block" onKeyDown={handleKeyDown}>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-900 ${className}`}
                title={t('navbar.theme')}
                aria-label={t('navbar.theme')}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <span className="text-lg">{getThemeIcon()}</span>
                <span className="font-medium hidden md:inline">{getThemeLabel()}</span>
                <span className={`text-xs text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div
                    className="absolute top-full right-0 mt-2 min-w-48 bg-white border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg dark:shadow-slate-950/40 z-[1000] overflow-hidden dark:bg-slate-800"
                    role="menu"
                    aria-orientation="vertical"
                >
                    {themeData.map((item, index) => (
                        <button
                            key={item.value}
                            onClick={() => handleThemeChange(item.value)}
                            className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors duration-200 ${
                                theme === item.value
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                                    : focusedIndex === index
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                            role="menuitem"
                            tabIndex={-1}
                            aria-current={theme === item.value ? 'true' : undefined}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                            {focusedIndex === index && (
                                <span className="ml-auto text-xs opacity-70">
                                    {theme === item.value ? '✓' : '→'}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* 点击外部关闭 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[999]"
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    )
}
