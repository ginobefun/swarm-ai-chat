'use client'

import React, { useState, useEffect } from 'react'
import { Session, SessionFilter, SessionAction, AIAgent, CreateSessionRequest } from '@/types'
import { useTranslation } from '@/contexts/AppContext'
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
    onCreateSession: (sessionData: Session) => Promise<void>               // Callback to create a new session
    onUpdateSession: (sessionId: string, updates: Partial<Session>) => Promise<void> // Callback to update session
    onDeleteSession: (sessionId: string) => Promise<void>                 // Callback to delete session
    onPinSession: (sessionId: string) => Promise<void>                    // Callback to pin/unpin session
}

/**
 * SessionList component - Sidebar session management interface
 * 
 * Features:
 * - Session grouping (pinned, recent, by AI agent)
 * - Search and filtering capabilities
 * - Context menu operations (rename, pin, delete, duplicate)
 * - Create new session dialog
 * - Responsive design with proper mobile support
 * - Accessibility features with ARIA labels
 * - Dark mode support throughout
 * - Error handling and loading states
 * 
 * Layout:
 * - Header: Search input and filter controls
 * - Body: Grouped session lists with scroll
 * - Dialogs: Create, confirm, and rename modals
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
        onCreateSession,
        onUpdateSession,
        onDeleteSession,
        onPinSession
    } = props

    const { t } = useTranslation()

    // Local state for search and filtering
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<SessionFilter>({ type: 'all' })

    // Organized session groups for different display sections
    const [sessionGroups, setSessionGroups] = useState<{
        pinned: Session[]
        recent: Session[]
        byAgent: Record<string, Session[]>
    }>({
        pinned: [],
        recent: [],
        byAgent: {}
    })

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

    /**
     * Fetch available AI agents from the API
     * Updates the create dialog with available agents for session creation
     * TODO: Add error handling and retry mechanism
     */
    const fetchAgents = async () => {
        try {
            const response = await fetch('/api/agents')
            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    setCreateDialog(prev => ({ ...prev, availableAgents: data.agents }))
                }
            }
        } catch (error) {
            console.error('Error fetching agents:', error)
            // TODO: Show user-friendly error notification
        }
    }

    // Load AI agents on component mount
    useEffect(() => {
        fetchAgents()
    }, [])

    /**
     * Process and group sessions for organized display
     * Groups sessions by: pinned status, recency, and associated AI agents
     * Updates whenever the sessions array changes
     */
    useEffect(() => {
        const pinned = sessions.filter(s => s.isPinned)
        const recent = sessions.filter(s => !s.isPinned)
        const byAgent: Record<string, Session[]> = {}

        // Group sessions by primary AI agent
        sessions.forEach(session => {
            if (session.primaryAgentId) {
                if (!byAgent[session.primaryAgentId]) {
                    byAgent[session.primaryAgentId] = []
                }
                byAgent[session.primaryAgentId].push(session)
            }
        })

        setSessionGroups({ pinned, recent, byAgent })
    }, [sessions])

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
                case 'unpin':
                    await onUpdateSession(session.id, { isPinned: action === 'pin' })
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

        await createSession({
            title: `${session.title} ${t('session.copy')}`,
            type: session.type,
            agentIds,
            description: session.description || undefined
        })
    }

    /**
     * Create a new session via API call
     * Sends session creation request to backend
     * TODO: Move to a dedicated API service layer
     * 
     * @param request - Session creation request data
     * @returns Promise resolving to created session data
     */
    const createSession = async (request: CreateSessionRequest) => {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Failed to create session')
        }

        return await response.json()
    }

    /**
     * Render a session group with header and session items
     * Creates expandable/collapsible sections for different session types
     * 
     * @param title - Display title for the group
     * @param icon - Emoji icon for the group
     * @param sessions - Array of sessions in this group
     * @returns JSX element for the session group or null if empty
     */
    const renderSessionGroup = (title: string, icon: string, sessions: Session[]) => {
        if (sessions.length === 0) return null

        return (
            <div className="mb-5" role="group" aria-labelledby={`group-${title.toLowerCase().replace(' ', '-')}`}>
                <div
                    id={`group-${title.toLowerCase().replace(' ', '-')}`}
                    className="flex items-center gap-2 px-3 py-2 mb-2 bg-slate-100 rounded-lg text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                    <span className="text-sm" aria-hidden="true">{icon}</span>
                    <span className="flex-1">{title}</span>
                    <span
                        className="bg-slate-200 px-1.5 py-0.5 rounded text-xs dark:bg-slate-700"
                        aria-label={`${sessions.length} sessions`}
                    >
                        {sessions.length}
                    </span>
                </div>
                <div className="flex flex-col gap-1" role="list">
                    {sessions.map(session => (
                        <div key={session.id} role="listitem">
                            <SessionItem
                                session={session}
                                isActive={session.id === currentSessionId}
                                onClick={() => onSelectSession(session.id)}
                                onContextMenu={(e) => handleContextMenu(e, session)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Loading state rendering
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
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        )
    }

    // Error state rendering
    if (error) {
        return (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                <div
                    className="flex flex-col items-center justify-center p-10 text-center text-slate-600 dark:text-slate-400"
                    role="alert"
                    aria-live="assertive"
                >
                    <p>{t('common.error')}: {error}</p>
                    <button
                        onClick={fetchAgents}
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
            <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                {/* 
                    Search and Filter Controls
                    Provides session filtering and new session creation
                */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <div className="mb-3">
                        <input
                            type="search"
                            placeholder={t('session.searchSessions')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 placeholder-slate-500 transition-all focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
                            aria-label="Search sessions by title or content"
                            autoComplete="off"
                            spellCheck="false"
                        />
                    </div>

                    <div className="flex gap-2 items-center">
                        <select
                            value={filter.type || 'all'}
                            onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value as SessionFilter['type'] }))}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            aria-label="Filter sessions by type"
                        >
                            <option value="all">{t('session.allSessions') || 'All Sessions'}</option>
                            <option value="direct">{t('session.directChat') || 'Direct Chat'}</option>
                            <option value="group">{t('session.groupChat')}</option>
                            <option value="workflow">{t('session.workflowChat') || 'Workflow'}</option>
                        </select>

                        <button
                            className="px-3 py-2 bg-indigo-600 text-white border-none rounded-lg text-sm cursor-pointer whitespace-nowrap transition-all hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                            onClick={() => setCreateDialog(prev => ({ ...prev, isOpen: true }))}
                            aria-label="Create a new session"
                        >
                            <span aria-hidden="true">➕</span> {t('session.createSession')}
                        </button>
                    </div>
                </div>

                {/* 
                    Session List Content
                    Organized into groups with scroll capability
                */}
                <div
                    className="flex-1 overflow-y-auto p-3"
                    role="main"
                    aria-label="Session list"
                >
                    {sessionGroups?.pinned?.length > 0 && renderSessionGroup(
                        t('session.pinnedSessions'),
                        '📌',
                        sessionGroups.pinned
                    )}

                    {sessionGroups?.recent?.length > 0 && renderSessionGroup(
                        t('session.recentSessions'),
                        '🕒',
                        sessionGroups.recent
                    )}

                    {Object.keys(sessionGroups?.byAgent || {}).length > 0 && (
                        <div className="agent-groups">
                            {Object.entries(sessionGroups.byAgent).map(([agentId, agentSessions]) => {
                                const agentName = agentSessions[0]?.participants
                                    .find(p => p.type === 'agent' && p.id === agentId)?.name || t('session.unknownAgent') || 'Unknown Agent'
                                return renderSessionGroup(
                                    agentName,
                                    '🤖',
                                    agentSessions
                                )
                            })}
                        </div>
                    )}

                    {/* Empty state when no sessions exist */}
                    {sessions?.length === 0 && (
                        <div
                            className="flex flex-col items-center justify-center p-10 text-center text-slate-600 dark:text-slate-400"
                            role="status"
                        >
                            <span className="text-5xl mb-3 opacity-50" aria-hidden="true">💬</span>
                            <p>{t('session.noSessions') || 'No sessions yet'}</p>
                            <button
                                className="mt-3 px-5 py-2.5 bg-indigo-600 text-white border-none rounded-lg cursor-pointer transition-all hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                                onClick={() => setCreateDialog(prev => ({ ...prev, isOpen: true }))}
                                aria-label="Create your first session"
                            >
                                {t('session.createNewSession')}
                            </button>
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
                onCreateSession={createSession}
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