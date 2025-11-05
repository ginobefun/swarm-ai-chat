import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Session } from '@/types'

/**
 * Session Store - Manages chat sessions
 *
 * Features:
 * - Session management (add, update, delete)
 * - Current session selection
 * - Session filters
 * - Session search
 */

interface SessionState {
  // Sessions
  sessions: Session[]
  currentSessionId: string | null
  isLoading: boolean
  error: string | null

  // Filters
  filter: 'all' | 'DIRECT' | 'GROUP' | 'WORKFLOW'
  searchQuery: string

  // Actions
  setSessions: (sessions: Session[]) => void
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  removeSession: (id: string) => void
  setCurrentSession: (id: string | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setFilter: (filter: 'all' | 'DIRECT' | 'GROUP' | 'WORKFLOW') => void
  setSearchQuery: (query: string) => void

  // Selectors
  getCurrentSession: () => Session | undefined
  getFilteredSessions: () => Session[]
}

export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      error: null,
      filter: 'all',
      searchQuery: '',

      // Actions
      setSessions: (sessions) =>
        set({ sessions, error: null }, false, 'session/setSessions'),

      addSession: (session) =>
        set((state) => ({
          sessions: [session, ...state.sessions],
        }), false, 'session/addSession'),

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === id ? { ...session, ...updates } : session
          ),
        }), false, 'session/updateSession'),

      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
        }), false, 'session/removeSession'),

      setCurrentSession: (id) =>
        set({ currentSessionId: id }, false, 'session/setCurrentSession'),

      setLoading: (isLoading) =>
        set({ isLoading }, false, 'session/setLoading'),

      setError: (error) =>
        set({ error }, false, 'session/setError'),

      setFilter: (filter) =>
        set({ filter }, false, 'session/setFilter'),

      setSearchQuery: (query) =>
        set({ searchQuery: query }, false, 'session/setSearchQuery'),

      // Selectors
      getCurrentSession: () => {
        const state = get()
        return state.sessions.find((s) => s.id === state.currentSessionId)
      },

      getFilteredSessions: () => {
        const state = get()
        let filtered = state.sessions

        // Apply type filter
        if (state.filter !== 'all') {
          filtered = filtered.filter((s) => s.type === state.filter)
        }

        // Apply search
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter(
            (s) =>
              s.title?.toLowerCase().includes(query) ||
              s.description?.toLowerCase().includes(query)
          )
        }

        return filtered
      },
    }),
    { name: 'SessionStore' }
  )
)
