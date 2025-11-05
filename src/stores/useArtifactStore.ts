import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Artifact } from '@/types'

/**
 * Artifact Store - Manages artifacts and their state
 *
 * Features:
 * - Artifact management (add, update, delete)
 * - Active artifact selection
 * - Pin/unpin artifacts
 * - Group artifacts by message
 */

interface ArtifactState {
  // Artifacts
  artifacts: Artifact[]
  activeArtifactId: string | null

  // Actions
  addArtifact: (artifact: Artifact) => void
  addArtifacts: (artifacts: Artifact[]) => void
  updateArtifact: (id: string, updates: Partial<Artifact>) => void
  removeArtifact: (id: string) => void
  clearArtifacts: () => void
  setActiveArtifact: (id: string | null) => void
  togglePin: (id: string) => void

  // Selectors (computed values)
  getArtifactsByMessage: (messageId: string) => Artifact[]
  getActiveArtifact: () => Artifact | undefined
}

export const useArtifactStore = create<ArtifactState>()(
  devtools(
    (set, get) => ({
      // Initial state
      artifacts: [],
      activeArtifactId: null,

      // Actions
      addArtifact: (artifact) =>
        set((state) => ({
          artifacts: [...state.artifacts, artifact],
        }), false, 'artifact/addArtifact'),

      addArtifacts: (artifacts) =>
        set((state) => ({
          artifacts: [...state.artifacts, ...artifacts],
        }), false, 'artifact/addArtifacts'),

      updateArtifact: (id, updates) =>
        set((state) => ({
          artifacts: state.artifacts.map((art) =>
            art.id === id ? { ...art, ...updates } : art
          ),
        }), false, 'artifact/updateArtifact'),

      removeArtifact: (id) =>
        set((state) => ({
          artifacts: state.artifacts.filter((art) => art.id !== id),
          activeArtifactId: state.activeArtifactId === id ? null : state.activeArtifactId,
        }), false, 'artifact/removeArtifact'),

      clearArtifacts: () =>
        set({ artifacts: [], activeArtifactId: null }, false, 'artifact/clearArtifacts'),

      setActiveArtifact: (id) =>
        set({ activeArtifactId: id }, false, 'artifact/setActiveArtifact'),

      togglePin: (id) =>
        set((state) => ({
          artifacts: state.artifacts.map((art) =>
            art.id === id ? { ...art, isPinned: !art.isPinned } : art
          ),
        }), false, 'artifact/togglePin'),

      // Selectors
      getArtifactsByMessage: (messageId) => {
        const state = get()
        return state.artifacts.filter((art) => art.messageId === messageId)
      },

      getActiveArtifact: () => {
        const state = get()
        return state.artifacts.find((art) => art.id === state.activeArtifactId)
      },
    }),
    { name: 'ArtifactStore' }
  )
)
