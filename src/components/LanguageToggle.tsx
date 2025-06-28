'use client'

import React, { useState } from 'react'
import { useLanguage, useTranslation } from '../contexts/AppContext'
import { LocaleKey } from '../i18n/locales'

interface LanguageToggleProps {
    className?: string
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
    const { locale, setLocale } = useLanguage()
    const { t } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)

    // 语言选项
    const languages = [
        { key: 'zh-CN' as LocaleKey, label: '简体中文', flag: '🇨🇳' },
        { key: 'en' as LocaleKey, label: 'English', flag: '🇺🇸' },
    ]

    // 获取当前语言信息
    const getCurrentLanguage = () => {
        return languages.find(lang => lang.key === locale) || languages[0]
    }

    // 切换语言
    const handleLanguageChange = (newLocale: LocaleKey) => {
        setLocale(newLocale)
        setIsOpen(false)
    }

    const currentLang = getCurrentLanguage()

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-2 text-slate-700 cursor-pointer text-sm font-medium transition-all duration-200 hover:border-indigo-500 dark:text-slate-200 ${className}`}
                title={t('navbar.language')}
            >
                <span className="text-base">{currentLang.flag}</span>
                <span className="font-medium inline">{currentLang.label}</span>
                <span className={`text-sm text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 min-w-36 bg-white border border-slate-300 rounded-lg shadow-lg z-[1000] overflow-hidden dark:bg-slate-800 dark:border-slate-600">
                    {languages.map((lang) => (
                        <button
                            key={lang.key}
                            onClick={() => handleLanguageChange(lang.key)}
                            className={`flex items-center gap-3 w-full px-4 py-3 text-sm text-left transition-colors duration-200 ${locale === lang.key
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            <span className="text-base">{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
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