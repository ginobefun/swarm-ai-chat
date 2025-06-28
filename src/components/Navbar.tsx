'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../contexts/AppContext'
import { useSession } from '@/components/providers/AuthProvider'
import { LanguageToggle } from './LanguageToggle'
import { SwarmLogo } from './SwarmLogo'
import { LoginDialog } from './auth/LoginDialog'
import UserMenu from '@/components/profile/UserMenu'

/**
 * SwarmAI Navigation Bar
 * 
 * A modern, responsive navigation component for the multi-agent collaboration platform.
 * Implements design principles from design-guidelines.md:
 * 
 * Design Principles Applied:
 * 1. Clear Visual Hierarchy - Brand and actions are properly structured
 * 2. User-Centered Design - Quick access to core functions (create, discover)
 * 3. Consistency - Unified design language and interaction patterns
 * 4. Feedback - Rich micro-interactions and state feedback
 * 5. Modern Aesthetics - Gradients, shadows, animations
 * 6. Breathing Room - Appropriate spacing and whitespace
 * 7. Accessibility - ARIA labels, keyboard navigation, semantic HTML
 * 8. Responsive Design - Adapts to different screen sizes
 * 
 * Responsive Layout Strategy:
 * - All screen sizes show brand logo and name prominently
 * - Layout switching is handled by parent components
 * - Clean, consistent interface across all devices
 * 
 * Features:
 * - Theme and language switching - Mobile optimized
 * - User profile menu with login state handling
 * - Smooth animations and hover effects
 * - Enhanced dark mode support with improved contrast
 */
const Navbar: React.FC = () => {
    const { t } = useTranslation()
    const { data: session, isPending } = useSession()
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

    return (
        <motion.nav
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-white/95 backdrop-blur-xl border-b border-gray-200/80 z-[1000] flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm dark:bg-slate-900/95 dark:border-slate-700/50 dark:shadow-slate-900/20"
            role="navigation"
            aria-label={t('navbar.mainNavigation')}
        >
            {/* Left Section: Brand Logo and Name - Always Visible */}
            <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 flex-shrink-0 group cursor-pointer"
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
                <SwarmLogo size="lg" showPulse={true} />

                {/* Brand Text - Always visible with responsive text sizing */}
                <div className="flex flex-col">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                        {t('navbar.brandName')}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 font-medium hidden sm:block">
                        {t('navbar.brandTagline')}
                    </div>
                </div>
            </motion.div>

            {/* Right Section: Action Controls - Mobile Optimized */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-fit">
                {/* Theme and Language Controls - Clean Layout */}
                <div className="flex items-center gap-1.5">
                    <div>
                        <LanguageToggle />
                    </div>
                    {/* <div className="scale-90 sm:scale-100">
                        <ThemeToggle />
                    </div> */}
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
                        className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md overflow-hidden group border-2 border-white/30 dark:border-slate-600/30 touch-manipulation"
                        onClick={() => setIsLoginDialogOpen(true)}
                        title={t('auth.signIn')}
                        aria-label={t('auth.signIn')}
                        disabled={isPending}
                        style={{
                            background: 'linear-gradient(135deg, #64748b 0%, #94a3b8 50%, #475569 100%)'
                        }}
                    >
                        {isPending ? (
                            // Loading state with better dark mode contrast
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            // Not logged in: Show login icon
                            <>
                                <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                                {/* Login Hint Indicator with better dark mode visibility */}
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