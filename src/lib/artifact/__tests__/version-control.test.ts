import { describe, it, expect, beforeEach } from 'vitest'
import {
  createVersion,
  generateDiff,
  calculateSimilarity,
  groupVersionsByTime,
  formatVersionNumber,
  generateVersionSummary,
  type Artifact,
  type ArtifactVersion,
} from '../version-control'

describe('Artifact Version Control', () => {
  let baseArtifact: Artifact

  beforeEach(() => {
    baseArtifact = {
      id: 'artifact-1',
      messageId: 'msg-1',
      sessionId: 'session-1',
      type: 'CODE',
      title: 'Test Code',
      content: 'function hello() {\n  console.log("Hello");\n}',
      version: 1,
      createdAt: new Date(),
    }
  })

  describe('createVersion', () => {
    it('should create a new version with incremented version number', () => {
      const newContent = 'function hello() {\n  console.log("Hello, World!");\n}'
      const newVersion = createVersion(baseArtifact, newContent, 'Updated greeting')

      expect(newVersion.version).toBe(2)
      expect(newVersion.versionNumber).toBe(2)
      expect(newVersion.content).toBe(newContent)
      expect(newVersion.changeDescription).toBe('Updated greeting')
      expect(newVersion.previousVersionId).toBe(baseArtifact.id)
    })

    it('should handle artifacts without version', () => {
      const artifactNoVersion = { ...baseArtifact, version: undefined }
      const newVersion = createVersion(artifactNoVersion, 'new content')

      expect(newVersion.version).toBe(2)
      expect(newVersion.versionNumber).toBe(2)
    })
  })

  describe('generateDiff', () => {
    it('should detect added lines', () => {
      const oldArtifact = {
        ...baseArtifact,
        content: 'line1\nline2',
      }
      const newArtifact = {
        ...baseArtifact,
        content: 'line1\nline2\nline3',
      }

      const diff = generateDiff(oldArtifact, newArtifact)

      expect(diff.stats.additions).toBeGreaterThan(0)
      expect(diff.changes.some((c) => c.type === 'added')).toBe(true)
    })

    it('should detect deleted lines', () => {
      const oldArtifact = {
        ...baseArtifact,
        content: 'line1\nline2\nline3',
      }
      const newArtifact = {
        ...baseArtifact,
        content: 'line1\nline3',
      }

      const diff = generateDiff(oldArtifact, newArtifact)

      expect(diff.stats.deletions).toBeGreaterThan(0)
      expect(diff.changes.some((c) => c.type === 'deleted')).toBe(true)
    })

    it('should detect unchanged lines', () => {
      const oldArtifact = {
        ...baseArtifact,
        content: 'line1\nline2',
      }
      const newArtifact = {
        ...baseArtifact,
        content: 'line1\nline2',
      }

      const diff = generateDiff(oldArtifact, newArtifact)

      expect(diff.stats.additions).toBe(0)
      expect(diff.stats.deletions).toBe(0)
      expect(diff.changes.every((c) => c.type === 'unchanged')).toBe(true)
    })
  })

  describe('calculateSimilarity', () => {
    it('should return 100% for identical artifacts', () => {
      const artifact2 = { ...baseArtifact }
      const similarity = calculateSimilarity(baseArtifact, artifact2)

      expect(similarity).toBe(100)
    })

    it('should return 0% for completely different artifacts', () => {
      const artifact2 = {
        ...baseArtifact,
        content: 'completely\ndifferent\ncontent\nhere',
      }
      const similarity = calculateSimilarity(baseArtifact, artifact2)

      expect(similarity).toBeLessThan(50)
    })

    it('should calculate partial similarity', () => {
      const artifact2 = {
        ...baseArtifact,
        content: baseArtifact.content + '\nnew line',
      }
      const similarity = calculateSimilarity(baseArtifact, artifact2)

      expect(similarity).toBeGreaterThan(50)
      expect(similarity).toBeLessThan(100)
    })
  })

  describe('groupVersionsByTime', () => {
    it('should group versions by time periods', () => {
      const now = new Date()
      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const lastWeek = new Date(now)
      lastWeek.setDate(lastWeek.getDate() - 8)

      const versions: ArtifactVersion[] = [
        {
          ...baseArtifact,
          id: 'v1',
          versionNumber: 1,
          updatedAt: now,
        },
        {
          ...baseArtifact,
          id: 'v2',
          versionNumber: 2,
          updatedAt: yesterday,
        },
        {
          ...baseArtifact,
          id: 'v3',
          versionNumber: 3,
          updatedAt: lastWeek,
        },
      ]

      const grouped = groupVersionsByTime(versions)

      expect(grouped.Today).toBeDefined()
      expect(grouped.Yesterday).toBeDefined()
      expect(grouped.Older).toBeDefined()
      expect(grouped.Today?.length).toBe(1)
      expect(grouped.Yesterday?.length).toBe(1)
    })
  })

  describe('formatVersionNumber', () => {
    it('should format version numbers with padding', () => {
      expect(formatVersionNumber(1)).toBe('v01')
      expect(formatVersionNumber(9)).toBe('v09')
      expect(formatVersionNumber(10)).toBe('v10')
      expect(formatVersionNumber(99)).toBe('v99')
    })
  })

  describe('generateVersionSummary', () => {
    it('should generate summary for changes', () => {
      const oldVersion = {
        ...baseArtifact,
        content: 'line1\nline2',
      }
      const newVersion = {
        ...baseArtifact,
        content: 'line1\nline2\nline3',
      }

      const summary = generateVersionSummary(oldVersion, newVersion)

      expect(summary).toContain('lines')
      expect(summary).not.toBe('No changes')
    })

    it('should return "No changes" for identical versions', () => {
      const summary = generateVersionSummary(baseArtifact, baseArtifact)

      expect(summary).toBe('No changes')
    })
  })
})
