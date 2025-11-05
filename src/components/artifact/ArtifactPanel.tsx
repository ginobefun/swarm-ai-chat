'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import CodeArtifact from './CodeArtifact'
import DocumentArtifact from './DocumentArtifact'
import MermaidArtifact from './MermaidArtifact'
import ChartArtifact from './ChartArtifact'
import ArtifactVersionHistory from './ArtifactVersionHistory'
import { Artifact } from '@/types'
import { ArtifactVersion } from '@/lib/artifact/version-control'
import { Clock } from 'lucide-react'

interface ArtifactPanelProps {
  artifacts: Artifact[]
  isVisible?: boolean
  onClose?: () => void
  onPin?: (artifactId: string) => void
}

/**
 * ArtifactPanel Component
 * Main panel for displaying and managing artifacts
 * Supports multiple artifact types with tabbed interface
 */
const ArtifactPanel: React.FC<ArtifactPanelProps> = ({
  artifacts,
  isVisible = true,
  onClose,
  onPin
}) => {
  const [activeTab, setActiveTab] = useState(artifacts[0]?.id || '')
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [artifactVersions, setArtifactVersions] = useState<Record<string, ArtifactVersion[]>>({})

  if (!isVisible || artifacts.length === 0) {
    return (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900 items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Artifacts
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Artifacts will appear here when agents generate structured content
          </p>
        </div>
      </div>
    )
  }

  const renderArtifact = (artifact: Artifact) => {
    const commonProps = {
      title: artifact.title,
      content: artifact.content,
    }

    switch (artifact.type.toLowerCase()) {
      case 'code':
        return <CodeArtifact {...commonProps} language={artifact.language ?? undefined} />

      case 'document':
      case 'markdown':
        return <DocumentArtifact {...commonProps} />

      case 'mermaid':
        return <MermaidArtifact {...commonProps} />

      case 'chart':
        return <ChartArtifact {...commonProps} metadata={artifact.metadata} />

      case 'html':
      case 'svg':
      case 'react':
        return (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {artifact.type.toUpperCase()} Artifact
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Specialized renderer for {artifact.type} content
              </p>
              <pre className="text-xs font-mono text-left bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-96">
                {artifact.content}
              </pre>
            </div>
          </div>
        )

      default:
        return <DocumentArtifact {...commonProps} />
    }
  }

  const getArtifactIcon = (type: string): string => {
    const icons: Record<string, string> = {
      code: '💻',
      document: '📄',
      markdown: '📝',
      html: '🌐',
      svg: '🎨',
      chart: '📊',
      image: '🖼️',
      mermaid: '📐',
      react: '⚛️',
    }
    return icons[type.toLowerCase()] || '📦'
  }

  // Sort artifacts: pinned first
  const sortedArtifacts = [...artifacts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return 0
  })

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">📦</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Artifacts</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {artifacts.length} {artifacts.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="p-2"
            title={showVersionHistory ? "Hide version history" : "Show version history"}
          >
            <Clock className="w-4 h-4" />
          </Button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Close artifacts panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4">
          <TabsList className="w-full justify-start overflow-x-auto">
            {sortedArtifacts.map((artifact) => (
              <TabsTrigger
                key={artifact.id}
                value={artifact.id}
                className="relative flex items-center gap-2"
              >
                <span>{getArtifactIcon(artifact.type)}</span>
                <span className="max-w-32 truncate">{artifact.title}</span>
                {artifact.isPinned && (
                  <span className="text-xs">📌</span>
                )}
                {onPin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPin(artifact.id)
                    }}
                    className="ml-1 p-0.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    title={artifact.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {sortedArtifacts.map((artifact) => (
            <TabsContent
              key={artifact.id}
              value={artifact.id}
              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              {renderArtifact(artifact)}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  )
}

export default ArtifactPanel
