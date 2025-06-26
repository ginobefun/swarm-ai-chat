'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../contexts/AppContext'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { SwarmLogo } from './SwarmLogo'

/**
 * Props interface for Navbar component
 * Defines all callback functions and state indicators for navbar interactions
 */
interface NavbarProps {
    onToggleSidebar?: () => void      // Toggle mobile sidebar visibility
    onToggleWorkspace?: () => void    // Toggle workspace panel visibility (currently unused)
    isSidebarOpen?: boolean          // Current sidebar state (currently unused)
    isWorkspaceOpen?: boolean        // Current workspace state (currently unused)
    onCreateNew?: () => void         // Handle create new session/chat action
    onNotificationClick?: () => void // Handle notification bell click
    onUserClick?: () => void         // Handle user profile/menu click
}

/**
 * SwarmAI Navbar - 现代化多智能体协作平台导航栏
 * 
 * 设计原则：
 * 1. 视觉层次清晰 - 品牌标识、搜索、主要操作按钮分层设计
 * 2. 以用户为中心 - 快速访问最重要的功能（创建、搜索、发现）
 * 3. 一致性 - 统一的设计语言和交互模式
 * 4. 反馈 - 丰富的微交互和状态反馈
 * 5. 现代化美学 - 渐变、阴影、动画等现代设计元素
 * 6. 呼吸感 - 合适的间距和留白
 */
const Navbar: React.FC<NavbarProps> = ({
    onToggleSidebar,
    isSidebarOpen,
    onCreateNew,
    onNotificationClick,
    onUserClick
}) => {
    const { t } = useTranslation()
    const [searchValue, setSearchValue] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    /**
     * Handle search input changes with enhanced UX
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    /**
     * Handle search form submission
     */
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Search query:', searchValue)
    }

    /**
     * Enhanced keyboard navigation with modern shortcuts
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.metaKey || e.ctrlKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault()
                    // Focus search input
                    const searchInput = document.querySelector('#global-search') as HTMLInputElement
                    searchInput?.focus()
                    break
                case 'n':
                    e.preventDefault()
                    onCreateNew?.()
                    break
                case 'b':
                    e.preventDefault()
                    onToggleSidebar?.()
                    break
            }
        }
    }

    return (
        <motion.nav
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-[1000] flex items-center justify-between px-6 dark:bg-slate-900/80 dark:border-slate-800"
            role="navigation"
            aria-label="主导航"
            onKeyDown={handleKeyDown}
        >
            {/* Left Section: Mobile Toggle + Brand Logo */}
            <div className="flex items-center gap-4 flex-shrink-0">
                {/* Mobile Sidebar Toggle with Enhanced Animation */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200 lg:hidden dark:bg-slate-800/50 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100 border border-gray-200/50 dark:border-slate-700/50"
                    onClick={onToggleSidebar}
                    title={t('navbar.menu')}
                    aria-label="切换侧边栏导航"
                    aria-expanded={isSidebarOpen}
                >
                    <motion.div
                        animate={isSidebarOpen ? { rotate: 90 } : { rotate: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </motion.div>
                </motion.button>

                {/* Enhanced Brand Logo with Gradient and Animation */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 flex-shrink-0 group cursor-pointer"
                    role="banner"
                >
                    {/* SwarmAI Logo */}
                    <SwarmLogo size="md" />

                    {/* Brand Text with Gradient */}
                    <div className="flex flex-col">
                        <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                            SwarmAI
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-medium hidden sm:block">
                            多智能体协作
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Enhanced Global Search with Modern Design */}
            <motion.form
                onSubmit={handleSearchSubmit}
                className="flex-1 max-w-sm mx-4"
                role="search"
                aria-label="全局搜索"
                layout
            >
                <div className="relative group">
                    <motion.div
                        animate={{
                            scale: isSearchFocused ? 1.02 : 1,
                            boxShadow: isSearchFocused
                                ? "0 8px 32px rgba(99, 102, 241, 0.15)"
                                : "0 2px 8px rgba(0, 0, 0, 0.05)"
                        }}
                        transition={{ duration: 0.2 }}
                        className="relative"
                    >
                        {/* Search Icon with Animation */}
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <motion.div
                                animate={isSearchFocused ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </motion.div>
                        </div>

                        {/* Enhanced Search Input */}
                        <input
                            id="global-search"
                            type="search"
                            className="w-full h-10 bg-gray-50/80 rounded-xl border-0 pl-10 pr-16 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:bg-slate-700/80 dark:focus:ring-indigo-400/20"
                            placeholder={t('navbar.searchPlaceholder')}
                            value={searchValue}
                            onChange={handleSearchChange}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            aria-label="搜索对话、智能体和文件"
                            autoComplete="off"
                            spellCheck="false"
                        />

                        {/* Search Shortcut Hint */}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div className="hidden lg:flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs font-mono">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs font-mono">K</kbd>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.form>

            {/* Right Action Controls with Enhanced Design */}
            <div className="flex items-center gap-4 flex-shrink-0 min-w-fit">

                {/* Theme and Language Controls */}
                <div className="flex items-center gap-4 px-3 py-2 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200/50 dark:border-slate-700/50">
                    <LanguageToggle />
                    <ThemeToggle />
                </div>

                {/* Notifications with Badge */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200 dark:bg-slate-800/50 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100 border border-gray-200/50 dark:border-slate-700/50"
                    onClick={onNotificationClick}
                    title={t('navbar.notifications')}
                    aria-label="查看通知"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h9A2.5 2.5 0 0118 7.5V11" />
                    </svg>
                    {/* Notification badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full border-2 border-white dark:border-slate-900"
                    />
                </motion.button>

                {/* Enhanced User Profile Menu */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 overflow-hidden group"
                    onClick={onUserClick}
                    title={t('navbar.userMenu')}
                    aria-label="用户菜单和账户设置"
                    aria-haspopup="menu"
                >
                    <span className="relative z-10">U</span>
                    {/* Animated border */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-2 border-white/30"
                    />
                </motion.button>
            </div>
        </motion.nav>
    )
}

export default Navbar