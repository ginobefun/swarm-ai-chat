'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { signIn, signUp } from '@/lib/auth-client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface LoginDialogProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
    isOpen,
    onClose,
    onSuccess
}) => {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)

    /**
     * 验证用户名格式
     */
    const validateUsername = (username: string): boolean => {
        if (!username) return true // 用户名现在是可选的
        const usernameRegex = /^[a-zA-Z0-9_]+$/
        return username.length >= 6 && username.length <= 20 && usernameRegex.test(username)
    }

    /**
     * 检查用户名是否可用
     */
    const checkUsernameAvailability = async (username: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/check-username', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || '检查用户名时出错')
                return false
            }

            if (!data.available) {
                setError(data.error || '用户名不可用')
                return false
            }

            return true
        } catch (error) {
            console.error('检查用户名时出错：', error)
            setError('网络错误，请检查网络连接')
            return false
        }
    }

    /**
     * 处理用户名输入变化
     */
    const handleUsernameChange = async (value: string) => {
        setUsername(value)
        if (!isLogin && value.length >= 3) {
            setIsCheckingUsername(true)
            const isValid = validateUsername(value)
            if (isValid) {
                const isAvailable = await checkUsernameAvailability(value)
                if (!isAvailable) {
                    setError('用户名已被使用，请尝试其他用户名')
                } else {
                    setError('')
                }
            } else {
                setError('用户名只能包含英文、数字和下划线，长度 3-20 个字符')
            }
            setIsCheckingUsername(false)
        }
    }

    /**
     * 处理邮箱密码登录/注册
     */
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            if (isLogin) {
                // 登录
                const result = await signIn.email({
                    email,
                    password,
                })

                if (result.error) {
                    setError('登录失败，请检查邮箱和密码')
                } else {
                    onSuccess?.()
                    onClose()
                }
            } else {
                // 注册 - 处理用户名
                let finalUsername = username

                // 如果没有提供用户名，自动生成
                if (!finalUsername) {
                    const emailPrefix = email.split('@')[0]
                    let baseUsername = emailPrefix.replace(/[^a-zA-Z0-9_]/g, '_')

                    // 确保 username 至少 6 个字符
                    if (baseUsername.length < 6) {
                        baseUsername = baseUsername + '_' + Math.random().toString(36).substr(2, 6)
                    }

                    // 检查生成的用户名是否可用
                    let generatedUsername = baseUsername
                    let isAvailable = await checkUsernameAvailability(generatedUsername)
                    let counter = 1

                    while (!isAvailable && counter < 10) {
                        generatedUsername = baseUsername + '_' + Math.random().toString(36).substr(2, 4)
                        isAvailable = await checkUsernameAvailability(generatedUsername)
                        counter++
                    }

                    finalUsername = generatedUsername
                } else {
                    // 验证用户提供的用户名
                    if (!validateUsername(finalUsername)) {
                        setError('用户名格式不正确')
                        setIsLoading(false)
                        return
                    }
                }

                // 使用Better Auth注册（不包含username，之后单独设置）
                const result = await signUp.email({
                    email,
                    password,
                    name: name || email.split('@')[0], // 如果没有提供name，使用邮箱前缀
                })

                if (result.error) {
                    if (result.error.message?.includes('email')) {
                        setError('该邮箱已被注册')
                    } else {
                        setError('注册失败，请检查信息后重试')
                    }
                } else {
                    // 注册成功后，设置用户名
                    try {
                        await fetch('/api/auth/update-username', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ username: finalUsername }),
                        })
                        console.log('用户名已设置为:', finalUsername)
                    } catch (error) {
                        console.error('设置用户名失败:', error)
                        // 即使设置用户名失败，注册仍然成功
                    }

                    onSuccess?.()
                    onClose()
                }
            }
        } catch (err) {
            console.error('Auth error:', err)
            setError('操作失败，请稍后重试')
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * 处理社交登录
     */
    const handleSocialLogin = async (provider: 'google' | 'github') => {
        setError('')
        setIsLoading(true)

        try {
            const result = await signIn.social({
                provider,
                callbackURL: '/',
            })

            if (result.error) {
                setError(`${provider === 'google' ? 'Google' : 'GitHub'} 登录失败`)
            }
        } catch (err) {
            console.error('Social login error:', err)
            setError('登录失败，请稍后重试')
        } finally {
            setIsLoading(false)
        }
    }

    /**
     * 重置表单状态
     */
    const resetForm = () => {
        setEmail('')
        setUsername('')
        setPassword('')
        setName('')
        setError('')
        setIsCheckingUsername(false)
    }

    /**
     * 切换登录/注册模式
     */
    const toggleMode = () => {
        setIsLogin(!isLogin)
        resetForm()
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md border-0 shadow-xl bg-white dark:bg-gray-900">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {isLogin ? '登录 SwarmAI' : '注册 SwarmAI'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 p-6">
                    {/* 社交登录按钮 */}
                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading}
                        >
                            <div className="w-5 h-5 mr-2 flex-shrink-0">
                                <svg viewBox="0 0 24 24" className="w-full h-full">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                            </div>
                            使用 Google 登录
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-11 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => handleSocialLogin('github')}
                            disabled={isLoading}
                        >
                            <div className="w-5 h-5 mr-2 flex-shrink-0">
                                <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor">
                                    <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.057 3.262 9.34 7.797 10.864.568.105.775-.247.775-.548 0-.271-.01-.987-.015-1.937-3.198.694-3.875-1.541-3.875-1.541-.517-1.313-1.264-1.663-1.264-1.663-1.033-.707.078-.693.078-.693 1.143.08 1.745 1.174 1.745 1.174 1.015 1.738 2.664 1.235 3.312.944.103-.734.397-1.235.722-1.518-2.525-.287-5.18-1.263-5.18-5.62 0-1.241.444-2.256 1.173-3.051-.118-.288-.508-1.444.111-3.01 0 0 .956-.306 3.133 1.166.91-.253 1.885-.38 2.854-.384.968.004 1.944.131 2.854.384 2.175-1.472 3.131-1.166 3.131-1.166.62 1.566.23 2.722.112 3.01.73.795 1.172 1.81 1.172 3.051 0 4.368-2.66 5.329-5.193 5.61.408.352.772 1.047.772 2.11 0 1.523-.014 2.751-.014 3.124 0 .304.204.658.782.547C20.236 21.336 23.5 17.055 23.5 12c0-6.352-5.148-11.5-11.5-11.5z" />
                                </svg>
                            </div>
                            使用 GitHub 登录
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">或</span>
                        </div>
                    </div>

                    {/* 邮箱密码表单 */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <Input
                                type="email"
                                placeholder="邮箱地址"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-11"
                            />
                        </div>

                        {!isLogin && (
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="用户名（可选，英文、数字、下划线，6-20字符）"
                                    value={username}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    required={!isLogin}
                                    className="h-11 pr-10"
                                    minLength={3}
                                    maxLength={20}
                                    pattern="[a-zA-Z0-9_]+"
                                />
                                {isCheckingUsername && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                        )}

                        {!isLogin && (
                            <div>
                                <Input
                                    type="text"
                                    placeholder="姓名"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required={!isLogin}
                                    className="h-11"
                                />
                            </div>
                        )}

                        <div>
                            <Input
                                type="password"
                                placeholder="密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="h-11"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                            >
                                {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    {isLogin ? '登录中...' : '注册中...'}
                                </div>
                            ) : (
                                isLogin ? '登录' : '注册'
                            )}
                        </Button>
                    </form>

                    {/* 切换登录/注册 */}
                    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                        {isLogin ? '还没有账号？' : '已有账号？'}
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="ml-1 text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                            {isLogin ? '立即注册' : '立即登录'}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 