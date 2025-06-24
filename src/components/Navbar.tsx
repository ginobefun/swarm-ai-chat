'use client'

import React, { useState } from 'react'

interface NavbarProps {
    onMenuClick?: () => void
    onCreateNew?: () => void
    onNotificationClick?: () => void
    onUserClick?: () => void
    onPublish?: () => void
}

const Navbar: React.FC<NavbarProps> = ({
    onMenuClick,
    onCreateNew,
    onNotificationClick,
    onUserClick,
    onPublish
}) => {
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
                title="菜单"
            >
                ☰
            </button>

            <div className="logo">SwarmAI</div>

            <form onSubmit={handleSearchSubmit} style={{ flex: 1, maxWidth: '480px' }}>
                <input
                    type="text"
                    className="search-bar"
                    placeholder="搜索对话、角色、文件..."
                    value={searchValue}
                    onChange={handleSearchChange}
                />
            </form>

            <div className="nav-actions">
                <button
                    className="nav-btn publish-btn"
                    onClick={onPublish}
                    title="发布"
                >
                    📤 发布
                </button>
                <button
                    className="nav-btn"
                    onClick={onNotificationClick}
                    title="通知"
                >
                    🔔
                </button>
                <button
                    className="nav-btn create-btn"
                    onClick={onCreateNew}
                    title="新建对话"
                >
                    + 新建
                </button>
                <button
                    className="nav-btn"
                    onClick={onUserClick}
                    title="用户菜单"
                >
                    👤
                </button>
            </div>
        </nav>
    )
}

export default Navbar 