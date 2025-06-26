'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SwarmLogoProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    showPulse?: boolean
    onClick?: () => void
}

/**
 * SwarmAI Logo - 多智能体协作标识
 * 
 * 设计理念：
 * - 中心圆点代表 AI 核心
 * - 四个小圆点代表智能体节点
 * - 连接线显示协作关系
 * - 旋转动画体现动态协作
 */
export const SwarmLogo: React.FC<SwarmLogoProps> = ({
    size = 'md',
    className = '',
    showPulse = true,
    onClick
}) => {
    // 根据尺寸设置对应的样式
    const sizeConfig = {
        sm: {
            container: 'w-8 h-8',
            core: 'w-2 h-2',
            agent: 'w-1 h-1',
            lineWidth: 'h-0.5 w-0.5'
        },
        md: {
            container: 'w-10 h-10',
            core: 'w-3 h-3',
            agent: 'w-1.5 h-1.5',
            lineWidth: 'h-0.5 w-0.5'
        },
        lg: {
            container: 'w-12 h-12',
            core: 'w-4 h-4',
            agent: 'w-2 h-2',
            lineWidth: 'h-0.5 w-0.5'
        }
    }

    const config = sizeConfig[size]

    return (
        <div className={`relative ${className}`}>
            <motion.div
                animate={showPulse ? {
                    boxShadow: [
                        "0 0 0 0 rgba(99, 102, 241, 0)",
                        "0 0 0 8px rgba(99, 102, 241, 0.1)",
                        "0 0 0 0 rgba(99, 102, 241, 0)"
                    ]
                } : {}}
                transition={{ duration: 3, repeat: Infinity }}
                className={`${config.container} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25 relative overflow-hidden cursor-pointer`}
                onClick={onClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {/* 中心 AI 核心 */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`${config.core} bg-white rounded-full opacity-90 relative z-10`}
                />

                {/* 四个智能体节点 */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                >
                    {/* 右侧智能体 */}
                    <div className={`absolute ${config.agent} bg-indigo-200 rounded-full top-1/2 right-1 -translate-y-1/2`} />
                    {/* 左侧智能体 */}
                    <div className={`absolute ${config.agent} bg-indigo-200 rounded-full top-1/2 left-1 -translate-y-1/2`} />
                    {/* 上方智能体 */}
                    <div className={`absolute ${config.agent} bg-indigo-200 rounded-full top-1 left-1/2 -translate-x-1/2`} />
                    {/* 下方智能体 */}
                    <div className={`absolute ${config.agent} bg-indigo-200 rounded-full bottom-1 left-1/2 -translate-x-1/2`} />
                </motion.div>

                {/* 连接线效果 */}
                <div className="absolute inset-0 opacity-70">
                    {/* 水平连接线 */}
                    <div className={`absolute top-1/2 left-2 right-2 ${config.lineWidth} bg-white/60 -translate-y-1/2`} />
                    {/* 垂直连接线 */}
                    <div className={`absolute left-1/2 top-2 bottom-2 ${config.lineWidth} bg-white/60 -translate-x-1/2`} />
                </div>
            </motion.div>

            {/* 动态光环效果 */}
            {showPulse && (
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-2 border-indigo-400/30 hover:border-indigo-400/50"
                />
            )}
        </div>
    )
} 