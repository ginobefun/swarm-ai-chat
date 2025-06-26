'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
    const [isMounted, setIsMounted] = useState(false)

    // Ensure component is mounted before using portal
    useEffect(() => {
        setIsMounted(true)
    }, [])



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
                type: selectedAgentIds.length === 1 ? 'DIRECT' : 'GROUP',
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

    // Don't render if dialog is not open or not mounted
    if (!isOpen || !isMounted) return null

    // Render modal using React Portal to ensure it's positioned relative to viewport
    return createPortal(
        <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl p-4 sm:p-6 overflow-hidden"
            onClick={handleBackdropClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-session-title"
            aria-describedby="create-session-description"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/40 max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ease-out">

                {/* Dialog Header with enhanced visual hierarchy */}
                <div className="relative px-6 py-6 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/90 via-white/50 to-slate-50/90 dark:from-slate-800/90 dark:via-slate-900/50 dark:to-slate-800/90">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/20 via-purple-50/10 to-pink-50/20 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20"></div>

                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Enhanced icon with gradient background */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg flex items-center justify-center">
                                <span className="text-2xl" aria-hidden="true">💬</span>
                            </div>
                            <div>
                                <h2
                                    id="create-session-title"
                                    className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-1"
                                >
                                    {t('session.createNewSession')}
                                </h2>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('session.dialogSubtitle') || 'Configure your AI team collaboration'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleClose}
                            disabled={isCreating}
                            className="w-10 h-10 border-none bg-white/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center backdrop-blur-sm shadow-sm hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            aria-label="Close dialog"
                            title="Close dialog"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Dialog Content with enhanced spacing and visual hierarchy */}
                <div className="px-6 py-6 max-h-[calc(90vh-180px)] overflow-y-auto">
                    <div
                        id="create-session-description"
                        className="sr-only"
                    >
                        Create a new chat session by providing a title, optional description, and selecting AI agents to participate.
                    </div>

                    {/* Error Message Display with better visual design */}
                    {error && (
                        <div
                            className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/80 dark:from-red-950/20 dark:to-red-950/10 border border-red-200/60 dark:border-red-800/40 rounded-xl shadow-sm"
                            role="alert"
                            aria-live="assertive"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                    <span className="text-red-500 text-sm" aria-hidden="true">⚠️</span>
                                </div>
                                <span className="text-red-700 dark:text-red-300 text-sm font-medium">
                                    {error}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Session Information Form with enhanced design */}
                    <div className="mb-8">
                        <div className="mb-6">
                            <label
                                htmlFor="session-title"
                                className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2"
                            >
                                {t('session.sessionName')} <span className="text-red-500 ml-1" aria-label="required">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    id="session-title"
                                    type="text"
                                    value={sessionTitle}
                                    onChange={(e) => {
                                        setSessionTitle(e.target.value)
                                        if (error) setError(null) // Clear error on input
                                    }}
                                    className="w-full px-4 py-3 border border-slate-200/60 dark:border-slate-600/60 rounded-xl text-sm text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 shadow-sm hover:shadow-md placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder={t('session.enterSessionName')}
                                    maxLength={50}
                                    required
                                    disabled={isCreating}
                                    autoFocus
                                    aria-describedby="session-title-help"
                                />
                                {/* Character count indicator */}
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <span className={`text-xs font-medium ${sessionTitle.length > 40 ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {sessionTitle.length}/50
                                    </span>
                                </div>
                            </div>
                            <div
                                id="session-title-help"
                                className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-1"
                            >
                                {t('session.titleHelper') || 'Choose a descriptive name for your AI collaboration session'}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label
                                htmlFor="session-description"
                                className="block text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2"
                            >
                                {t('session.description')}
                                <span className="text-slate-500 dark:text-slate-400 font-normal ml-2">({t('common.optional')})</span>
                            </label>
                            <div className="relative">
                                <textarea
                                    id="session-description"
                                    value={sessionDescription}
                                    onChange={(e) => setSessionDescription(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200/60 dark:border-slate-600/60 rounded-xl text-sm text-slate-900 dark:text-slate-100 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-all duration-200 resize-none min-h-[80px] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 shadow-sm hover:shadow-md placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder={t('session.enterDescription') || 'What will you discuss in this session?'}
                                    maxLength={200}
                                    disabled={isCreating}
                                    aria-describedby="session-description-help"
                                />
                                {/* Character count indicator */}
                                <div className="absolute bottom-3 right-3">
                                    <span className={`text-xs font-medium ${sessionDescription.length > 160 ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {sessionDescription.length}/200
                                    </span>
                                </div>
                            </div>
                            <div
                                id="session-description-help"
                                className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-1"
                            >
                                {t('session.descriptionHelper') || 'Add context to help AI agents understand your goals'}
                            </div>
                        </div>
                    </div>

                    {/* AI Agent Selection Section with enhanced design */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                    <span className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <span className="text-xs text-white">🤖</span>
                                    </span>
                                    {t('session.selectAgents')}
                                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                                </h3>
                                {selectedAgentIds.length > 0 && (
                                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 rounded-full">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                        <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                            {selectedAgentIds.length} selected
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-3 pl-11 border border-slate-200/60 dark:border-slate-600/60 rounded-xl text-sm bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-900 shadow-sm hover:shadow-md placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    placeholder={t('session.searchAgents') || 'Search by name or specialty...'}
                                    disabled={isCreating}
                                    aria-label="Search AI agents by name or specialty"
                                    autoComplete="off"
                                    spellCheck="false"
                                />
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
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
                        {availableAgents.length === 0 ? (
                            <div className="text-center py-10 px-5 text-slate-600 dark:text-slate-400">
                                <div className="text-5xl mb-3 opacity-50" aria-hidden="true">🤖</div>
                                <div>{t('session.noAgentsAvailable') || 'No AI agents available'}</div>
                                <p className="text-sm mt-2 opacity-75">
                                    {t('session.contactAdmin') || 'Please contact administrator to add AI agents'}
                                </p>
                            </div>
                        ) : filteredAgents.length === 0 ? (
                            <div className="text-center py-10 px-5 text-slate-600 dark:text-slate-400">
                                <div className="text-5xl mb-3 opacity-50" aria-hidden="true">🔍</div>
                                <div>{t('session.noAgentsFound')}</div>
                                <p className="text-sm mt-2 opacity-75">
                                    {t('session.tryDifferentSearch') || 'Try a different search term'}
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="mt-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                                    >
                                        {t('session.clearSearch') || 'Clear search'}
                                    </button>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* Dialog Footer with enhanced design */}
                <div className="relative px-6 py-6 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50/90 via-white/50 to-slate-50/90 dark:from-slate-800/90 dark:via-slate-900/50 dark:to-slate-800/90">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50/30 via-white/10 to-slate-50/30 dark:from-slate-800/30 dark:via-slate-900/10 dark:to-slate-800/30"></div>

                    <div className="relative flex justify-end gap-3">
                        <button
                            onClick={handleClose}
                            disabled={isCreating}
                            className="px-6 py-3 bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60 rounded-xl font-medium backdrop-blur-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                            {t('common.cancel')}
                        </button>

                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !sessionTitle.trim() || selectedAgentIds.length === 0}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none rounded-xl font-semibold transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:from-indigo-600 disabled:hover:to-purple-600 flex items-center gap-2 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                            {isCreating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                                    {t('common.creating') || 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center">
                                        <span className="text-sm" aria-hidden="true">💬</span>
                                    </div>
                                    {t('session.createSession')}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

export default CreateSessionDialog 