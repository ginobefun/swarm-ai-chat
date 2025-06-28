'use client'

import React, { useState, useEffect } from 'react'
import { Session, SessionAction, AIAgent, CreateSessionRequest } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
import { useSession } from '@/components/providers/AuthProvider'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SessionItem from './SessionItem'
import SessionContextMenu from './SessionContextMenu'
import CreateSessionDialog from './CreateSessionDialog'
import ConfirmDialog from './ConfirmDialog'
import InlineRenameInput from './InlineRenameInput'

/**
 * Props interface for SessionList component
 * Defines all required and optional properties for session management
 */
interface SessionListProps {
    sessions: Session[]                                                      // Array of user sessions
    currentSessionId?: string                                               // ID of currently selected session
    isLoading: boolean                                                      // Loading state for session operations
    error: string | null                                                   // Error message if session loading fails
    onSelectSession: (sessionId: string) => void                          // Callback when a session is selected
    onUpdateSession: (sessionId: string, updates: Partial<Session>) => Promise<void> // Callback to update session
    onDeleteSession: (sessionId: string) => Promise<void>                 // Callback to delete session
    onCreateSession: (sessionData: CreateSessionRequest) => Promise<void>  // Callback to create session
}

/**
 * SessionList component - Sidebar session management interface
 * 
 * Features:
 * - User authentication state awareness
 * - Beautiful login guidance for unauthenticated users
 * - Natural flat session list (WeChat-style)
 * - Search and filtering capabilities
 * - Context menu operations (rename, pin, delete, duplicate)
 * - Create new session dialog
 * - Responsive design with proper mobile support
 * - Accessibility features with ARIA labels
 * - Dark mode support throughout
 * - Error handling and loading states
 * 
 * Layout:
 * - Unauthenticated: Login guidance interface
 * - Authenticated: Session management interface
 * 
 * @param props - SessionListProps containing session data and handlers
 * @returns JSX element representing the session list sidebar
 */
const SessionList: React.FC<SessionListProps> = (props) => {
    const {
        sessions,
        currentSessionId,
        isLoading,
        error,
        onSelectSession,
        onUpdateSession,
        onDeleteSession,
        onCreateSession
    } = props

    const { t } = useTranslation()

    // Get user authentication state
    const { data: sessionData, isPending: authPending } = useSession()
    const user = sessionData?.user

    // Login dialog state
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

    // Local state for search
    const [searchQuery, setSearchQuery] = useState('')

    // Filtered and sorted sessions (pinned first, then by update time)
    const [filteredSessions, setFilteredSessions] = useState<Session[]>([])

    // Context menu state for right-click operations
    const [contextMenu, setContextMenu] = useState<{
        session: Session | null
        position: { x: number; y: number }
        isOpen: boolean
    }>({
        session: null,
        position: { x: 0, y: 0 },
        isOpen: false
    })

    // Create session dialog state
    const [createDialog, setCreateDialog] = useState({
        isOpen: false,
        availableAgents: [] as AIAgent[]
    })

    // Confirmation dialog state for destructive operations
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        isLoading: false
    })

    // Rename dialog state for inline session renaming
    const [renameDialog, setRenameDialog] = useState({
        isOpen: false,
        session: null as Session | null
    })

    // Load AI agents when user authentication state changes
    useEffect(() => {
        /**
         * Fetch available AI agents from the API
         * Updates the create dialog with available agents for session creation
         * Only fetches if user is authenticated
         */
        const fetchAgents = async () => {
            try {
                if (!user?.id) {
                    console.log('User not authenticated, skipping agent fetch')
                    return
                }

                const response = await fetch('/api/agents')
                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setCreateDialog(prev => ({ ...prev, availableAgents: data.data }))
                    }
                }
            } catch (error) {
                console.error('Error fetching agents:', error)
                // TODO: Show user-friendly error notification
            }
        }

        if (!authPending && user?.id) {
            fetchAgents()
        }
    }, [user?.id, authPending])

    /**
     * Filter and sort sessions
     * WeChat-style: pinned sessions first, then sorted by update time
     * No grouping, just natural flat list
     */
    useEffect(() => {
        // Filter sessions based on search query
        const filtered = sessions.filter(session => {
            if (!searchQuery.trim()) return true

            const query = searchQuery.toLowerCase()
            return (
                session.title?.toLowerCase().includes(query) ||
                session.description?.toLowerCase().includes(query) ||
                session.participants.some(p =>
                    p.name.toLowerCase().includes(query) ||
                    p.type.toLowerCase().includes(query)
                )
            )
        })

        // Sort: pinned first, then by update time (newest first)
        const sorted = [...filtered].sort((a, b) => {
            // Pinned sessions always come first
            if (a.isPinned && !b.isPinned) return -1
            if (!a.isPinned && b.isPinned) return 1
            
            // Then sort by update time
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        })

        setFilteredSessions(sorted)
    }, [sessions, searchQuery])

    /**
     * Handle context menu display for session operations
     * Shows context menu at cursor position with session-specific actions
     * 
     * @param e - React mouse event containing cursor position
     * @param session - Session object for which to show context menu
     */
    const handleContextMenu = (e: React.MouseEvent, session: Session) => {
        e.preventDefault()
        setContextMenu({
            session,
            position: { x: e.clientX, y: e.clientY },
            isOpen: true
        })
    }

    /**
     * Process context menu actions with proper error handling
     * Handles: rename, pin/unpin, archive, delete, duplicate operations
     * 
     * @param action - The session action to perform
     */
    const handleSessionAction = async (action: SessionAction) => {
        if (!contextMenu.session) return

        try {
            const session = contextMenu.session

            switch (action) {
                case 'rename':
                    setRenameDialog({
                        isOpen: true,
                        session
                    })
                    break

                case 'pin':
                    await onUpdateSession(session.id, { isPinned: true })
                    break

                case 'unpin':
                    await onUpdateSession(session.id, { isPinned: false })
                    break

                case 'archive':
                    await onUpdateSession(session.id, { isArchived: true })
                    break

                case 'delete':
                    setConfirmDialog({
                        isOpen: true,
                        title: t('session.confirmDelete'),
                        message: t('session.confirmDeleteMessage'),
                        onConfirm: () => handleDeleteSession(session.id),
                        isLoading: false
                    })
                    break

                case 'duplicate':
                    await duplicateSession(session)
                    break

                case 'export':
                    await exportSession(session)
                    break

                default:
                    console.warn('Unknown session action:', action)
            }
        } catch (error) {
            console.error('Error handling session action:', error)
            // TODO: Replace alert with toast notification system
            alert(t('session.operationFailed') + ', ' + t('session.retryLater'))
        } finally {
            // Close context menu after action
            setContextMenu(prev => ({ ...prev, isOpen: false }))
        }
    }

    /**
     * Handle session deletion with loading state management
     * Provides user feedback during deletion process
     * 
     * @param sessionId - ID of the session to delete
     */
    const handleDeleteSession = async (sessionId: string) => {
        try {
            setConfirmDialog(prev => ({ ...prev, isLoading: true }))
            await onDeleteSession(sessionId)
            setConfirmDialog(prev => ({ ...prev, isOpen: false, isLoading: false }))
        } catch (error) {
            console.error('Error deleting session:', error)
            setConfirmDialog(prev => ({ ...prev, isLoading: false }))
            // TODO: Show error notification to user
        }
    }

    /**
     * Handle session renaming with validation
     * Updates session title and closes rename dialog
     * 
     * @param newTitle - New title for the session
     */
    const handleRename = async (newTitle: string) => {
        if (!renameDialog.session) return

        try {
            await onUpdateSession(renameDialog.session.id, { title: newTitle })
            setRenameDialog({ isOpen: false, session: null })
        } catch (error) {
            console.error('Error renaming session:', error)
            throw error // Let rename component handle error display
        }
    }

    /**
     * Create a duplicate copy of an existing session
     * Preserves session type, participants, and adds "copy" suffix to title
     * 
     * @param session - Session to duplicate
     */
    const duplicateSession = async (session: Session) => {
        const agentIds = session.participants
            .filter(p => p.type === 'agent')
            .map(p => p.id)

        await onCreateSession({
            title: `${session.title} ${t('session.copy')}`,
            type: session.type,
            agentIds,
            description: session.description || undefined
        })
    }

    /**
     * Export session data to file
     * Creates downloadable JSON file with session details and metadata
     * 
     * @param session - Session to export
     */
    const exportSession = async (session: Session) => {
        try {
            // Prepare session export data
            const exportData = {
                session: {
                    id: session.id,
                    title: session.title,
                    description: session.description,
                    type: session.type,
                    status: session.status,
                    messageCount: session.messageCount,
                    totalCost: session.totalCost,
                    createdAt: session.createdAt,
                    updatedAt: session.updatedAt,
                    participants: session.participants.map(p => ({
                        id: p.id,
                        type: p.type,
                        name: p.name
                    }))
                },
                metadata: {
                    exportedAt: new Date().toISOString(),
                    exportedBy: 'SwarmAI.chat',
                    version: '1.0'
                }
            }

            // Create and download file
            const fileName = `session-${session.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'untitled'}-${new Date().toISOString().split('T')[0]}.json`
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)

            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            console.log('Session exported successfully:', fileName)
        } catch (error) {
            console.error('Error exporting session:', error)
            // TODO: Replace alert with toast notification system
            alert(t('session.operationFailed') + ', ' + t('session.retryLater'))
        }
    }

    /**
     * Handle successful login
     * Closes the login dialog and refreshes the session state
     */
    const handleLoginSuccess = () => {
        setIsLoginDialogOpen(false)
        // The session will be automatically refreshed by the AuthProvider
    }

    /**
     * Render login guidance interface for unauthenticated users
     * Beautiful and engaging interface that encourages user to log in
     */
    const renderLoginGuidance = () => (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            <div className="flex flex-col items-center justify-center flex-1 p-8 text-center">
                {/* Welcome title without logo */}
                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400 mb-2">
                        {t('session.welcomeToSwarm')}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {t('session.loginToUnlock')}
                    </p>
                </div>

                {/* Feature highlights */}
                <div className="space-y-4 mb-8 max-w-sm">
                    <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400">🤖</span>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t('session.multiAgentChat')}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{t('session.multiAgentDesc')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                            <span className="text-purple-600 dark:text-purple-400">⚡</span>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t('session.smartWorkflows')}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{t('session.workflowDesc')}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-left">
                        <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/50 rounded-lg flex items-center justify-center">
                            <span className="text-pink-600 dark:text-pink-400">💾</span>
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">{t('session.sessionManager')}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{t('session.sessionDesc')}</p>
                        </div>
                    </div>
                </div>

                {/* Login button */}
                <div className="space-y-3">
                    <button
                        onClick={() => setIsLoginDialogOpen(true)}
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                        {t('session.loginToGetStarted')}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('session.freeToUse')}
                    </p>
                </div>
            </div>
        </div>
    )

    // Show loading state when authentication is pending
    if (authPending) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                <div
                    className="flex flex-col items-center justify-center p-10 text-center text-slate-600 dark:text-slate-400"
                    role="status"
                    aria-live="polite"
                >
                    <div
                        className="w-8 h-8 border-3 border-slate-300 border-t-indigo-600 rounded-full animate-spin mb-3 dark:border-slate-600 dark:border-t-indigo-400"
                        aria-hidden="true"
                    ></div>
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        )
    }

    // Show login guidance for unauthenticated users
    if (!user?.id) {
        return (
            <>
                {renderLoginGuidance()}
                <LoginDialog
                    isOpen={isLoginDialogOpen}
                    onClose={() => setIsLoginDialogOpen(false)}
                    onSuccess={handleLoginSuccess}
                />
            </>
        )
    }

    // Loading state rendering for authenticated users
    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                <div
                    className="flex flex-col items-center justify-center p-10 text-center text-slate-600 dark:text-slate-400"
                    role="status"
                    aria-live="polite"
                >
                    <div
                        className="w-8 h-8 border-3 border-slate-300 border-t-indigo-600 rounded-full animate-spin mb-3 dark:border-slate-600 dark:border-t-indigo-400"
                        aria-hidden="true"
                    ></div>
                    <p>{t('session.loadingSessions')}</p>
                </div>
            </div>
        )
    }

    // Error state rendering for authenticated users
    if (error) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                <div
                    className="flex flex-col items-center justify-center p-10 text-center text-slate-600 dark:text-slate-400"
                    role="alert"
                    aria-live="assertive"
                >
                    <span className="text-4xl mb-3 opacity-50" aria-hidden="true">⚠️</span>
                    <p className="mb-2">{t('common.error')}: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 bg-indigo-600 text-white border-none rounded-lg cursor-pointer hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        aria-label="Retry loading sessions"
                    >
                        {t('common.retry') || 'Retry'}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950">
                {/* 
                    Search and Create Controls - WeChat Style
                    Long search bar with icon-only create button
                */}
                <div className="p-3 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex gap-2 items-center">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <Input
                                type="search"
                                placeholder={t('session.searchSessions')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-slate-100 dark:bg-slate-800 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-300 dark:focus:border-slate-600 transition-all duration-200"
                                aria-label="Search sessions by title or content"
                                autoComplete="off"
                                spellCheck="false"
                            />
                        </div>

                        <Button
                            size="icon"
                            className="h-9 w-9 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
                            onClick={() => setCreateDialog(prev => ({ ...prev, isOpen: true }))}
                            aria-label="Create a new session"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </Button>
                    </div>
                </div>

                {/* 
                    Session List Content - Flat list without grouping
                    WeChat-style natural flow with pinned sessions first
                */}
                <div
                    className="flex-1 overflow-y-auto custom-scrollbar"
                    role="main"
                    aria-label="Session list"
                >
                    {filteredSessions.map(session => (
                        <SessionItem
                            key={session.id}
                            session={session}
                            isActive={session.id === currentSessionId}
                            onClick={() => onSelectSession(session.id)}
                            onContextMenu={(e) => handleContextMenu(e, session)}
                        />
                    ))}

                    {/* Empty state when no sessions exist */}
                    {sessions?.length === 0 && (
                        <div
                            className="flex flex-col items-center justify-center p-10 text-center text-slate-500 dark:text-slate-400"
                            role="status"
                        >
                            <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <span className="text-3xl opacity-50" aria-hidden="true">💬</span>
                            </div>
                            <p className="mb-2 text-sm font-medium">{t('session.noSessions') || 'No sessions yet'}</p>
                            <p className="text-xs opacity-70">{t('session.createFirstSession')}</p>
                        </div>
                    )}

                    {/* No results state when search yields nothing */}
                    {sessions?.length > 0 && filteredSessions.length === 0 && searchQuery && (
                        <div
                            className="flex flex-col items-center justify-center p-10 text-center text-slate-500 dark:text-slate-400"
                            role="status"
                        >
                            <div className="w-16 h-16 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                <span className="text-3xl opacity-50" aria-hidden="true">🔍</span>
                            </div>
                            <p className="text-sm font-medium">{t('session.noSearchResults') || 'No results found'}</p>
                            <p className="text-xs opacity-70 mt-1">{t('session.tryDifferentKeywords') || 'Try different keywords'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu for Session Operations */}
            {contextMenu.session && (
                <SessionContextMenu
                    session={contextMenu.session}
                    isOpen={contextMenu.isOpen}
                    position={contextMenu.position}
                    onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
                    onAction={handleSessionAction}
                />
            )}

            {/* Create Session Dialog */}
            <CreateSessionDialog
                isOpen={createDialog.isOpen}
                onClose={() => setCreateDialog(prev => ({ ...prev, isOpen: false }))}
                onCreateSession={onCreateSession}
                availableAgents={createDialog.availableAgents}
            />

            {/* Confirmation Dialog for Destructive Operations */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.title}
                message={confirmDialog.message}
                isLoading={confirmDialog.isLoading}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
            />

            {/* Inline Rename Dialog */}
            <InlineRenameInput
                isOpen={renameDialog.isOpen}
                initialValue={renameDialog.session?.title || ''}
                onSave={handleRename}
                onCancel={() => setRenameDialog({ isOpen: false, session: null })}
            />
        </>
    )
}

export default SessionList 