import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

/**
 * UI Store - Manages UI state (sidebars, panels, modals)
 *
 * Features:
 * - Sidebar visibility
 * - Workspace panel state
 * - Modal management
 * - Theme preferences
 * - Layout preferences
 */

interface UIState {
  // Panel visibility
  isSidebarOpen: boolean
  isWorkspaceOpen: boolean

  // Modal state
  activeModal: string | null
  modalData: Record<string, any>

  // Theme
  theme: 'light' | 'dark' | 'system'

  // Layout
  sidebarWidth: number
  workspaceWidth: number

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (isOpen: boolean) => void
  toggleWorkspace: () => void
  setWorkspaceOpen: (isOpen: boolean) => void
  openModal: (modalId: string, data?: any) => void
  closeModal: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarWidth: (width: number) => void
  setWorkspaceWidth: (width: number) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        isSidebarOpen: false,
        isWorkspaceOpen: false,
        activeModal: null,
        modalData: {},
        theme: 'system',
        sidebarWidth: 280,
        workspaceWidth: 360,

        // Actions
        toggleSidebar: () =>
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'ui/toggleSidebar'),

        setSidebarOpen: (isOpen) =>
          set({ isSidebarOpen: isOpen }, false, 'ui/setSidebarOpen'),

        toggleWorkspace: () =>
          set((state) => ({ isWorkspaceOpen: !state.isWorkspaceOpen }), false, 'ui/toggleWorkspace'),

        setWorkspaceOpen: (isOpen) =>
          set({ isWorkspaceOpen: isOpen }, false, 'ui/setWorkspaceOpen'),

        openModal: (modalId, data = {}) =>
          set({ activeModal: modalId, modalData: data }, false, 'ui/openModal'),

        closeModal: () =>
          set({ activeModal: null, modalData: {} }, false, 'ui/closeModal'),

        setTheme: (theme) =>
          set({ theme }, false, 'ui/setTheme'),

        setSidebarWidth: (width) =>
          set({ sidebarWidth: Math.max(200, Math.min(width, 400)) }, false, 'ui/setSidebarWidth'),

        setWorkspaceWidth: (width) =>
          set({ workspaceWidth: Math.max(280, Math.min(width, 600)) }, false, 'ui/setWorkspaceWidth'),
      }),
      {
        name: 'ui-storage',
      }
    ),
    { name: 'UIStore' }
  )
)
