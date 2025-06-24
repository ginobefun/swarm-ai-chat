'use client'

import React, { useState } from 'react'
import { useTheme } from 'next-themes'
import { useTranslation } from '../contexts/AppContext'

interface ThemeToggleProps {
    className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
    const { t } = useTranslation()
    const { theme, setTheme } = useTheme()
    const [isOpen, setIsOpen] = useState(false)

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

    return (
        <div className={`theme-toggle ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="theme-toggle__button"
                title={t('navbar.theme')}
            >
                <span className="theme-icon">{getThemeIcon()}</span>
                <span className="theme-label">{getThemeLabel()}</span>
                <span className="dropdown-arrow">▼</span>
            </button>

            {isOpen && (
                <div className="theme-toggle__dropdown">
                    <button
                        onClick={() => handleThemeChange('light')}
                        className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    >
                        <span className="theme-icon">☀️</span>
                        <span>{t('navbar.lightMode')}</span>
                    </button>
                    <button
                        onClick={() => handleThemeChange('dark')}
                        className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    >
                        <span className="theme-icon">🌙</span>
                        <span>{t('navbar.darkMode')}</span>
                    </button>
                    <button
                        onClick={() => handleThemeChange('system')}
                        className={`theme-option ${theme === 'system' ? 'active' : ''}`}
                    >
                        <span className="theme-icon">💻</span>
                        <span>{t('navbar.systemMode')}</span>
                    </button>
                </div>
            )}

            {/* 点击外部关闭 */}
            {isOpen && (
                <div
                    className="theme-toggle__overlay"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <style jsx>{`
        .theme-toggle {
          position: relative;
          display: inline-block;
        }

        .theme-toggle__button {
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

        .theme-toggle__button:hover {
          background: var(--surface-secondary);
          border-color: var(--primary-color);
        }

        .theme-icon {
          font-size: 16px;
        }

        .theme-label {
          font-weight: 500;
        }

        .dropdown-arrow {
          font-size: 10px;
          transition: transform 0.2s ease;
          color: var(--text-muted);
        }

        .theme-toggle__button:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        .theme-toggle__dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          min-width: 160px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          z-index: 1000;
          overflow: hidden;
        }

        .theme-option {
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

        .theme-option:hover {
          background: var(--surface-secondary);
        }

        .theme-option.active {
          background: var(--primary-color);
          color: white;
        }

        .theme-option .theme-icon {
          font-size: 16px;
        }

        .theme-toggle__overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 999;
        }

        @media (max-width: 768px) {
          .theme-label {
            display: none;
          }
          
          .theme-toggle__button {
            padding: 8px;
          }
        }
      `}</style>
        </div>
    )
} 