'use client'

import React, { useState } from 'react'
import { CreateSessionDialogProps } from '@/types'
import { useTranslation } from '@/contexts/AppContext'

/**
 * CreateSessionDialog component - Modal dialog for creating new chat sessions
 * 
 * Features:
 * - Session information input (title, description)
 * - AI agent selection with search and filtering
 * - Visual agent display with avatars and specialties
 * - Form validation and error handling
 * - Responsive design for mobile and desktop
 * - Accessibility support with ARIA labels and keyboard navigation
 * - Dark mode compatible styling
 * - Loading states during session creation
 * 
 * Layout:
 * - Header: Title and close button
 * - Body: Session form and agent selection grid
 * - Footer: Cancel and create action buttons
 * 
 * @param props - CreateSessionDialogProps containing dialog state and handlers
 * @returns JSX element for the create session modal dialog
 */
const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({
    isOpen,
    onClose,
    onCreateSession,
    availableAgents = []
}) => {
    const { t } = useTranslation()

    // Form state management
    const [sessionTitle, setSessionTitle] = useState('')
    const [sessionDescription, setSessionDescription] = useState('')
    const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    /**
     * Filter available agents based on search query
     * Searches through agent name and specialty fields
     */
    const filteredAgents = availableAgents.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    )

    /**
     * Toggle agent selection for session creation
     * Manages the list of selected AI agents
     * 
     * @param agentId - ID of the agent to toggle
     */
    const handleAgentToggle = (agentId: string) => {
        setSelectedAgentIds(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        )
        // Clear any previous errors when user makes changes
        if (error) setError(null)
    }

    /**
     * Handle session creation with comprehensive validation and error handling
     * Validates form data, creates session, and manages UI state
     */
    const handleCreate = async () => {
        // Form validation
        if (!sessionTitle.trim()) {
            setError(t('session.titleRequired') || 'Session title is required')
            return
        }

        if (selectedAgentIds.length === 0) {
            setError(t('session.agentRequired') || 'At least one AI agent must be selected')
            return
        }

        setIsCreating(true)
        setError(null)

        try {
            await onCreateSession({
                title: sessionTitle.trim(),
                type: selectedAgentIds.length === 1 ? 'direct' : 'group',
                description: sessionDescription.trim() || undefined,
                agentIds: selectedAgentIds
            })

            // Reset form state on successful creation
            resetForm()
            onClose()
        } catch (error) {
            console.error('Create session error:', error)
            setError(
                error instanceof Error
                    ? error.message
                    : t('session.createError') || 'Failed to create session'
            )
        } finally {
            setIsCreating(false)
        }
    }

    /**
     * Reset all form fields to initial state
     * Used after successful creation or dialog cancellation
     */
    const resetForm = () => {
        setSessionTitle('')
        setSessionDescription('')
        setSelectedAgentIds([])
        setSearchQuery('')
        setError(null)
    }

    /**
     * Handle dialog close with form reset
     * Ensures clean state when dialog is reopened
     */
    const handleClose = () => {
        resetForm()
        onClose()
    }

    /**
     * Handle backdrop click to close dialog
     * Only closes if clicking on the backdrop, not the dialog content
     * 
     * @param e - React mouse event
     */
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose()
        }
    }

    /**
     * Handle keyboard navigation within the dialog
     * Supports Tab navigation and Escape to close
     * 
     * @param e - React keyboard event
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleClose()
        }
    }

    // Don't render if dialog is not open
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-session-title"
            aria-describedby="create-session-description"
        >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-dialog-slide-in">

                {/* Dialog Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <h2
                        id="create-session-title"
                        className="text-xl font-semibold text-slate-900 dark:text-slate-100 m-0 flex items-center gap-3"
                    >
                        <span className="text-2xl" aria-hidden="true">💬</span>
                        {t('session.createNewSession')}
                    </h2>
                    <button
                        onClick={handleClose}
                        disabled={isCreating}
                        className="w-8 h-8 border-none bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full cursor-pointer transition-all duration-150 flex items-center justify-center text-base hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-slate-100 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Close dialog"
                        title="Close dialog"
                    >
                        ✕
                    </button>
                </div>

                {/* Dialog Content */}
                <div className="px-6 py-6 max-h-[calc(90vh-160px)] overflow-y-auto">
                    <div
                        id="create-session-description"
                        className="sr-only"
                    >
                        Create a new chat session by providing a title, optional description, and selecting AI agents to participate.
                    </div>

                    {/* Error Message Display */}
                    {error && (
                        <div
                            className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
                            role="alert"
                            aria-live="assertive"
                        >
                            <div className="flex items-center gap-2">
                                <span className="text-red-500 text-lg" aria-hidden="true">⚠️</span>
                                <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                                    {error}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Session Information Form */}
                    <div className="mb-6">
                        <div className="mb-4">
                            <label
                                htmlFor="session-title"
                                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5"
                            >
                                {t('session.sessionName')} <span className="text-red-500" aria-label="required">*</span>
                            </label>
                            <input
                                id="session-title"
                                type="text"
                                value={sessionTitle}
                                onChange={(e) => {
                                    setSessionTitle(e.target.value)
                                    if (error) setError(null) // Clear error on input
                                }}
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-all duration-150 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/10"
                                placeholder={t('session.enterSessionName')}
                                maxLength={50}
                                required
                                disabled={isCreating}
                                autoFocus
                                aria-describedby="session-title-help"
                            />
                            <div
                                id="session-title-help"
                                className="text-xs text-slate-500 dark:text-slate-400 mt-1"
                            >
                                {sessionTitle.length}/50 characters
                            </div>
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="session-description"
                                className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1.5"
                            >
                                {t('session.description')} ({t('common.optional')})
                            </label>
                            <textarea
                                id="session-description"
                                value={sessionDescription}
                                onChange={(e) => setSessionDescription(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-all duration-150 resize-vertical min-h-[60px] focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/10"
                                placeholder={t('session.enterDescription')}
                                maxLength={200}
                                disabled={isCreating}
                                aria-describedby="session-description-help"
                            />
                            <div
                                id="session-description-help"
                                className="text-xs text-slate-500 dark:text-slate-400 mt-1"
                            >
                                {sessionDescription.length}/200 characters
                            </div>
                        </div>
                    </div>

                    {/* AI Agent Selection Section */}
                    <div className="mt-6">
                        <div className="mb-4">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 m-0 mb-3">
                                {t('session.selectAgents')} <span className="text-red-500" aria-label="required">*</span>
                            </h3>
                            <div className="relative">
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-150 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/10"
                                    placeholder={t('session.searchAgents')}
                                    disabled={isCreating}
                                    aria-label="Search AI agents by name or specialty"
                                    autoComplete="off"
                                    spellCheck="false"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
                                    🔍
                                </div>
                            </div>
                            {selectedAgentIds.length > 0 && (
                                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                                    {selectedAgentIds.length} agent{selectedAgentIds.length !== 1 ? 's' : ''} selected
                                </div>
                            )}
                        </div>

                        {/* Agent Selection Grid */}
                        <div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4"
                            role="group"
                            aria-label="Available AI agents"
                        >
                            {filteredAgents.map(agent => (
                                <div
                                    key={agent.id}
                                    onClick={() => !isCreating && handleAgentToggle(agent.id)}
                                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all duration-150 relative ${selectedAgentIds.includes(agent.id)
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 shadow-lg shadow-indigo-600/10'
                                            : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-0.5'
                                        } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    role="checkbox"
                                    aria-checked={selectedAgentIds.includes(agent.id)}
                                    aria-label={`${agent.name} - ${agent.specialty}`}
                                    tabIndex={isCreating ? -1 : 0}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && !isCreating) {
                                            e.preventDefault()
                                            handleAgentToggle(agent.id)
                                        }
                                    }}
                                >
                                    {/* Agent Avatar */}
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg text-white flex-shrink-0"
                                        style={{ background: agent.avatarStyle || '#667eea' }}
                                        aria-hidden="true"
                                    >
                                        {agent.avatar}
                                    </div>

                                    {/* Agent Information */}
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                            {agent.name}
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
                                            {agent.specialty}
                                        </div>
                                    </div>

                                    {/* Selection Indicator */}
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${selectedAgentIds.includes(agent.id)
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                                            }`}
                                        aria-hidden="true"
                                    >
                                        ✓
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* No Agents Found State */}
                        {filteredAgents.length === 0 && (
                            <div className="text-center py-10 px-5 text-slate-600 dark:text-slate-400">
                                <div className="text-5xl mb-3 opacity-50" aria-hidden="true">🤖</div>
                                <div>{t('session.noAgentsFound')}</div>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Dialog Footer */}
                <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <button
                        onClick={handleClose}
                        disabled={isCreating}
                        className="px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-lg font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    >
                        {t('common.cancel')}
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isCreating || !sessionTitle.trim() || selectedAgentIds.length === 0}
                        className="px-4 py-2.5 bg-indigo-600 text-white border-none rounded-lg font-medium transition-all hover:bg-indigo-700 hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    >
                        {isCreating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                                {t('common.creating')}
                            </>
                        ) : (
                            <>
                                <span className="text-base" aria-hidden="true">💬</span>
                                {t('session.createSession')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateSessionDialog 