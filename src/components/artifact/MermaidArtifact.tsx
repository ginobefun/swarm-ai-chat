'use client'

import React, { useEffect, useRef, useState } from 'react'

interface MermaidArtifactProps {
  title: string
  content: string
  onExport?: () => void
}

/**
 * MermaidArtifact Component
 * Renders Mermaid diagrams (flowcharts, sequence diagrams, etc.)
 * Note: In production, you'll need to install mermaid package: npm install mermaid
 */
const MermaidArtifact: React.FC<MermaidArtifactProps> = ({
  title,
  content,
  onExport
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
    const [_isRendered, setIsRendered] = useState(false)

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return

      try {
        // In production, use: import mermaid from 'mermaid'
        // For now, we'll show a placeholder
        setIsRendered(true)
        setError(null)

        // Production code:
        // const { default: mermaid } = await import('mermaid')
        // mermaid.initialize({ startOnLoad: false, theme: 'default' })
        // const { svg } = await mermaid.render('mermaid-diagram', content)
        // containerRef.current.innerHTML = svg
      } catch (err) {
        console.error('Failed to render Mermaid diagram:', err)
        setError('Failed to render diagram')
      }
    }

    renderDiagram()
  }, [content])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/\s+/g, '_')}.mmd`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    onExport?.()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-lg">📐</span>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs rounded font-medium">
            Mermaid
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            title="Copy diagram source"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            onClick={handleExport}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
            title="Export diagram"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Diagram Content */}
      <div className="flex-1 overflow-auto p-6 bg-white dark:bg-slate-900">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600 dark:text-red-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Placeholder until mermaid is installed */}
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-center p-8">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-2">
                  Mermaid Diagram
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-400 mb-4">
                  To enable diagram rendering, install mermaid:
                </p>
                <code className="bg-slate-900 text-slate-100 px-3 py-1 rounded text-xs">
                  npm install mermaid
                </code>
                <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700 text-left">
                  <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {content}
                  </pre>
                </div>
              </div>
            </div>

            {/* Production rendering container */}
            <div ref={containerRef} className="hidden mermaid-container flex items-center justify-center" />
          </>
        )}
      </div>
    </div>
  )
}

export default MermaidArtifact
