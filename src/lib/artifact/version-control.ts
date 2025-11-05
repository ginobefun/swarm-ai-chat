/**
 * Artifact Version Control System
 *
 * Manages artifact versioning, history, and comparisons.
 * Supports version creation, rollback, and diff generation.
 */

import { Artifact } from '@/types'

export interface ArtifactVersion extends Artifact {
  versionNumber: number
  previousVersionId?: string
  createdBy?: string
  changeDescription?: string
}

/**
 * Create a new version of an artifact
 */
export function createVersion(
  currentArtifact: Artifact,
  newContent: string,
  changeDescription?: string
): ArtifactVersion {
  const currentVersion = currentArtifact.version || 1

  return {
    ...currentArtifact,
    id: `${currentArtifact.id}-v${currentVersion + 1}`,
    content: newContent,
    version: currentVersion + 1,
    versionNumber: currentVersion + 1,
    previousVersionId: currentArtifact.id,
    changeDescription,
    updatedAt: new Date(),
  }
}

/**
 * Generate diff between two artifact versions
 */
export function generateDiff(
  oldVersion: Artifact,
  newVersion: Artifact
): ArtifactDiff {
  const oldLines = oldVersion.content.split('\n')
  const newLines = newVersion.content.split('\n')

  const changes: DiffLine[] = []
  let oldIndex = 0
  let newIndex = 0

  // Simple line-by-line diff algorithm
  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex]
    const newLine = newLines[newIndex]

    if (oldLine === newLine) {
      // No change
      changes.push({
        type: 'unchanged',
        oldLineNumber: oldIndex + 1,
        newLineNumber: newIndex + 1,
        content: oldLine,
      })
      oldIndex++
      newIndex++
    } else if (oldIndex >= oldLines.length) {
      // Addition
      changes.push({
        type: 'added',
        newLineNumber: newIndex + 1,
        content: newLine,
      })
      newIndex++
    } else if (newIndex >= newLines.length) {
      // Deletion
      changes.push({
        type: 'deleted',
        oldLineNumber: oldIndex + 1,
        content: oldLine,
      })
      oldIndex++
    } else {
      // Check if next lines match (modified line)
      const nextOldInNew = newLines.indexOf(oldLine, newIndex)
      const nextNewInOld = oldLines.indexOf(newLine, oldIndex)

      if (nextOldInNew !== -1 && (nextNewInOld === -1 || nextOldInNew < nextNewInOld)) {
        // Line was added
        changes.push({
          type: 'added',
          newLineNumber: newIndex + 1,
          content: newLine,
        })
        newIndex++
      } else if (nextNewInOld !== -1) {
        // Line was deleted
        changes.push({
          type: 'deleted',
          oldLineNumber: oldIndex + 1,
          content: oldLine,
        })
        oldIndex++
      } else {
        // Line was modified
        changes.push({
          type: 'deleted',
          oldLineNumber: oldIndex + 1,
          content: oldLine,
        })
        changes.push({
          type: 'added',
          newLineNumber: newIndex + 1,
          content: newLine,
        })
        oldIndex++
        newIndex++
      }
    }
  }

  return {
    oldVersion: {
      id: oldVersion.id,
      version: oldVersion.version || 1,
      title: oldVersion.title,
    },
    newVersion: {
      id: newVersion.id,
      version: newVersion.version || 1,
      title: newVersion.title,
    },
    changes,
    stats: {
      additions: changes.filter((c) => c.type === 'added').length,
      deletions: changes.filter((c) => c.type === 'deleted').length,
      modifications: Math.floor(
        changes.filter((c) => c.type === 'deleted' || c.type === 'added').length / 2
      ),
    },
  }
}

export interface DiffLine {
  type: 'added' | 'deleted' | 'unchanged'
  oldLineNumber?: number
  newLineNumber?: number
  content: string
}

export interface ArtifactDiff {
  oldVersion: {
    id: string
    version: number
    title: string
  }
  newVersion: {
    id: string
    version: number
    title: string
  }
  changes: DiffLine[]
  stats: {
    additions: number
    deletions: number
    modifications: number
  }
}

/**
 * Calculate similarity percentage between two artifacts
 */
export function calculateSimilarity(
  artifact1: Artifact,
  artifact2: Artifact
): number {
  const lines1 = artifact1.content.split('\n')
  const lines2 = artifact2.content.split('\n')

  const maxLines = Math.max(lines1.length, lines2.length)
  if (maxLines === 0) return 100

  let matchingLines = 0
  const minLines = Math.min(lines1.length, lines2.length)

  for (let i = 0; i < minLines; i++) {
    if (lines1[i] === lines2[i]) {
      matchingLines++
    }
  }

  return Math.round((matchingLines / maxLines) * 100)
}

/**
 * Group versions by time periods
 */
export function groupVersionsByTime(
  versions: ArtifactVersion[]
): Record<string, ArtifactVersion[]> {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  const groups: Record<string, ArtifactVersion[]> = {
    Today: [],
    Yesterday: [],
    'Last 7 days': [],
    Older: [],
  }

  versions.forEach((version) => {
    const versionDate = version.updatedAt || version.createdAt
    if (!versionDate) {
      groups.Older.push(version)
      return
    }

    const date = new Date(versionDate)

    if (date >= today) {
      groups.Today.push(version)
    } else if (date >= yesterday) {
      groups.Yesterday.push(version)
    } else if (date >= lastWeek) {
      groups['Last 7 days'].push(version)
    } else {
      groups.Older.push(version)
    }
  })

  // Remove empty groups
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key]
    }
  })

  return groups
}

/**
 * Format version number for display
 */
export function formatVersionNumber(version: number): string {
  return `v${version.toString().padStart(2, '0')}`
}

/**
 * Generate version summary
 */
export function generateVersionSummary(
  oldVersion: Artifact,
  newVersion: Artifact
): string {
  const diff = generateDiff(oldVersion, newVersion)
  const { additions, deletions } = diff.stats

  if (additions === 0 && deletions === 0) {
    return 'No changes'
  }

  const parts: string[] = []
  if (additions > 0) parts.push(`+${additions} lines`)
  if (deletions > 0) parts.push(`-${deletions} lines`)

  return parts.join(', ')
}
