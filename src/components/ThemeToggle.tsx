'use client'

import React, { useState, useEffect } from 'react'
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

    // Only render after hydration to prevent mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    // 切换主题
    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme)
        setIsOpen(false)
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
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer text-sm font-medium transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95 ${className}`}
                title={t('navbar.theme')}
                aria-label={t('navbar.theme')}
            >
                <span className="text-lg">{getThemeIcon()}</span>
                <span className="font-medium hidden md:inline">{getThemeLabel()}</span>
                <span className={`text-xs text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 min-w-44 bg-white border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-[1000] overflow-hidden dark:bg-slate-800">
                    <button
                        onClick={() => handleThemeChange('light')}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors duration-200 ${theme === 'light'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <span className="text-lg">☀️</span>
                        <span className="font-medium">{t('navbar.lightMode')}</span>
                    </button>
                    <button
                        onClick={() => handleThemeChange('dark')}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors duration-200 ${theme === 'dark'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <span className="text-lg">🌙</span>
                        <span className="font-medium">{t('navbar.darkMode')}</span>
                    </button>
                    <button
                        onClick={() => handleThemeChange('system')}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors duration-200 ${theme === 'system'
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                    >
                        <span className="text-lg">💻</span>
                        <span className="font-medium">{t('navbar.systemMode')}</span>
                    </button>
                </div>
            )}

            {/* 点击外部关闭 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[999]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
} 