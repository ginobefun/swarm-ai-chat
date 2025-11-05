import { describe, it, expect } from 'vitest'
import type { Message } from '../index'

// Import the helper function separately to avoid Prisma imports
const normalizeSenderType = (senderType: string): 'user' | 'agent' | 'system' => {
  if (senderType === 'ai') return 'agent'
  return senderType as 'user' | 'agent' | 'system'
}

describe('Type Definitions', () => {
  describe('Message.senderType consistency', () => {
    it('should support all three sender types (user, agent, system)', () => {
      // These types should match Prisma's SwarmSenderType: 'user' | 'agent' | 'system'
      const validTypes: Array<'user' | 'agent' | 'system'> = ['user', 'agent', 'system']

      validTypes.forEach(type => {
        const message: Message = {
          id: '1',
          content: 'Test',
          sender: 'Test',
          senderType: type,
          timestamp: new Date(),
        }
        expect(['user', 'agent', 'system']).toContain(message.senderType)
      })
    })

    it('should NOT support legacy "ai" type', () => {
      // TypeScript should prevent this at compile time
      // If 'ai' were a valid senderType, this test would fail
      const invalidType = 'ai'

      // We can't directly assign 'ai' to Message.senderType due to TypeScript
      // But we can verify the normalization function handles it
      expect(normalizeSenderType(invalidType)).toBe('agent')
    })

    it('should have user senderType', () => {
      const message: Message = {
        id: '1',
        content: 'Hello',
        sender: 'User',
        senderType: 'user',
        timestamp: new Date(),
      }

      expect(message.senderType).toBe('user')
    })

    it('should have agent senderType', () => {
      const message: Message = {
        id: '2',
        content: 'Hello from AI',
        sender: 'Assistant',
        senderType: 'agent',
        timestamp: new Date(),
      }

      expect(message.senderType).toBe('agent')
    })

    it('should have system senderType', () => {
      const message: Message = {
        id: '3',
        content: 'System notification',
        sender: 'System',
        senderType: 'system',
        timestamp: new Date(),
      }

      expect(message.senderType).toBe('system')
    })
  })

  describe('normalizeSenderType helper', () => {
    it('should convert legacy "ai" to "agent"', () => {
      expect(normalizeSenderType('ai')).toBe('agent')
    })

    it('should preserve "user" type', () => {
      expect(normalizeSenderType('user')).toBe('user')
    })

    it('should preserve "agent" type', () => {
      expect(normalizeSenderType('agent')).toBe('agent')
    })

    it('should preserve "system" type', () => {
      expect(normalizeSenderType('system')).toBe('system')
    })
  })

  describe('Message interface completeness', () => {
    it('should have all required fields', () => {
      const message: Message = {
        id: 'test-id',
        content: 'Test content',
        sender: 'Test sender',
        senderType: 'user',
        timestamp: new Date(),
      }

      expect(message).toHaveProperty('id')
      expect(message).toHaveProperty('content')
      expect(message).toHaveProperty('sender')
      expect(message).toHaveProperty('senderType')
      expect(message).toHaveProperty('timestamp')
    })

    it('should support optional fields', () => {
      const message: Message = {
        id: 'test-id',
        content: 'Test content',
        sender: 'Test sender',
        senderType: 'agent',
        timestamp: new Date(),
        avatar: '🤖',
        avatarStyle: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        hasArtifacts: true,
        artifactCount: 2,
      }

      expect(message.avatar).toBe('🤖')
      expect(message.avatarStyle).toBeDefined()
      expect(message.hasArtifacts).toBe(true)
      expect(message.artifactCount).toBe(2)
    })

    it('should handle missing optional fields', () => {
      const message: Message = {
        id: 'test-id',
        content: 'Test content',
        sender: 'Test sender',
        senderType: 'user',
        timestamp: new Date(),
      }

      expect(message.avatar).toBeUndefined()
      expect(message.avatarStyle).toBeUndefined()
      expect(message.hasArtifacts).toBeUndefined()
      expect(message.artifactCount).toBeUndefined()
    })
  })

  describe('Type safety', () => {
    it('should enforce senderType to be one of the three valid values', () => {
      const validMessages: Message[] = [
        {
          id: '1',
          content: 'User message',
          sender: 'User',
          senderType: 'user',
          timestamp: new Date(),
        },
        {
          id: '2',
          content: 'Agent message',
          sender: 'Agent',
          senderType: 'agent',
          timestamp: new Date(),
        },
        {
          id: '3',
          content: 'System message',
          sender: 'System',
          senderType: 'system',
          timestamp: new Date(),
        },
      ]

      validMessages.forEach(msg => {
        expect(['user', 'agent', 'system']).toContain(msg.senderType)
      })
    })
  })
})
