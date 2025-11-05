'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Artifact } from '@/types'
import { Copy, Download, Maximize2, Code, FileText, Image as ImageIcon } from 'lucide-react'

interface ArtifactMiniPreviewProps {
    artifact: Artifact
    onFullscreen?: (artifactId: string) => void
    className?: string
}

/**
 * ArtifactMiniPreview Component
 *
 * Displays a mini preview of artifacts inline within messages.
 * Features:
 * - Compact preview with syntax highlighting
 * - Quick actions: copy, download, fullscreen
 * - Supports multiple artifact types
 * - Responsive design
 *
 * Usage:
 * <ArtifactMiniPreview
 *   artifact={artifact}
 *   onFullscreen={(id) => openArtifactPanel(id)}
 * />
 */
const ArtifactMiniPreview: React.FC<ArtifactMiniPreviewProps> = ({
    artifact,
    onFullscreen,
    className = ''
}) => {
    const [copied, setCopied] = useState(false)

    // Get artifact icon based on type
    const getArtifactIcon = (type: string) => {
        const icons: Record<string, React.ReactNode> = {
            CODE: <Code className="w-4 h-4" />,
            DOCUMENT: <FileText className="w-4 h-4" />,
            MARKDOWN: <FileText className="w-4 h-4" />,
            IMAGE: <ImageIcon className="w-4 h-4" />,
            HTML: <Code className="w-4 h-4" />,
            SVG: <ImageIcon className="w-4 h-4" />,
            CHART: <ImageIcon className="w-4 h-4" />,
            MERMAID: <ImageIcon className="w-4 h-4" />,
            REACT: <Code className="w-4 h-4" />,
        }
        return icons[type] || <FileText className="w-4 h-4" />
    }

    // Get artifact color based on type
    const getArtifactColor = (_type: string) => {
        const colors: Record<string, string> = {
            CODE: 'from-blue-500 to-blue-600',
            DOCUMENT: 'from-slate-500 to-slate-600',
            MARKDOWN: 'from-green-500 to-green-600',
            IMAGE: 'from-purple-500 to-purple-600',
            HTML: 'from-orange-500 to-orange-600',
            SVG: 'from-pink-500 to-pink-600',
            CHART: 'from-indigo-500 to-indigo-600',
            MERMAID: 'from-teal-500 to-teal-600',
            REACT: 'from-cyan-500 to-cyan-600',
        }
        return colors[artifact.type] || 'from-slate-500 to-slate-600'
    }

    // Truncate content for preview
    const getTruncatedContent = (content: string, maxLines: number = 5) => {
        const lines = content.split('\n')
        if (lines.length <= maxLines) {
            return content
        }
        return lines.slice(0, maxLines).join('\n') + '\n...'
    }

    // Copy artifact content to clipboard
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(artifact.content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    // Download artifact as file
    const handleDownload = () => {
        const blob = new Blob([artifact.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${artifact.title || 'artifact'}.${getFileExtension(artifact.type)}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Get file extension based on artifact type
    const getFileExtension = (type: string) => {
        const extensions: Record<string, string> = {
            CODE: artifact.language || 'txt',
            DOCUMENT: 'txt',
            MARKDOWN: 'md',
            HTML: 'html',
            SVG: 'svg',
            CHART: 'json',
            MERMAID: 'mmd',
            REACT: 'jsx',
        }
        return extensions[type] || 'txt'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden bg-white dark:bg-slate-800 shadow-sm ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getArtifactColor(artifact.type)} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                        {getArtifactIcon(artifact.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 truncate">
                            {artifact.title}
                        </h4>
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                            {artifact.type}
                            {artifact.language && ` • ${artifact.language}`}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1 ml-2">
                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-800/50 rounded transition-colors"
                        title={copied ? 'Copied!' : 'Copy content'}
                    >
                        {copied ? (
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="text-green-600 dark:text-green-400"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                        ) : (
                            <Copy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                    </button>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-800/50 rounded transition-colors"
                        title="Download artifact"
                    >
                        <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </button>

                    {/* Fullscreen Button */}
                    {onFullscreen && (
                        <button
                            onClick={() => onFullscreen(artifact.id)}
                            className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-800/50 rounded transition-colors"
                            title="View in fullscreen"
                        >
                            <Maximize2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content Preview */}
            <div className="p-3">
                <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 rounded p-3 overflow-x-auto max-h-32 scrollbar-thin">
                    <code>{getTruncatedContent(artifact.content)}</code>
                </pre>
            </div>

            {/* Footer - View Full Button */}
            {onFullscreen && (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/50 border-t border-purple-200 dark:border-purple-800">
                    <button
                        onClick={() => onFullscreen(artifact.id)}
                        className="w-full text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center justify-center gap-1"
                    >
                        View Full Artifact
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </motion.div>
    )
}

export default ArtifactMiniPreview
