/* eslint-disable @next/next/no-img-element */
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../contexts/AppContext'
import { useSession } from '@/components/providers/AuthProvider'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { SwarmLogo } from './SwarmLogo'
import { LoginDialog } from './auth/LoginDialog'
import UserMenu from './UserMenu'

/**
 * Props interface for Navbar component
 * Defines all callback functions and state indicators for navbar interactions
 */
interface NavbarProps {
    onToggleSidebar?: () => void      // Toggle mobile sidebar visibility
    onToggleWorkspace?: () => void    // Toggle workspace panel visibility (future feature)
    isSidebarOpen?: boolean          // Current sidebar state for proper ARIA attributes
    isWorkspaceOpen?: boolean        // Current workspace state (future feature)
    onCreateNew?: () => void         // Handle create new session/chat action
}

/**
 * SwarmAI Navigation Bar
 * 
 * A modern, responsive navigation component for the multi-agent collaboration platform.
 * Implements design principles from design-guidelines.md:
 * 
 * Design Principles Applied:
 * 1. Clear Visual Hierarchy - Brand, search, and actions are properly structured
 * 2. User-Centered Design - Quick access to core functions (create, search, discover)
 * 3. Consistency - Unified design language and interaction patterns
 * 4. Feedback - Rich micro-interactions and state feedback
 * 5. Modern Aesthetics - Gradients, shadows, animations
 * 6. Breathing Room - Appropriate spacing and whitespace
 * 7. Accessibility - ARIA labels, keyboard navigation, semantic HTML
 * 8. Responsive Design - Adapts to different screen sizes
 * 
 * Mobile Optimizations:
 * - Logo completely hidden on mobile for space efficiency
 * - Search functionality hidden on mobile
 * - Compact control layout with optimized touch targets
 * - Enhanced dark mode adaptation
 * 
 * Features:
 * - Global search with keyboard shortcuts (⌘/Ctrl+K) - Desktop only
 * - Theme and language switching - Mobile optimized
 * - User profile menu with login state handling
 * - Mobile-responsive sidebar toggle
 * - Smooth animations and hover effects
 * - Enhanced dark mode support with improved contrast
 */
const Navbar: React.FC<NavbarProps> = ({
    onToggleSidebar,
    isSidebarOpen = false,
    onCreateNew,
}) => {
    const { t } = useTranslation()
    const { data: session, isPending } = useSession()
    const [searchValue, setSearchValue] = useState('')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)



    /**
     * Login success callback
     */
    const handleLoginSuccess = () => {
        // Handle post-login operations here
        console.log('Login successful')
    }

    // Calculate user authentication status
    const isLoggedIn = !!session?.user

    /**
     * Handle search input changes with debouncing potential for future optimization
     */
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value)
        // TODO: Implement debounced search API call
    }

    /**
     * Handle search form submission
     * Implements global search functionality as specified in PRD
     */
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchValue.trim()) {
            console.log('Search query:', searchValue)
            // TODO: Implement actual search functionality
            // Should search across: conversations, AI agents, files (as per PRD)
        }
    }

    /**
     * Enhanced keyboard navigation with modern shortcuts
     * Provides power-user efficiency as mentioned in design guidelines
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.metaKey || e.ctrlKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault()
                    // Focus search input for quick access (desktop only)
                    const searchInput = document.querySelector('#global-search') as HTMLInputElement
                    searchInput?.focus()
                    break
                case 'n':
                    e.preventDefault()
                    // Quick new session creation
                    onCreateNew?.()
                    break
                case 'b':
                    e.preventDefault()
                    // Toggle sidebar for navigation
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
            className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 z-[1000] flex items-center justify-between px-3 sm:px-4 lg:px-6 shadow-sm dark:bg-slate-900/95 dark:border-slate-700/50 dark:shadow-slate-900/20"
            role="navigation"
            aria-label={t('navbar.mainNavigation')}
            onKeyDown={handleKeyDown}
        >
            {/* Left Section: Mobile Toggle + Brand Logo (Desktop Only) */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-shrink-0">
                {/* Mobile Sidebar Toggle - Only visible on small screens */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex lg:hidden items-center justify-center w-10 h-10 sm:w-10 sm:h-10 rounded-xl bg-gray-100/90 hover:bg-gray-200/90 active:bg-gray-300/90 text-gray-700 hover:text-gray-900 transition-all duration-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 dark:active:bg-slate-600/90 dark:text-slate-300 dark:hover:text-slate-100 border border-gray-300/60 dark:border-slate-600/40 shadow-sm hover:shadow-md touch-manipulation"
                    onClick={onToggleSidebar}
                    title={t('navbar.toggleSidebar')}
                    aria-label={t('navbar.toggleSidebar')}
                    aria-expanded={isSidebarOpen}
                    aria-controls="main-sidebar"
                >
                    <motion.div
                        animate={isSidebarOpen ? { rotate: 90 } : { rotate: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </motion.div>
                </motion.button>

                {/* Brand Logo and Text - Hidden on Mobile for Space Optimization */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="hidden md:flex items-center gap-3 flex-shrink-0 group cursor-pointer"
                    role="banner"
                    onClick={() => window.location.href = '/'}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            window.location.href = '/'
                        }
                    }}
                >
                    <SwarmLogo size="md" showPulse={true} />

                    {/* Brand Text - Shown from medium screens up */}
                    <div className="flex flex-col">
                        <div className="text-base lg:text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                            {t('navbar.brandName')}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 font-medium hidden lg:block">
                            {t('navbar.brandTagline')}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Center Section: Global Search - Desktop Only */}
            <motion.form
                onSubmit={handleSearchSubmit}
                className="hidden lg:flex flex-1 max-w-sm mx-4"
                role="search"
                aria-label={t('navbar.globalSearch')}
                layout
            >
                <div className="relative group w-full">
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
                                <svg
                                    className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors dark:text-slate-500 dark:group-hover:text-indigo-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </motion.div>
                        </div>

                        {/* Search Input Field */}
                        <input
                            id="global-search"
                            type="search"
                            className="w-full h-10 bg-gray-50/90 rounded-xl border-0 pl-10 pr-16 text-sm text-gray-900 placeholder-gray-500 outline-none transition-all duration-300 focus:bg-white focus:shadow-lg focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:bg-slate-700/90 dark:focus:ring-indigo-400/20"
                            placeholder={t('navbar.searchPlaceholder')}
                            value={searchValue}
                            onChange={handleSearchChange}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                            aria-label={t('navbar.searchAriaLabel')}
                            autoComplete="off"
                            spellCheck="false"
                        />

                        {/* Keyboard Shortcut Hint */}
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div className="hidden xl:flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                                <kbd className="px-1.5 py-0.5 bg-gray-200/80 dark:bg-slate-700/80 rounded text-xs font-mono">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 bg-gray-200/80 dark:bg-slate-700/80 rounded text-xs font-mono">K</kbd>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.form>

            {/* Right Section: Action Controls - Mobile Optimized */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-fit">
                {/* Theme and Language Controls - Clean Mobile Layout */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <div className="scale-90 sm:scale-100">
                        <LanguageToggle />
                    </div>
                    <div className="scale-90 sm:scale-100">
                        <ThemeToggle />
                    </div>
                </div>

                {/* User Profile Menu */}
                {isLoggedIn ? (
                    // Logged in user: Show user menu
                    <UserMenu />
                ) : (
                    // Not logged in: Show login button
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md overflow-hidden group border-2 border-white/30 dark:border-slate-600/30 touch-manipulation"
                        onClick={() => setIsLoginDialogOpen(true)}
                        title={t('auth.signIn')}
                        aria-label={t('auth.signIn')}
                        disabled={isPending}
                        style={{
                            background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 50%, #64748b 100%)'
                        }}
                    >
                        {isPending ? (
                            // Loading state
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            // Not logged in: Show login icon
                            <>
                                <svg
                                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                {/* Login Hint Indicator */}
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 dark:bg-orange-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse"></div>
                            </>
                        )}
                    </motion.button>
                )}
            </div>

            {/* Login Dialog */}
            <LoginDialog
                isOpen={isLoginDialogOpen}
                onClose={() => setIsLoginDialogOpen(false)}
                onSuccess={handleLoginSuccess}
            />
        </motion.nav>
    )
}

export default Navbar