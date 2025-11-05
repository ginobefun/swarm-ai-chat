'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, GitBranch, ChevronDown, ChevronRight, Eye, RotateCcw } from 'lucide-react'
import { Artifact } from '@/types'
import {
  ArtifactVersion,
  groupVersionsByTime,
  formatVersionNumber,
  generateVersionSummary,
  calculateSimilarity,
} from '@/lib/artifact/version-control'

interface ArtifactVersionHistoryProps {
  artifact: Artifact
  versions: ArtifactVersion[]
  onVersionSelect?: (version: ArtifactVersion) => void
  onVersionRestore?: (version: ArtifactVersion) => void
  onCompare?: (v1: ArtifactVersion, v2: ArtifactVersion) => void
}

/**
 * ArtifactVersionHistory Component
 *
 * Displays version history for an artifact with the following features:
 * - Timeline view of all versions
 * - Version comparison (diff view)
 * - Version restoration
 * - Change summaries
 * - Similarity scores
 *
 * Usage:
 * <ArtifactVersionHistory
 *   artifact={currentArtifact}
 *   versions={allVersions}
 *   onVersionRestore={handleRestore}
 * />
 */
const ArtifactVersionHistory: React.FC<ArtifactVersionHistoryProps> = ({
  artifact,
  versions,
  onVersionSelect,
  onVersionRestore,
  onCompare,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Today']))
  const [selectedVersion, setSelectedVersion] = useState<ArtifactVersion | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareWith, setCompareWith] = useState<ArtifactVersion | null>(null)

  // Group versions by time
  const groupedVersions = groupVersionsByTime(versions)

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName)
    } else {
      newExpanded.add(groupName)
    }
    setExpandedGroups(newExpanded)
  }

  // Handle version selection
  const handleVersionClick = (version: ArtifactVersion) => {
    if (compareMode) {
      if (!selectedVersion) {
        setSelectedVersion(version)
      } else {
        setCompareWith(version)
        onCompare?.(selectedVersion, version)
      }
    } else {
      setSelectedVersion(version)
      onVersionSelect?.(version)
    }
  }

  // Format date
  const formatDate = (date: Date | undefined): string => {
    if (!date) return 'Unknown'
    const d = new Date(date)
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Version History
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {versions.length} versions
            </p>
          </div>
        </div>

        {/* Compare toggle */}
        <button
          onClick={() => {
            setCompareMode(!compareMode)
            setSelectedVersion(null)
            setCompareWith(null)
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            compareMode
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
          }`}
        >
          <GitBranch className="w-4 h-4 inline mr-1" />
          Compare
        </button>
      </div>

      {/* Compare mode instructions */}
      {compareMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            {!selectedVersion
              ? 'Select first version to compare'
              : !compareWith
              ? 'Select second version to compare'
              : `Comparing ${formatVersionNumber(selectedVersion.versionNumber)} with ${formatVersionNumber(compareWith.versionNumber)}`}
          </p>
        </motion.div>
      )}

      {/* Version list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedVersions).map(([groupName, groupVersions]) => (
          <div key={groupName} className="space-y-2">
            {/* Group header */}
            <button
              onClick={() => toggleGroup(groupName)}
              className="flex items-center gap-2 w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {expandedGroups.has(groupName) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {groupName} ({groupVersions.length})
            </button>

            {/* Group versions */}
            <AnimatePresence>
              {expandedGroups.has(groupName) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 ml-6"
                >
                  {groupVersions.map((version, index) => {
                    const isSelected = selectedVersion?.id === version.id
                    const isCompareWith = compareWith?.id === version.id
                    const isLatest = index === 0 && groupName === Object.keys(groupedVersions)[0]

                    // Calculate similarity with current
                    const similarity = calculateSimilarity(artifact, version)

                    return (
                      <motion.div
                        key={version.id}
                        layout
                        className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          isSelected || isCompareWith
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                        onClick={() => handleVersionClick(version)}
                      >
                        {/* Version header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                              {formatVersionNumber(version.versionNumber)}
                            </span>
                            {isLatest && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                                Latest
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {/* View button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onVersionSelect?.(version)
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                              title="View version"
                            >
                              <Eye className="w-3 h-3 text-gray-500" />
                            </button>

                            {/* Restore button */}
                            {!isLatest && onVersionRestore && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onVersionRestore(version)
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
                                title="Restore this version"
                              >
                                <RotateCcw className="w-3 h-3 text-gray-500" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Change description */}
                        {version.changeDescription && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {version.changeDescription}
                          </p>
                        )}

                        {/* Version metadata */}
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(version.updatedAt || version.createdAt)}</span>
                          <span className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${
                              similarity >= 90 ? 'bg-green-500' :
                              similarity >= 70 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            {similarity}% similar
                          </span>
                        </div>

                        {/* Change summary */}
                        {version.previousVersionId && (
                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                            {generateVersionSummary(
                              versions.find((v) => v.id === version.previousVersionId) || version,
                              version
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* Empty state */}
        {versions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Clock className="w-12 h-12 text-gray-400 mb-3" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Version History
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Changes to this artifact will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtifactVersionHistory
