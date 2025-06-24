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
        <div className={`language-toggle ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="language-toggle__button"
                title={t('navbar.language')}
            >
                <span className="language-flag">{currentLang.flag}</span>
                <span className="language-label">{currentLang.label}</span>
                <span className="dropdown-arrow">▼</span>
            </button>

            {isOpen && (
                <div className="language-toggle__dropdown">
                    {languages.map((lang) => (
                        <button
                            key={lang.key}
                            onClick={() => handleLanguageChange(lang.key)}
                            className={`language-option ${locale === lang.key ? 'active' : ''}`}
                        >
                            <span className="language-flag">{lang.flag}</span>
                            <span>{lang.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* 点击外部关闭 */}
            {isOpen && (
                <div
                    className="language-toggle__overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <style jsx>{`
        .language-toggle {
          position: relative;
          display: inline-block;
        }

        .language-toggle__button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .language-toggle__button:hover {
          background: var(--surface-secondary);
          border-color: var(--primary-color);
        }

        .language-flag {
          font-size: 16px;
        }

        .language-label {
          font-weight: 500;
        }

        .dropdown-arrow {
          font-size: 10px;
          transition: transform 0.2s ease;
          color: var(--text-muted);
        }

        .language-toggle__button:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .language-toggle__dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          min-width: 140px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          z-index: 1000;
          overflow: hidden;
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 14px;
          text-align: left;
          transition: background 0.2s ease;
        }

        .language-option:hover {
          background: var(--surface-secondary);
        }

        .language-option.active {
          background: var(--primary-color);
          color: white;
        }

        .language-option .language-flag {
          font-size: 16px;
        }

        .language-toggle__overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        @media (max-width: 768px) {
          .language-label {
            display: none;
          }
          
          .language-toggle__button {
            padding: 8px;
          }
        }
      `}</style>
        </div>
    )
} 