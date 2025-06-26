'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTranslation } from '../contexts/AppContext'
import { useSession } from '@/components/providers/AuthProvider'
import { signOut } from '@/lib/auth-client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface UserMenuProps {
    className?: string
}

/**
 * 用户菜单组件
 * 
 * 功能包括：
 * 1. 显示用户头像或初始字母
 * 2. 下拉菜单包含设置和注销功能
 * 3. 支持国际化
 * 4. 流畅的动画效果
 */
const UserMenu: React.FC<UserMenuProps> = ({ className = "" }) => {
    const { t } = useTranslation()
    const { data: session, isPending } = useSession()
    const [isSigningOut, setIsSigningOut] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // 计算用户状态
    const isLoggedIn = !!session?.user
    const user = session?.user

    /**
     * 获取用户头像首字母
     */
    const getUserInitial = (): string => {
        if (user?.name && user.name.trim()) {
            return user.name.trim().charAt(0).toUpperCase()
        }
        if (user?.email && user.email.trim()) {
            return user.email.trim().charAt(0).toUpperCase()
        }
        return t('navbar.userInitial')
    }

    /**
 * 处理注销
 */
    const handleSignOut = async () => {
        try {
            setIsSigningOut(true)

            // 执行注销操作
            await signOut({
                fetchOptions: {
                    onSuccess: () => {
                        console.log('User signed out successfully')
                        // 注销成功后重定向到首页并刷新
                        window.location.href = window.location.origin
                    },
                    onError: (e) => {
                        console.error('Sign out error:', e)
                        setIsSigningOut(false)
                        setIsMenuOpen(false)
                    }
                }
            })
        } catch (error) {
            console.error('Sign out error:', error)
            setIsSigningOut(false)
            setIsMenuOpen(false)
        }
    }

    /**
     * 处理设置（预留功能）
     */
    const handleSettings = () => {
        console.log('Settings clicked - Feature coming soon')
        setIsMenuOpen(false)
        // TODO: 实现设置页面
    }

    /**
     * 处理个人资料（预留功能）
     */
    const handleProfile = () => {
        console.log('Profile clicked - Feature coming soon')
        setIsMenuOpen(false)
        // TODO: 实现个人资料页面
    }

    if (!isLoggedIn) {
        return null // 未登录用户不显示菜单
    }

    return (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl active:shadow-md overflow-hidden group border-2 border-white/30 dark:border-slate-600/30 touch-manipulation ${className}`}
                    disabled={isPending || isSigningOut}
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%)'
                    }}
                    aria-label={t('navbar.userMenuAriaLabel')}
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                >
                    {isPending || isSigningOut ? (
                        // Loading state
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            {user?.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || user.email || 'User Avatar'}
                                    className="w-full h-full object-cover rounded-full"
                                    width={48}
                                    height={48}
                                    unoptimized
                                />
                            ) : (
                                <span className="relative z-10 text-white font-semibold text-xs sm:text-sm md:text-base lg:text-lg">
                                    {getUserInitial()}
                                </span>
                            )}

                            {/* Animated Border for Logged In Users */}
                            <motion.div
                                animate={{ rotate: isMenuOpen ? 180 : 360 }}
                                transition={{
                                    duration: isMenuOpen ? 0.3 : 8,
                                    repeat: isMenuOpen ? 0 : Infinity,
                                    ease: isMenuOpen ? "easeOut" : "linear"
                                }}
                                className="absolute inset-0 rounded-full border-2 border-white/30 dark:border-white/20"
                            />

                            {/* Online Status Indicator */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"></div>
                        </>
                    )}
                </motion.button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-56 sm:w-64 p-2 bg-white/95 backdrop-blur-xl border border-gray-200/80 shadow-2xl dark:bg-slate-900/95 dark:border-slate-700/50 dark:shadow-slate-900/50"
                align="end"
                sideOffset={8}
                forceMount
            >
                {/* 用户信息头部 */}
                <DropdownMenuLabel className="p-3 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 dark:from-slate-800/90 dark:to-slate-700/90 rounded-lg mb-2 border border-indigo-100/50 dark:border-slate-600/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {user?.image ? (
                                <Image
                                    src={user.image}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover rounded-full"
                                    width={40}
                                    height={40}
                                    unoptimized
                                />
                            ) : (
                                getUserInitial()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {user?.name || user?.email || t('navbar.userInitial')}
                            </div>
                            {user?.email && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </div>
                            )}
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {/* 菜单项 */}
                <DropdownMenuItem
                    onClick={handleProfile}
                    className="flex items-center gap-3 px-3 py-3 sm:py-2 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-slate-700/80 rounded-md transition-colors touch-manipulation"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{t('userMenu.myProfile')}</span>
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{t('common.comingSoon')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={handleSettings}
                    className="flex items-center gap-3 px-3 py-3 sm:py-2 cursor-pointer hover:bg-gray-100/80 dark:hover:bg-slate-700/80 rounded-md transition-colors touch-manipulation"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{t('userMenu.settings')}</span>
                    <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{t('common.comingSoon')}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* 注销按钮 */}
                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-3 px-3 py-3 sm:py-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 focus:text-red-700 dark:focus:text-red-300 rounded-md transition-colors touch-manipulation"
                    variant="destructive"
                >
                    {isSigningOut ? (
                        <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    )}
                    <span>{isSigningOut ? t('userMenu.signingOut') : t('userMenu.signOut')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserMenu 