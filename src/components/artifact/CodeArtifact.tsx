'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CodeArtifactProps {
  title: string
  content: string
  language?: string
  onCopy?: () => void
  onDownload?: () => void
}

/**
 * CodeArtifact Component
 * Renders code with syntax highlighting, copy, and download functionality
 */
const CodeArtifact: React.FC<CodeArtifactProps> = ({
  title,
  content,
  language = 'text',
  onCopy,
  onDownload
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}.${getFileExtension(language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onDownload?.()
  }

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      go: 'go',
      rust: 'rs',
      cpp: 'cpp',
      c: 'c',
      html: 'html',
      css: 'css',
      json: 'json',
      yaml: 'yaml',
      markdown: 'md',
      sql: 'sql',
      shell: 'sh',
      bash: 'sh',
    }
    return extensions[lang.toLowerCase()] || 'txt'
  }

  const getLanguageColor = (lang: string): string => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      python: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      java: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      rust: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    }
    return colors[lang.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-lg">💻</span>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
            {language && (
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getLanguageColor(language)}`}>
                {language}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            title={copied ? 'Copied!' : 'Copy code'}
          >
            {copied ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            title="Download code"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm font-mono bg-slate-950 text-slate-100 overflow-x-auto h-full">
          <code>{content}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeArtifact
