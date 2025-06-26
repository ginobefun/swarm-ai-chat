"use client"

import React from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
    children: React.ReactNode
    className?: string
    delay?: number
    duration?: number
    hover?: boolean
    scale?: number
    y?: number
    onClick?: () => void
    disabled?: boolean
    loading?: boolean
    variant?: 'default' | 'ghost' | 'outline' | 'gradient'
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
    children,
    className = '',
    delay = 0,
    duration = 0.6,
    hover = true,
    scale = 1.02,
    y = -4,
    onClick,
    disabled = false,
    loading = false,
    variant = 'default'
}) => {
    const variants = {
        default: 'bg-card border border-border shadow-sm hover:shadow-lg',
        ghost: 'bg-transparent hover:bg-accent/50',
        outline: 'bg-transparent border-2 border-border hover:border-primary/50',
        gradient: 'bg-gradient-to-br from-card via-card to-accent/5 border border-primary/20 shadow-lg hover:shadow-xl'
    }

    const baseClasses = cn(
        'rounded-lg transition-all duration-300 ease-out',
        variants[variant],
        onClick && !disabled && 'cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
    )

    const cardVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration,
                delay,
                ease: "easeOut"
            }
        }
    }

    const hoverVariants = hover ? {
        scale,
        y,
        transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 10
        }
    } : {}

    const tapVariants = onClick && !disabled ? {
        scale: scale * 0.98,
        transition: {
            duration: 0.1
        }
    } : {}

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={hoverVariants}
            whileTap={tapVariants}
            onClick={!disabled && !loading ? onClick : undefined}
            className={baseClasses}
        >
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center p-8"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

// 特殊效果卡片
export const GlowCard: React.FC<AnimatedCardProps> = (props) => {
    return (
        <div className="relative group">
            {/* 发光效果 */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
            <AnimatedCard {...props} className={cn('relative', props.className)} />
        </div>
    )
}

// 渐变边框卡片
export const GradientBorderCard: React.FC<AnimatedCardProps> = (props) => {
    return (
        <div className="relative group">
            {/* 渐变边框 */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-lg p-[1px]">
                <div className="h-full w-full bg-background rounded-[calc(0.5rem-1px)]" />
            </div>
            <AnimatedCard {...props} className={cn('relative bg-transparent border-0', props.className)} />
        </div>
    )
}

// 浮动效果卡片
export const FloatingCard: React.FC<AnimatedCardProps> = (props) => {
    return (
        <motion.div
            animate={{
                y: [0, -10, 0],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
            }}
        >
            <AnimatedCard {...props} />
        </motion.div>
    )
}

export default AnimatedCard 