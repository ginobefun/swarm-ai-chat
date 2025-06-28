'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '../../contexts/AppContext'
import { useSession } from '@/components/providers/AuthProvider'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import Image from 'next/image'
import { Check, X } from 'lucide-react'

interface ProfileDialogProps {
    isOpen: boolean
    onClose: () => void
}

interface UserProfile {
    id: string
    username: string | null
    avatarUrl: string | null
    role: string
    subscriptionStatus: string
    preferences: Record<string, unknown>
    createdAt: string
    updatedAt: string
    user: {
        name: string | null
        email: string | null
        image: string | null
    }
}

// 预留关键词列表
const RESERVED_KEYWORDS = [
    'admin', 'administrator', 'root', 'moderator', 'mod', 'support', 'help',
    'system', 'api', 'bot', 'null', 'undefined', 'swarm', 'swarmchat',
    'user', 'guest', 'anonymous', 'official', 'staff', 'team', 'service',
    'test', 'demo', 'example', 'sample', 'default', 'reserved', 'config',
    'settings', 'profile', 'account', 'login', 'logout', 'register', 'signup',
    'signin', 'auth', 'oauth', 'www', 'ftp', 'mail', 'email', 'http', 'https',
    'about', 'contact', 'privacy', 'terms', 'legal', 'blog', 'news', 'forum'
]

/**
 * User Profile Dialog Component
 * 
 * Features:
 * 1. Display user profile information
 * 2. Edit username with validation
 * 3. Show subscription status and role
 * 4. Display account creation date
 * 5. Responsive design with dark mode support
 */
const ProfileDialog: React.FC<ProfileDialogProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation()
    const { data: session } = useSession()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [editedUsername, setEditedUsername] = useState('')
    const [isEditing, setIsEditing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [validationError, setValidationError] = useState('')

    /**
     * Validate username against reserved keywords and format
     */
    const validateUsername = (username: string): string => {
        const trimmed = username.trim().toLowerCase()

        if (trimmed.length < 6) {
            return t('userProfile.validation.tooShort')
        }

        if (trimmed.length > 50) {
            return t('userProfile.validation.tooLong')
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
            return t('userProfile.validation.invalidChars')
        }

        if (RESERVED_KEYWORDS.includes(trimmed)) {
            return t('userProfile.validation.reserved')
        }

        return ''
    }

    /**
     * Fetch user profile data
     */
    const fetchProfile = useCallback(async () => {
        if (!session?.user?.id) return

        try {
            setIsLoading(true)
            setError('')

            const response = await fetch('/api/profile')
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch profile')
            }

            setProfile(result.data)
            setEditedUsername(result.data.username || '')
        } catch (error) {
            console.error('Failed to fetch profile:', error)
            setError(error instanceof Error ? error.message : 'Failed to load profile')
        } finally {
            setIsLoading(false)
        }
    }, [session?.user?.id])

    /**
     * Handle username input change
     */
    const handleUsernameChange = (value: string) => {
        setEditedUsername(value)

        // Clear validation error when user starts typing
        if (validationError) {
            setValidationError('')
        }

        // Real-time validation
        if (value.trim()) {
            const validation = validateUsername(value)
            setValidationError(validation)
        }
    }

    /**
     * Save username changes
     */
    const handleSaveUsername = async () => {
        if (!profile || editedUsername === profile.username) {
            setIsEditing(false)
            return
        }

        // Final validation before saving
        const validation = validateUsername(editedUsername)
        if (validation) {
            setValidationError(validation)
            return
        }

        try {
            setIsSaving(true)
            setError('')

            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: editedUsername.trim() || null
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update username')
            }

            setProfile(result.data)
            setIsEditing(false)
            setValidationError('')
        } catch (error) {
            console.error('Failed to update username:', error)
            setError(error instanceof Error ? error.message : 'Failed to update username')
        } finally {
            setIsSaving(false)
        }
    }

    /**
     * Cancel editing
     */
    const handleCancelEdit = () => {
        setEditedUsername(profile?.username || '')
        setIsEditing(false)
        setError('')
        setValidationError('')
    }

    /**
     * Get subscription status color
     */
    const getSubscriptionColor = (status: string) => {
        switch (status) {
            case 'PRO':
                return 'bg-gradient-to-r from-yellow-400 to-orange-500'
            case 'PREMIUM':
                return 'bg-gradient-to-r from-purple-500 to-indigo-600'
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500'
        }
    }

    /**
     * Get role color
     */
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-gradient-to-r from-red-500 to-pink-600'
            case 'MODERATOR':
                return 'bg-gradient-to-r from-blue-500 to-indigo-600'
            default:
                return 'bg-gradient-to-r from-green-500 to-emerald-600'
        }
    }

    // Load profile data when dialog opens
    useEffect(() => {
        if (isOpen && session?.user?.id) {
            fetchProfile()
        }
    }, [isOpen, session?.user?.id, fetchProfile])

    if (!isOpen) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md mx-auto bg-white/95 backdrop-blur-xl border border-gray-200/80 shadow-2xl dark:bg-slate-900/95 dark:border-slate-700/50">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                        {t('userProfile.title')}
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : profile ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* User Avatar and Basic Info */}
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-slate-800/90 dark:to-slate-700/90 rounded-lg">
                            <div className="relative">
                                <Avatar className="w-16 h-16">
                                    {profile.user.image ? (
                                        <Image
                                            src={profile.user.image}
                                            alt="User Avatar"
                                            className="w-full h-full object-cover rounded-full"
                                            width={64}
                                            height={64}
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xl">
                                            {(profile.user.name || profile.user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white dark:border-slate-900" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                    {profile.user.name || profile.user.email}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {profile.user.email}
                                </p>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex gap-2">
                            <Badge className={`text-white ${getSubscriptionColor(profile.subscriptionStatus)}`}>
                                {t(`subscription.${profile.subscriptionStatus.toLowerCase()}`)}
                            </Badge>
                            <Badge className={`text-white ${getRoleColor(profile.role)}`}>
                                {t(`role.${profile.role.toLowerCase()}`)}
                            </Badge>
                        </div>

                        {/* Username Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('userProfile.username')}
                            </label>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <Input
                                            value={editedUsername}
                                            onChange={(e) => handleUsernameChange(e.target.value)}
                                            placeholder={t('userProfile.usernamePlaceholder')}
                                            className={`w-full ${validationError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            maxLength={50}
                                        />
                                        {validationError && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {validationError}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleSaveUsername}
                                            disabled={isSaving || !!validationError || !editedUsername.trim()}
                                            size="sm"
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            {isSaving ? t('common.saving') : t('common.save')}
                                        </Button>
                                        <Button
                                            onClick={handleCancelEdit}
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-gray-300 hover:bg-gray-50 text-gray-700 shadow-lg dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            {t('common.cancel')}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-900 dark:text-white">
                                        {profile.username || t('userProfile.noUsername')}
                                    </span>
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        {t('common.edit')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Account Info */}
                        <div className="space-y-3 p-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                    {t('userProfile.memberSince')}
                                </span>
                                <span className="text-gray-900 dark:text-white">
                                    {new Date(profile.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                                {error}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            {t('userProfile.loadError')}
                        </p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default ProfileDialog 