'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import SessionList from '@/components/session/SessionList'
import ChatArea from '@/components/chat/ChatArea'
import WelcomeGuide from '@/components/WelcomeGuide'
import ArtifactPanel from '@/components/artifact/ArtifactPanel'
import ErrorBoundary from '@/components/ErrorBoundary'
import { useSessionManager } from '@/hooks/useSessionManager'
import { useSession } from '@/components/providers/AuthProvider'
import { useArtifacts } from '@/hooks/useArtifacts'

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
    // User authentication state
    const { data: sessionData, isPending: authPending } = useSession()
    const user = sessionData?.user

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
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false) // Workspace panel visibility

    // Artifacts management for current session
    const { artifacts, togglePin } = useArtifacts({
        sessionId: currentSession?.id,
        enabled: !!currentSession?.id
    })

    // Determine if we should show the welcome guide
    const shouldShowWelcomeGuide = !authPending && (!user?.id || !currentSession)

    // Auto-open workspace panel when artifacts are present
    useEffect(() => {
        if (artifacts.length > 0 && !shouldShowWelcomeGuide) {
            setIsWorkspaceOpen(true)
        }
    }, [artifacts.length, shouldShowWelcomeGuide])

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
            setIsWorkspaceOpen(false)
        }
    }

    /**
     * Handle create session from welcome guide
     * Opens create session dialog from SessionList component
     */
    const handleCreateSessionFromWelcome = () => {
        // Trigger create session dialog in SessionList
        // This would need to be implemented with a ref or state management
        console.log('Create session from welcome guide')
        // For now, we'll automatically close sidebar on mobile after creating
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false)
            setIsWorkspaceOpen(false)
        }
    }

    /**
     * Handle explore agents from welcome guide
     * Navigate to agent discovery or show agent selection
     */
    const handleExploreAgents = () => {
        console.log('Explore agents from welcome guide')
        // TODO: Navigate to agent discovery page or show agent modal
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            {/* 
                Navigation bar with responsive controls
                Provides access to sidebar and workspace toggles on mobile 
            */}
            <Navbar />

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
                    Main Content Area
                    
                    Conditional rendering based on user state:
                    - Welcome Guide: When user is not logged in or no session is selected
                    - Chat Area: When user is logged in and has an active session
                    
                    Features:
                    - Flexible layout that adapts to available space
                    - Real-time message updates
                    - Session-aware content display
                */}
                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
                    {shouldShowWelcomeGuide ? (
                        <WelcomeGuide
                            onCreateSession={handleCreateSessionFromWelcome}
                            onExploreAgents={handleExploreAgents}
                        />
                    ) : (
                        <ErrorBoundary>
                            <ChatArea
                                session={currentSession}
                                onSessionUpdate={updateSession}
                            />
                        </ErrorBoundary>
                    )}
                </div>

                {/*
                    Artifact Panel

                    Responsive behavior:
                    - Hidden on mobile and tablet (< 1024px)
                    - Visible on desktop (>= 1024px)
                    - Can be toggled via navbar controls
                    - Auto-opens when artifacts are generated
                    - Hidden when showing welcome guide to give more space

                    Features:
                    - Display generated artifacts (code, documents, diagrams)
                    - Support multiple artifact types
                    - Pin/unpin artifacts
                    - Real-time updates based on current session
                */}
                {isWorkspaceOpen && !shouldShowWelcomeGuide && (
                    <div className="hidden lg:flex w-[360px] min-w-[320px] max-w-[400px] border-l border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                        <ErrorBoundary>
                            <ArtifactPanel
                                artifacts={artifacts}
                                isVisible={isWorkspaceOpen}
                                onClose={() => setIsWorkspaceOpen(false)}
                                onPin={togglePin}
                            />
                        </ErrorBoundary>
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