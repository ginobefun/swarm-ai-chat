'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TypingAgent {
    id: string
    name: string
    avatar: string
    avatarStyle?: string
}

interface AgentTypingIndicatorProps {
    agents: TypingAgent[]
    className?: string
}

/**
 * AgentTypingIndicator Component
 *
 * Displays real-time typing indicators for multiple agents responding simultaneously.
 * Features:
 * - Pulsing avatar animation for active agents
 * - Supports multiple agents typing at once (parallel mode)
 * - Smooth enter/exit animations
 * - Responsive design
 *
 * Usage:
 * <AgentTypingIndicator
 *   agents={[
 *     { id: '1', name: 'Developer', avatar: '👨‍💻' },
 *     { id: '2', name: 'Designer', avatar: '🎨' }
 *   ]}
 * />
 */
const AgentTypingIndicator: React.FC<AgentTypingIndicatorProps> = React.memo(({
    agents,
    className = ''
}) => {
    if (agents.length === 0) {
        return null
    }

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            <AnimatePresence mode="popLayout">
                {agents.map((agent, index) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                            duration: 0.2,
                            delay: index * 0.1, // Stagger animation
                        }}
                        className="flex gap-3 items-start"
                    >
                        {/* Pulsing Avatar */}
                        <motion.div
                            className="relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 shadow-lg text-white ring-2 ring-white dark:ring-slate-800"
                            style={agent.avatarStyle ? { background: agent.avatarStyle } : undefined}
                            animate={{
                                boxShadow: [
                                    '0 0 0 0 rgba(99, 102, 241, 0.7)',
                                    '0 0 0 10px rgba(99, 102, 241, 0)',
                                ],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        >
                            {agent.avatar}

                            {/* Animated thinking icon */}
                            <motion.div
                                className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center shadow-md"
                                animate={{
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                <svg
                                    className="w-2.5 h-2.5 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                            </motion.div>
                        </motion.div>

                        {/* Typing Message Bubble */}
                        <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] lg:max-w-[70%] min-w-0">
                            {/* Agent name */}
                            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 px-2">
                                {agent.name}
                            </div>

                            {/* Message bubble with typing animation */}
                            <motion.div
                                className="relative bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-200 dark:border-indigo-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm"
                                animate={{
                                    opacity: [0.7, 1, 0.7],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                {/* Typing dots */}
                                <div className="flex items-center gap-1">
                                    {[0, 1, 2].map((i) => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full"
                                            animate={{
                                                y: [0, -5, 0],
                                                scale: [1, 1.1, 1],
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: Infinity,
                                                delay: i * 0.15,
                                                ease: 'easeInOut',
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Message tail */}
                                <div className="absolute top-0 left-0 w-3 h-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-l border-t border-indigo-200 dark:border-indigo-800 rounded-br-full transform -translate-x-2 -translate-y-1" />
                            </motion.div>

                            {/* Status text */}
                            <motion.div
                                className="text-xs text-indigo-600 dark:text-indigo-400 px-2 font-medium"
                                animate={{
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                            >
                                Thinking...
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Summary for multiple agents */}
            {agents.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-medium text-indigo-700 dark:text-indigo-300 self-start"
                >
                    <div className="flex -space-x-2">
                        {agents.slice(0, 3).map((agent) => (
                            <div
                                key={agent.id}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] ring-2 ring-white dark:ring-slate-800 bg-gradient-to-br from-indigo-500 to-purple-600"
                                style={agent.avatarStyle ? { background: agent.avatarStyle } : undefined}
                            >
                                {agent.avatar}
                            </div>
                        ))}
                    </div>
                    <span>
                        {agents.length} agents collaborating
                        {agents.length > 3 && ` (+${agents.length - 3} more)`}
                    </span>
                </motion.div>
            )}
        </div>
    )
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if agents array changes
    if (prevProps.agents.length !== nextProps.agents.length) {
        return false // Re-render if length changes
    }

    // Compare each agent in the array
    return prevProps.agents.every((agent, index) => {
        const nextAgent = nextProps.agents[index]
        return (
            agent.id === nextAgent.id &&
            agent.name === nextAgent.name &&
            agent.avatar === nextAgent.avatar &&
            agent.avatarStyle === nextAgent.avatarStyle
        )
    }) && prevProps.className === nextProps.className
})

export default AgentTypingIndicator
