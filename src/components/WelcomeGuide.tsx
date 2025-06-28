'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/contexts/AppContext'
import { useSession } from '@/components/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Brain,
    BarChart3,
    Plus,
    ArrowRight,
    FileText,
    Zap,
    Users,
    Target,
    Code,
    Palette,
    TrendingUp
} from 'lucide-react'

interface WelcomeGuideProps {
    onCreateSession?: () => void
    onExploreAgents?: () => void
}

/**
 * WelcomeGuide component - Welcome interface for new users or when no session is selected
 * 
 * Features:
 * - Beautiful animated AI agent showcase
 * - Dynamic background effects with gradient animations
 * - Responsive design with mobile-first approach
 * - User authentication state awareness
 * - Call-to-action buttons for session creation and agent exploration
 * - Dark mode support with proper theming
 * - Accessibility features with proper ARIA labels
 * - Multi-language support through i18n
 * 
 * Layout:
 * - Full-height container with gradient background
 * - Centered content with proper spacing
 * - AI agent grid layout with animations
 * - Feature showcase cards at bottom
 * 
 * @param props - WelcomeGuideProps containing optional callback handlers
 * @returns JSX element representing the welcome guide interface
 */
const WelcomeGuide: React.FC<WelcomeGuideProps> = ({
    onCreateSession,
    onExploreAgents
}) => {
    const { t } = useTranslation()
    const { data: sessionData } = useSession()
    const user = sessionData?.user

    // AI agent display data with animations and positioning
    const aiAgents = [
        {
            id: 1,
            name: t('agents.requirementAnalyst'),
            icon: FileText,
            color: "from-blue-400 to-blue-600",
            delay: 0,
            specialty: t('agents.description.requirementAnalysis')
        },
        {
            id: 2,
            name: t('agents.creativeMaster'),
            icon: Palette,
            color: "from-purple-400 to-purple-600",
            delay: 0.2,
            specialty: t('agents.description.creativeDesign')
        },
        {
            id: 3,
            name: t('agents.dataAnalyst'),
            icon: BarChart3,
            color: "from-emerald-400 to-emerald-600",
            delay: 0.4,
            specialty: t('agents.description.dataAnalysis')
        },
        {
            id: 4,
            name: t('agents.techExpert'),
            icon: Code,
            color: "from-orange-400 to-orange-600",
            delay: 0.6,
            specialty: t('agents.description.techImplementation')
        },
        {
            id: 5,
            name: t('agents.marketAnalyst'),
            icon: TrendingUp,
            color: "from-pink-400 to-pink-600",
            delay: 0.8,
            specialty: t('agents.description.marketInsight')
        }
    ]

    return (
        <div className="h-full relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
            {/* 动态背景效果 */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200/40 dark:bg-blue-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-20 w-72 h-72 bg-purple-200/40 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob-delay-2"></div>
                <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200/40 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-30 animate-blob-delay-4"></div>
            </div>

            {/* 主要内容区域，顶部预留空间与 SessionList 一致 */}
            <div className="relative h-full flex flex-col items-center justify-center p-8 pt-20">
                {/* 🌟 AI 团队动态展示 */}
                <motion.div
                    className="relative mb-16"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    {/* 中心主体 */}
                    <div className="flex flex-col items-center">
                        <motion.div
                            className="relative z-20 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 shadow-xl flex items-center justify-center mb-8"
                            animate={{
                                boxShadow: [
                                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                    "0 25px 30px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.06)",
                                    "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <span className="text-3xl" aria-hidden="true">🤖</span>
                        </motion.div>

                        {/* 围绕的 AI 智能体 - 使用 Grid 布局 */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-2xl">
                            {aiAgents.map((agent, index) => (
                                <motion.div
                                    key={agent.id}
                                    className="flex flex-col items-center"
                                    initial={{ opacity: 0, scale: 0, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{
                                        delay: 0.5 + index * 0.1,
                                        duration: 0.5,
                                        type: "spring",
                                        stiffness: 200,
                                        damping: 15
                                    }}
                                >
                                    {/* AI 智能体图标 */}
                                    <motion.div
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} dark:shadow-lg shadow-md flex items-center justify-center cursor-pointer group mb-2`}
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        animate={{
                                            y: [0, -5, 0],
                                        }}
                                        transition={{
                                            y: {
                                                duration: 3,
                                                repeat: Infinity,
                                                delay: index * 0.2,
                                                ease: "easeInOut"
                                            }
                                        }}
                                    >
                                        <agent.icon className="w-6 h-6 text-white" />
                                    </motion.div>

                                    {/* 智能体名称 */}
                                    <div className="text-center">
                                        <div className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                                            {agent.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {agent.specialty}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 核心价值主张 */}
                <motion.div
                    className="text-center mb-12 max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('welcome.mainTitle').split('AI 团队')[0]} <span className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">AI 团队</span> {t('welcome.mainTitle').split('AI 团队')[1]}
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                        {t('welcome.mainSubtitle')}
                    </p>
                </motion.div>

                {/* 操作按钮区域 */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            size="lg"
                            className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-purple-600 dark:hover:from-indigo-600 dark:hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            onClick={() => {
                                if (onCreateSession) {
                                    onCreateSession()
                                } else {
                                    console.log('Create new session clicked')
                                }
                            }}
                            disabled={!user?.id} // 只有登录用户才能创建会话
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            {t('welcome.createNewSession')}
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                            size="lg"
                            variant="outline"
                            className="!h-14 px-8 text-lg font-medium border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                            onClick={() => {
                                if (onExploreAgents) {
                                    onExploreAgents()
                                } else {
                                    console.log('Explore agents clicked')
                                }
                            }}
                        >
                            <Brain className="w-5 h-5 mr-2" />
                            {t('welcome.exploreAgents')}
                        </Button>
                    </motion.div>
                </motion.div>

                {/* 核心功能展示 */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                >
                    {[
                        {
                            icon: Users,
                            title: t('welcome.features.multiAgent.title'),
                            description: t('welcome.features.multiAgent.description'),
                            color: "from-blue-500 to-indigo-600"
                        },
                        {
                            icon: Target,
                            title: t('welcome.features.professionalRoles.title'),
                            description: t('welcome.features.professionalRoles.description'),
                            color: "from-purple-500 to-pink-600"
                        },
                        {
                            icon: Zap,
                            title: t('welcome.features.structuredOutput.title'),
                            description: t('welcome.features.structuredOutput.description'),
                            color: "from-emerald-500 to-teal-600"
                        }
                    ].map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -4 }}
                        >
                            <Card className="h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/60 dark:border-gray-700/60 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 group shadow-lg dark:shadow-gray-900/20">
                                <CardContent className="p-6">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 shadow-md dark:shadow-lg`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

export default WelcomeGuide 