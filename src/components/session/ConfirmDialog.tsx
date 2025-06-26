'use client'

import React from 'react'
import { useTranslation } from '@/contexts/AppContext'

/**
 * Props interface for ConfirmDialog component
 * Defines all properties needed for the confirmation dialog
 */
interface ConfirmDialogProps {
    isOpen: boolean                                          // Whether the dialog is currently open
    title: string                                           // Title text for the dialog header
    message: string                                         // Main message content to display
    confirmText?: string                                    // Custom text for confirm button (optional)
    cancelText?: string                                     // Custom text for cancel button (optional)
    confirmVariant?: 'primary' | 'danger'                 // Visual style variant for confirm button
    isLoading?: boolean                                     // Loading state during confirmation action
    onConfirm: () => void                                   // Callback when user confirms the action
    onCancel: () => void                                    // Callback when user cancels or closes dialog
}

/**
 * ConfirmDialog component - Modal dialog for user confirmations
 * 
 * Features:
 * - Customizable title, message, and button text
 * - Support for different confirmation variants (primary/danger)
 * - Loading state with disabled interactions
 * - Accessibility support with ARIA labels and keyboard navigation
 * - Dark mode compatible styling
 * - Backdrop click and Escape key to cancel
 * - Focus management and screen reader support
 * - Responsive design for mobile and desktop
 * 
 * Usage:
 * - Used for destructive actions (delete, archive)
 * - Important confirmations before proceeding
 * - Can be styled as primary (normal) or danger (destructive) actions
 * 
 * @param props - ConfirmDialogProps containing dialog configuration and handlers
 * @returns JSX element for the confirmation dialog or null if not open
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    title,
    message,
    confirmText,
    cancelText,
    confirmVariant = 'primary',
    isLoading = false,
    onConfirm,
    onCancel
}) => {
    const { t } = useTranslation()

    /**
     * Handle overlay/backdrop click to close dialog
     * Only closes if clicking on the backdrop, not the dialog content
     * 
     * @param e - React mouse event
     */
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isLoading) {
            onCancel()
        }
    }

    /**
     * Handle keyboard navigation within the dialog
     * Supports Escape key to cancel (unless loading)
     * 
     * @param e - React keyboard event
     */
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
            onCancel()
        }
        // Prevent Tab from leaving the dialog
        if (e.key === 'Tab') {
            const focusableElements = e.currentTarget.querySelectorAll(
                'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]):not(:disabled)'
            )
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault()
                lastElement?.focus()
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault()
                firstElement?.focus()
            }
        }
    }

    // Don't render if dialog is not open
    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm p-4 overflow-hidden"
            onClick={handleOverlayClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
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
            <div
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl w-full max-w-[480px] overflow-hidden animate-dialog-slide-in"
            >

                {/* Dialog Header */}
                <div className="px-6 pt-5 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3
                        id="confirm-dialog-title"
                        className="text-lg font-semibold text-slate-900 dark:text-slate-100 m-0"
                    >
                        {title}
                    </h3>
                </div>

                {/* Dialog Content */}
                <div className="px-6 py-5">
                    <p
                        id="confirm-dialog-message"
                        className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed m-0"
                    >
                        {message}
                    </p>
                </div>

                {/* Dialog Actions */}
                <div className="flex gap-3 px-6 pt-4 pb-5 justify-end">
                    {/* Cancel Button */}
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 border border-transparent bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        aria-label={`Cancel ${title.toLowerCase()}`}
                        autoFocus={confirmVariant === 'danger'} // Focus cancel for dangerous actions
                    >
                        {cancelText || t('common.cancel')}
                    </button>

                    {/* Confirm Button */}
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 border border-transparent text-white flex items-center gap-1.5 ${confirmVariant === 'danger'
                            ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                            : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                            } hover:-translate-y-px hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
                        aria-label={`Confirm ${title.toLowerCase()}`}
                        autoFocus={confirmVariant === 'primary'} // Focus confirm for normal actions
                    >
                        {/* Loading Spinner */}
                        {isLoading && (
                            <div
                                className="w-3.5 h-3.5 border-2 border-transparent border-t-white rounded-full animate-spin"
                                aria-hidden="true"
                            />
                        )}
                        {confirmText || t('common.confirm')}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ConfirmDialog 