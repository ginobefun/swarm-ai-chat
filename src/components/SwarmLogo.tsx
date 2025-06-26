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
 * SwarmAI Logo Component
 * 
 * A dynamic logo representing multi-agent collaboration for the SwarmAI platform.
 * 
 * Design Concept:
 * - Central core represents the AI hub
 * - Four orbiting nodes represent individual AI agents
 * - Connection lines show collaborative relationships
 * - Rotation animation demonstrates dynamic teamwork
 * 
 * Features:
 * - Responsive sizing (sm, md, lg)
 * - Optional pulse animation effect
 * - Smooth hover interactions
 * - Accessible click handling
 */
export const SwarmLogo: React.FC<SwarmLogoProps> = ({
    size = 'md',
    className = '',
    showPulse = true,
    onClick
}) => {
    // Size configuration for different use cases
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
                role={onClick ? "button" : undefined}
                tabIndex={onClick ? 0 : undefined}
                onKeyDown={onClick ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onClick()
                    }
                } : undefined}
            >
                {/* Central AI Core */}
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className={`${config.core} bg-white rounded-full opacity-90 relative z-10`}
                />

                {/* Orbiting AI Agent Nodes */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                >
                    {/* Right Agent */}
                    <div className={`absolute ${config.agent} bg-indigo-200 rounded-full top-1/2 right-1 -translate-y-1/2`} />
                    {/* Left Agent */}
                    <div className={`absolute ${config.agent} bg-indigo-200 rounded-full top-1/2 left-1 -translate-y-1/2`} />
                    {/* Top Agent */}
                    <div className={`absolute ${config.agent} bg-indigo-200 rounded-full top-1 left-1/2 -translate-x-1/2`} />
                    {/* Bottom Agent */}
                    <div className={`absolute ${config.agent} bg-indigo-200 rounded-full bottom-1 left-1/2 -translate-x-1/2`} />
                </motion.div>

                {/* Connection Lines - Representing Collaboration */}
                <div className="absolute inset-0 opacity-70">
                    {/* Horizontal Connection */}
                    <div className={`absolute top-1/2 left-2 right-2 ${config.lineWidth} bg-white/60 -translate-y-1/2`} />
                    {/* Vertical Connection */}
                    <div className={`absolute left-1/2 top-2 bottom-2 ${config.lineWidth} bg-white/60 -translate-x-1/2`} />
                </div>
            </motion.div>

            {/* Pulse Ring Effect - Optional visual enhancement */}
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