'use client'

import React, { useState } from 'react'
import { useTranslation } from '../contexts/AppContext'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'

interface NavbarProps {
    onMenuClick?: () => void
    onCreateNew?: () => void
    onNotificationClick?: () => void
    onUserClick?: () => void
    onAgentDiscovery?: () => void
}

const Navbar: React.FC<NavbarProps> = ({
    onMenuClick,
    onCreateNew,
    onNotificationClick,
    onUserClick,
    onAgentDiscovery
}) => {
    const { t } = useTranslation()
    const [searchValue, setSearchValue] = useState('')

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // 处理搜索逻辑
        console.log('搜索：', searchValue)
    }

    return (
        <nav className="navbar">
            <button
                className="menu-btn"
                onClick={onMenuClick}
                title={t('navbar.menu')}
            >
                ☰
            </button>

            <div className="logo">{t('navbar.logo')}</div>

            <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '480px' }}>
                <input
                    type="text"
                    className="search-bar"
                    placeholder={t('navbar.searchPlaceholder')}
                    value={searchValue}
                    onChange={handleSearchChange}
                />
            </form>

            <div className="nav-actions">
                <LanguageToggle className="nav-toggle" />
                <ThemeToggle className="nav-toggle" />

                <button
                    className="nav-btn"
                    onClick={onAgentDiscovery}
                    title="发现AI角色"
                >
                    🤖
                </button>
                <button
                    className="nav-btn"
                    onClick={onNotificationClick}
                    title={t('navbar.notifications')}
                >
                    🔔
                </button>
                <button
                    className="nav-btn create-btn"
                    onClick={onCreateNew}
                    title={t('navbar.createNew')}
                >
                    + {t('navbar.createNew')}
                </button>
                <button
                    className="nav-btn"
                    onClick={onUserClick}
                    title={t('navbar.userMenu')}
                >
                    👤
                </button>
            </div>
        </nav>
    )
}

export default Navbar 