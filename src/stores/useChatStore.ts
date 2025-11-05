import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Message, TypingAgent } from '@/types'

/**
 * Chat Store - Manages chat messages and typing state
 *
 * Features:
 * - Message management (add, update, clear)
 * - Typing indicators for multiple agents
 * - Orchestration mode tracking
 * - Persistent storage for chat preferences
 */

interface ChatState {
  // Messages
  messages: Message[]
  isTyping: boolean
  typingAgents: TypingAgent[]

  // Orchestration
  orchestrationMode: 'DYNAMIC' | 'SEQUENTIAL' | 'PARALLEL'

  // Actions
  addMessage: (message: Message) => void
  updateMessage: (id: string, updates: Partial<Message>) => void
  clearMessages: () => void
  setIsTyping: (isTyping: boolean) => void
  addTypingAgent: (agent: TypingAgent) => void
  removeTypingAgent: (agentId: string) => void
  clearTypingAgents: () => void
  setOrchestrationMode: (mode: 'DYNAMIC' | 'SEQUENTIAL' | 'PARALLEL') => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        messages: [],
        isTyping: false,
        typingAgents: [],
        orchestrationMode: 'DYNAMIC',

        // Actions
        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message],
          }), false, 'chat/addMessage'),

        updateMessage: (id, updates) =>
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === id ? { ...msg, ...updates } : msg
            ),
          }), false, 'chat/updateMessage'),

        clearMessages: () =>
          set({ messages: [] }, false, 'chat/clearMessages'),

        setIsTyping: (isTyping) =>
          set({ isTyping }, false, 'chat/setIsTyping'),

        addTypingAgent: (agent) =>
          set((state) => {
            // Avoid duplicates
            if (state.typingAgents.some((a) => a.id === agent.id)) {
              return state
            }
            return {
              typingAgents: [...state.typingAgents, agent],
              isTyping: true,
            }
          }, false, 'chat/addTypingAgent'),

        removeTypingAgent: (agentId) =>
          set((state) => {
            const typingAgents = state.typingAgents.filter((a) => a.id !== agentId)
            return {
              typingAgents,
              isTyping: typingAgents.length > 0,
            }
          }, false, 'chat/removeTypingAgent'),

        clearTypingAgents: () =>
          set({ typingAgents: [], isTyping: false }, false, 'chat/clearTypingAgents'),

        setOrchestrationMode: (mode) =>
          set({ orchestrationMode: mode }, false, 'chat/setOrchestrationMode'),
      }),
      {
        name: 'chat-storage',
        // Only persist preferences, not messages
        partialize: (state) => ({
          orchestrationMode: state.orchestrationMode,
        }),
      }
    ),
    { name: 'ChatStore' }
  )
)
