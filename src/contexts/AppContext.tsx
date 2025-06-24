'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { LocaleKey, Messages, locales } from '../i18n/locales'

// 语言上下文
interface LanguageContextType {
    locale: LocaleKey
    messages: Messages
    setLocale: (locale: LocaleKey) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
    children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [locale, setLocaleState] = useState<LocaleKey>('zh-CN')

    // 初始化语言设置
    useEffect(() => {
        // 优先从 localStorage 读取
        const savedLocale = localStorage.getItem('swarm-locale') as LocaleKey
        if (savedLocale && locales[savedLocale]) {
            setLocaleState(savedLocale)
            return
        }

        // 检测浏览器语言
        const browserLang = navigator.language
        if (browserLang.startsWith('en')) {
            setLocaleState('en')
        } else {
            setLocaleState('zh-CN')
        }
    }, [])

    const setLocale = (newLocale: LocaleKey) => {
        setLocaleState(newLocale)
        localStorage.setItem('swarm-locale', newLocale)
    }

    const messages = locales[locale]

    const value = {
        locale,
        messages,
        setLocale,
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

// 自定义 Hook
export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

// 快捷翻译函数
export const useTranslation = () => {
    const { messages } = useLanguage()

    // 安全的翻译函数，支持嵌套路径
    const t = (key: string): string => {
        const keys = key.split('.')
        let value: unknown = messages

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = (value as Record<string, unknown>)[k]
            } else {
                console.warn(`Translation key not found: ${key}`)
                return key // 返回 key 作为默认值
            }
        }

        return typeof value === 'string' ? value : key
    }

    return { t, messages }
}
