'use client'

import React, { useState } from 'react'
import { useTranslation } from '../contexts/AppContext'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'

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
    onAgentDiscovery?: () => void    // Handle AI agent discovery click
}

/**
 * Navbar component - Top navigation bar with responsive design
 * 
 * Features:
 * - Responsive layout with mobile-first approach
 * - Global search functionality
 * - Theme and language switching
 * - Quick action buttons (create, notifications, user menu)
 * - Accessibility support with proper ARIA labels
 * - Dark mode support throughout all elements
 * 
 * Layout:
 * - Mobile: Hamburger menu + logo + search + essential controls
 * - Desktop: Full navigation with all controls visible
 * 
 * @param props - NavbarProps containing callback functions and state
 * @returns JSX element representing the top navigation bar
 */
const Navbar: React.FC<NavbarProps> = ({
    onToggleSidebar,
    isSidebarOpen,        // TODO: Use for visual feedback
    onCreateNew,
    onNotificationClick,
    onUserClick,
    onAgentDiscovery
}) => {
    const { t } = useTranslation()

    // Local state for search functionality
    const [searchValue, setSearchValue] = useState('')

    /**
     * Handle search input changes
     * Updates local search state as user types
     * 
     * @param e - React change event from search input
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
    }

    /**
     * Handle search form submission
     * Processes search query and prevents default form behavior
     * TODO: Implement actual search functionality
     * 
     * @param e - React form submission event
     */
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // TODO: Implement comprehensive search functionality
        // Should search through: conversations, AI agents, files, messages
        console.log('Search query:', searchValue)

        // TODO: Clear search or navigate to search results page
        // setSearchValue('') // Optional: clear after search
    }

    /**
     * Handle keyboard navigation for accessibility
     * Provides keyboard shortcuts for common actions
     * 
     * @param e - Keyboard event
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Global keyboard shortcuts
        if (e.metaKey || e.ctrlKey) {
            switch (e.key) {
                case 'k': // Cmd/Ctrl + K for search focus
                    e.preventDefault()
                    // TODO: Focus search input
                    break
                case 'n': // Cmd/Ctrl + N for new chat
                    e.preventDefault()
                    onCreateNew?.()
                    break
                case 'b': // Cmd/Ctrl + B for sidebar toggle
                    e.preventDefault()
                    onToggleSidebar?.()
                    break
            }
        }
    }

    return (
        <nav
            className="fixed top-0 left-0 right-0 h-[60px] bg-white/90 backdrop-blur-xl border-b border-slate-200 z-[1000] flex items-center px-6 gap-4 dark:bg-slate-900/90 dark:border-slate-700"
            role="navigation"
            aria-label="Main navigation"
            onKeyDown={handleKeyDown}
        >
            {/* 
                Mobile Sidebar Toggle Button
                Hidden on desktop (lg:hidden), visible only on mobile/tablet
                Provides access to session list on smaller screens
            */}
            <button
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-150 lg:hidden dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                onClick={onToggleSidebar}
                title={t('navbar.menu')}
                aria-label="Toggle sidebar navigation"
                aria-expanded={isSidebarOpen}
                aria-controls="sidebar-navigation"
            >
                <span aria-hidden="true">☰</span>
            </button>

            {/* 
                Brand Logo/Title
                Flex-shrink-0 prevents logo from being compressed
                Uses brand color (indigo) with dark mode support
            */}
            <div
                className="text-lg font-bold text-indigo-600 flex-shrink-0 dark:text-indigo-400"
                role="banner"
            >
                {t('navbar.logo')}
            </div>

            {/* 
                Global Search Form
                Responsive design: takes available space up to max-width
                Includes proper form semantics and accessibility
            */}
            <form
                onSubmit={handleSearchSubmit}
                className="flex-1 max-w-lg"
                role="search"
                aria-label="Global search"
            >
                <input
                    type="search"
                    className="w-full h-9 bg-slate-100 rounded-full border-none px-4 text-sm text-slate-900 placeholder-slate-500 outline-none transition-all duration-200 focus:bg-white focus:shadow-md focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:bg-slate-700"
                    placeholder={t('navbar.searchPlaceholder')}
                    value={searchValue}
                    onChange={handleSearchChange}
                    aria-label="Search conversations, agents, and files"
                    autoComplete="off"
                    spellCheck="false"
                />
            </form>

            {/* 
                Action Controls Container
                Positioned to the right with ml-auto
                Contains theme, language, and user action buttons
            */}
            <div className="flex items-center gap-2 ml-auto">
                {/* Language and Theme Toggle Controls */}
                <LanguageToggle
                    className="nav-toggle"
                    aria-label="Switch language"
                />
                <ThemeToggle
                    className="nav-toggle"
                    aria-label="Switch theme"
                />

                {/* 
                    AI Agent Discovery Button
                    Allows users to discover and browse available AI agents
                */}
                <button
                    className="flex items-center justify-center min-w-9 h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-sm font-medium transition-all duration-150 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                    onClick={onAgentDiscovery}
                    title={t('navbar.discoverAgents') || 'Discover AI Agents'} // Fallback for missing translation
                    aria-label="Discover AI agents and assistants"
                >
                    <span aria-hidden="true">🤖</span>
                </button>

                {/* 
                    Notifications Button
                    Shows user notifications and updates
                    TODO: Add notification count badge
                */}
                <button
                    className="flex items-center justify-center min-w-9 h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-sm font-medium transition-all duration-150 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                    onClick={onNotificationClick}
                    title={t('navbar.notifications')}
                    aria-label="View notifications"
                // TODO: Add aria-describedby for notification count
                >
                    <span aria-hidden="true">🔔</span>
                </button>

                {/* 
                    Primary Create New Button
                    Main call-to-action for creating new conversations
                    Uses brand color and hover effects for prominence
                    Responsive text: icon only on mobile, text + icon on desktop
                */}
                <button
                    className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    onClick={onCreateNew}
                    title={t('navbar.createNew')}
                    aria-label="Create new conversation or session"
                >
                    <span className="text-base" aria-hidden="true">+</span>
                    <span className="hidden sm:inline">{t('navbar.createNew')}</span>
                </button>

                {/* 
                    User Profile/Menu Button
                    Access to user account, settings, and profile
                    TODO: Consider dropdown menu for user options
                */}
                <button
                    className="flex items-center justify-center min-w-9 h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-sm font-medium transition-all duration-150 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                    onClick={onUserClick}
                    title={t('navbar.userMenu')}
                    aria-label="User menu and account settings"
                    aria-haspopup="menu"
                >
                    <span aria-hidden="true">👤</span>
                </button>
            </div>
        </nav>
    )
}

export default Navbar 