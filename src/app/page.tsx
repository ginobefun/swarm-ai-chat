'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import SessionList from '@/components/session/SessionList'
import ChatArea from '@/components/chat/ChatArea'
import WorkspacePanel from '@/components/workspace/WorkspacePanel'
import { useSessionManager } from '@/hooks/useSessionManager'

/**
 * Home component - Main application page
 * 
 * This is the primary page component that orchestrates the entire SwarmAI.chat interface.
 * It implements a three-column layout: SessionList (sidebar), ChatArea (main), and WorkspacePanel (right).
 * Features include:
 * - Responsive design with mobile-first approach
 * - Session management and selection
 * - Dynamic sidebar and workspace panel visibility
 * - Real-time updates and error handling
 * 
 * @returns JSX element representing the complete application interface
 */
export default function Home() {
    // Session management hook provides all session-related functionality
    const {
        sessions,        // Array of user sessions
        currentSession,  // Currently selected session
        isLoading,      // Loading state for session operations
        error,          // Error state for session operations
        createSession,  // Function to create sessions
        selectSession,  // Function to select a session
        updateSession,  // Function to update session properties
        deleteSession   // Function to delete sessions
    } = useSessionManager()

    // UI state management for responsive design
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)    // Mobile sidebar visibility
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true) // Workspace panel visibility

    /**
     * Responsive layout control effect
     * Automatically adjusts sidebar and workspace visibility based on screen size
     * Implements mobile-first responsive design principles
     */
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth

            // Mobile: sidebar should be closed by default
            if (width >= 768) {
                setIsSidebarOpen(false) // Reset mobile sidebar state on larger screens
            }

            // Desktop: workspace should be visible by default
            if (width >= 1024) {
                setIsWorkspaceOpen(true) // Show workspace on desktop
            } else {
                setIsWorkspaceOpen(false) // Hide workspace on tablets and mobile
            }
        }

        // Initial setup and event listener for window resize
        handleResize()
        window.addEventListener('resize', handleResize)

        // Cleanup event listener on component unmount
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    /**
     * Handle session selection with mobile responsiveness
     * Automatically closes sidebar on mobile after session selection
     * 
     * @param sessionId - The ID of the session to select
     */
    const handleSelectSession = (sessionId: string) => {
        selectSession(sessionId)

        // On mobile, close sidebar after selecting a session for better UX
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false)
        }
    }

    /**
     * Toggle mobile sidebar visibility
     * Used primarily for mobile navigation
     */
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    /**
     * Toggle workspace panel visibility
     * Allows users to hide/show the workspace panel for more chat space
     */
    const toggleWorkspace = () => {
        setIsWorkspaceOpen(!isWorkspaceOpen)
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {/* 
                Navigation bar with responsive controls
                Provides access to sidebar and workspace toggles on mobile 
            */}
            <Navbar
                onToggleSidebar={toggleSidebar}
                onToggleWorkspace={toggleWorkspace}
                isSidebarOpen={isSidebarOpen}
                isWorkspaceOpen={isWorkspaceOpen}
            />

            {/* Main content area with proper top spacing to avoid navbar overlap */}
            <div className="flex flex-1 overflow-hidden pt-14 sm:pt-16">
                {/* 
                    Session List Sidebar
                    
                    Responsive behavior:
                    - Mobile: Overlay sidebar that slides in from left
                    - Desktop: Fixed sidebar always visible
                    
                    Accessibility features:
                    - Proper ARIA labels and focus management
                    - Keyboard navigation support
                */}
                <div className={`w-[320px] min-w-[280px] max-w-[360px] border-r border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col transition-transform duration-300 ${isSidebarOpen
                    ? 'fixed top-0 left-0 h-full z-50 translate-x-0 shadow-2xl md:relative md:h-full md:z-auto md:shadow-none'
                    : 'fixed top-0 left-0 h-full z-50 -translate-x-full shadow-2xl md:relative md:h-full md:z-auto md:translate-x-0 md:shadow-none'
                    }`}>
                    <SessionList
                        sessions={sessions}
                        currentSessionId={currentSession?.id}
                        isLoading={isLoading}
                        error={error}
                        onSelectSession={handleSelectSession}
                        onUpdateSession={updateSession}
                        onDeleteSession={deleteSession}
                        onCreateSession={createSession}
                    />
                </div>

                {/* 
                    Main Chat Area
                    
                    Features:
                    - Flexible layout that adapts to available space
                    - Real-time message updates
                    - Session-aware content display
                */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
                    <ChatArea
                        session={currentSession}
                        onSessionUpdate={updateSession}
                    />
                </div>

                {/* 
                    Workspace Panel
                    
                    Responsive behavior:
                    - Hidden on mobile and tablet (< 1024px)
                    - Visible on desktop (>= 1024px)
                    - Can be toggled via navbar controls
                    
                    Features:
                    - Session-aware content display
                    - Modular workspace components
                    - Real-time updates based on current session
                */}
                {isWorkspaceOpen && (
                    <div className="hidden lg:flex w-[360px] min-w-[320px] max-w-[400px] border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <WorkspacePanel session={currentSession} />
                    </div>
                )}
            </div>

            {/* 
                Mobile Sidebar Backdrop
                
                Provides:
                - Dark overlay when sidebar is open on mobile
                - Click-to-close functionality
                - Proper z-index stacking
                - Smooth transition animations
            */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                    role="button"
                    aria-label="Close sidebar"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            setIsSidebarOpen(false)
                        }
                    }}
                />
            )}
        </div>
    )
} 