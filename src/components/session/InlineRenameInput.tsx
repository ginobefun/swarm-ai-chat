'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/contexts/AppContext'

/**
 * Props interface for InlineRenameInput component
 * Defines all properties needed for the inline rename functionality
 */
interface InlineRenameInputProps {
    isOpen: boolean                                         // Whether the rename dialog is currently open
    initialValue: string                                    // Initial value to populate the input field
    onSave: (newName: string) => void                      // Callback when user saves the new name
    onCancel: () => void                                   // Callback when user cancels the rename operation
    isLoading?: boolean                                    // Loading state during save operation
}

/**
 * InlineRenameInput component - Modal dialog for renaming sessions
 * 
 * Features:
 * - Inline editing experience with immediate focus and selection
 * - Real-time character count and validation
 * - Keyboard shortcuts (Enter to save, Escape to cancel)
 * - Loading state during save operation
 * - Accessibility support with proper ARIA labels
 * - Dark mode compatible styling
 * - Auto-focus and text selection for better UX
 * - Form validation preventing empty names
 * - Responsive design for mobile and desktop
 * 
 * Usage:
 * - Rename session titles
 * - Quick editing of text fields
 * - Can be extended for other inline editing scenarios
 * 
 * @param props - InlineRenameInputProps containing rename configuration and handlers
 * @returns JSX element for the rename dialog or null if not open
 */
const InlineRenameInput: React.FC<InlineRenameInputProps> = ({
    isOpen,
    initialValue,
    onSave,
    onCancel,
    isLoading = false
}) => {
    const { t } = useTranslation()
    const [value, setValue] = useState(initialValue)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    /**
     * Focus and select input text when dialog opens
     * Provides immediate editing experience for better UX
     */
    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Small delay to ensure the dialog is fully rendered
            const timer = setTimeout(() => {
                inputRef.current?.focus()
                inputRef.current?.select()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    /**
     * Update input value when initialValue changes
     * Ensures the input reflects the current session name
     */
    useEffect(() => {
        setValue(initialValue)
        setError(null) // Clear any previous errors
    }, [initialValue])

    /**
     * Handle form submission with validation
     * Validates input and calls save callback if valid
     * 
     * @param e - React form event
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        const trimmedValue = value.trim()

        // Validation: Check if name is empty
        if (!trimmedValue) {
            setError(t('session.nameRequired') || 'Name is required')
            inputRef.current?.focus()
            return
        }

        // Validation: Check if name is unchanged
        if (trimmedValue === initialValue.trim()) {
            onCancel() // No changes, just cancel
            return
        }

        // Validation: Check minimum length
        if (trimmedValue.length < 1) {
            setError(t('session.nameTooShort') || 'Name must be at least 1 character')
            inputRef.current?.focus()
            return
        }

        // Validation: Check maximum length
        if (trimmedValue.length > 100) {
            setError(t('session.nameTooLong') || 'Name must be less than 100 characters')
            inputRef.current?.focus()
            return
        }

        try {
            onSave(trimmedValue)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Save failed')
        }
    }

    /**
     * Handle keyboard shortcuts and navigation
     * Supports Escape to cancel and proper form handling
     * 
     * @param e - React keyboard event
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
            e.preventDefault()
            onCancel()
        }
        // Clear error when user starts typing
        if (error && (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete')) {
            setError(null)
        }
    }

    /**
     * Handle input value changes with real-time validation
     * Updates state and clears errors when user types
     * 
     * @param e - React change event
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        if (error) {
            setError(null) // Clear error on input change
        }
    }

    /**
     * Handle overlay/backdrop click to cancel
     * Only cancels if clicking on the backdrop, not the dialog content
     * 
     * @param e - React mouse event
     */
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onCancel()
        }
    }

    // Don't render if dialog is not open
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rename-dialog-title"
            aria-describedby="rename-dialog-description"
        >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-w-[480px] w-full overflow-hidden animate-dialog-slide-in">

                {/* Dialog Header */}
                <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3
                        id="rename-dialog-title"
                        className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0 flex items-center gap-2"
                    >
                        <span aria-hidden="true">✏️</span>
                        {t('session.rename')}
                    </h3>
                    <div
                        id="rename-dialog-description"
                        className="sr-only"
                    >
                        Enter a new name for this session. Press Enter to save or Escape to cancel.
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5">
                        {/* Error Message Display */}
                        {error && (
                            <div
                                className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
                                role="alert"
                                aria-live="assertive"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500 text-sm" aria-hidden="true">⚠️</span>
                                    <span className="text-red-700 dark:text-red-300 text-sm">
                                        {error}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="rename-input"
                                className="text-sm font-medium text-slate-900 dark:text-slate-100"
                            >
                                {t('session.newName')}
                            </label>
                            <input
                                id="rename-input"
                                ref={inputRef}
                                type="text"
                                value={value}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                className="px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 transition-all duration-150 focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/10 disabled:opacity-60 disabled:cursor-not-allowed"
                                placeholder={t('session.enterNewName')}
                                maxLength={100}
                                required
                                aria-describedby="rename-input-help"
                                aria-invalid={error ? 'true' : 'false'}
                                autoComplete="off"
                                spellCheck="true"
                            />
                            <div
                                id="rename-input-help"
                                className="text-xs text-slate-600 dark:text-slate-400 text-right"
                            >
                                <span className={value.length > 90 ? 'text-yellow-600 dark:text-yellow-400' : ''}>
                                    {value.length}/100
                                </span>
                                {value.length > 100 && (
                                    <span className="text-red-600 dark:text-red-400 ml-1">
                                        (Too long)
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Dialog Actions */}
                    <div className="flex gap-3 px-6 pt-4 pb-5 justify-end">
                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 border border-transparent bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            aria-label="Cancel rename operation"
                        >
                            {t('common.cancel')}
                        </button>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={isLoading || !value.trim() || value.trim() === initialValue.trim() || value.length > 100}
                            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 border border-transparent bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-px hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            aria-label="Save new name"
                        >
                            {/* Loading Spinner */}
                            {isLoading && (
                                <div
                                    className="w-3.5 h-3.5 border-2 border-transparent border-t-white rounded-full animate-spin"
                                    aria-hidden="true"
                                />
                            )}
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default InlineRenameInput 