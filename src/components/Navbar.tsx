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
            className="fixed top-0 left-0 right-0 h-[60px] bg-white/95 backdrop-blur-sm border-b border-gray-200 z-[1000] flex items-center px-6 gap-4 dark:bg-slate-900/95 dark:border-slate-700"
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
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-150 lg:hidden dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                onClick={onToggleSidebar}
                title={t('navbar.menu')}
                aria-label="Toggle sidebar navigation"
                aria-expanded={isSidebarOpen}
                aria-controls="sidebar-navigation"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* 
                Brand Logo/Title
                Flex-shrink-0 prevents logo from being compressed
                Uses brand color (indigo) with dark mode support
            */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                </div>
                <div
                    className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400"
                    role="banner"
                >
                    SwarmAI
                </div>
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
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        className="w-full h-10 bg-gray-100 rounded-lg border-0 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all duration-200 focus:bg-white focus:shadow-md focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:bg-slate-700"
                        placeholder={t('navbar.searchPlaceholder')}
                        value={searchValue}
                        onChange={handleSearchChange}
                        aria-label="Search conversations, agents, and files"
                        autoComplete="off"
                        spellCheck="false"
                    />
                </div>
            </form>

            {/* 
                Action Controls Container
                Positioned to the right with ml-auto
                Contains theme, language, and user action buttons
            */}
            <div className="flex items-center gap-3 ml-auto">
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
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-150"
                    onClick={onAgentDiscovery}
                    title={t('navbar.discoverAgents') || 'Discover AI Agents'} // Fallback for missing translation
                    aria-label="Discover AI agents and assistants"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                </button>

                {/* 
                    Primary Create New Button
                    Main call-to-action for creating new conversations
                    Uses brand color and hover effects for prominence
                    Responsive text: icon only on mobile, text + icon on desktop
                */}
                <button
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all duration-150 shadow-sm hover:shadow-md dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    onClick={onCreateNew}
                    title={t('navbar.createNew')}
                    aria-label="Create new conversation or session"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">新建</span>
                </button>

                {/* 
                    Notifications Button
                    Shows user notifications and updates
                    TODO: Add notification count badge
                */}
                <button
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-150 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-slate-100"
                    onClick={onNotificationClick}
                    title={t('navbar.notifications')}
                    aria-label="View notifications"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19H6.5A2.5 2.5 0 014 16.5v-9A2.5 2.5 0 016.5 5h9A2.5 2.5 0 0118 7.5V11" />
                    </svg>
                </button>

                {/* 
                    User Profile/Menu Button
                    Access to user account, settings, and profile
                    TODO: Consider dropdown menu for user options
                */}
                <button
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium text-sm transition-all duration-150 shadow-sm hover:shadow-md"
                    onClick={onUserClick}
                    title={t('navbar.userMenu')}
                    aria-label="User menu and account settings"
                    aria-haspopup="menu"
                >
                    U
                </button>
            </div>
        </nav>
    )
}

export default Navbar 