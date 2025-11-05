import { describe, it, expect, beforeEach } from 'vitest'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'
import { ContextManager } from '../context-manager'

describe('Context Manager', () => {
  let manager: ContextManager

  beforeEach(() => {
    manager = new ContextManager({
      maxTokens: 1000,
      minMessages: 3,
      preserveSystemMessages: true,
      preserveRecentMessages: 5,
    })
  })

  describe('countTokens', () => {
    it('should estimate token count', () => {
      const messages = [
        new HumanMessage('Hello, how are you?'),
        new AIMessage('I am doing well, thank you!'),
      ]

      const count = manager.countTokens(messages)

      expect(count).toBeGreaterThan(0)
      expect(count).toBeLessThan(100)
    })
  })

  describe('selectImportantMessages', () => {
    it('should select most important messages', () => {
      const messages = [
        new HumanMessage('Regular message'),
        new HumanMessage('This contains @mention'),
        new HumanMessage('This has code ```javascript```'),
        new HumanMessage('Another regular message'),
        new HumanMessage('Important decision: we should proceed'),
      ]

      const selected = manager.selectImportantMessages(messages, 3)

      expect(selected.length).toBe(3)
      // Important messages should be selected
      expect(selected.some((m) => m.content.includes('@mention'))).toBe(true)
    })
  })

  describe('trimHistory', () => {
    it('should preserve system messages', () => {
      const messages = [
        new SystemMessage('System instruction'),
        new HumanMessage('User message 1'),
        new AIMessage('AI response 1'),
        new HumanMessage('User message 2'),
        new AIMessage('AI response 2'),
      ]

      const result = manager.trimHistory(messages)

      const hasSystemMessage = result.messages.some((m) => m instanceof SystemMessage)
      expect(hasSystemMessage).toBe(true)
    })

    it('should preserve recent messages', () => {
      const messages = Array.from({ length: 20 }, (_, i) =>
        i % 2 === 0
          ? new HumanMessage(`User message ${i}`)
          : new AIMessage(`AI response ${i}`)
      )

      const result = manager.trimHistory(messages)

      // Last 5 messages should be included
      const lastMessage = messages[messages.length - 1]
      expect(result.messages).toContain(lastMessage)
    })

    it('should fit within token limit', () => {
      const messages = Array.from({ length: 100 }, (_, i) =>
        new HumanMessage(`This is a message with some content ${i}`)
      )

      const result = manager.trimHistory(messages)

      expect(result.tokenCount).toBeLessThanOrEqual(1000)
    })

    it('should return all messages if under token limit', () => {
      const messages = [
        new HumanMessage('Short'),
        new AIMessage('message'),
      ]

      const result = manager.trimHistory(messages)

      expect(result.messages.length).toBe(messages.length)
    })
  })

  describe('markAsImportant', () => {
    it('should mark message as important', () => {
      const message = new HumanMessage('Important message')
      const marked = manager.markAsImportant(message)

      expect(manager.isMarkedImportant(marked)).toBe(true)
    })

    it('should detect manually marked messages', () => {
      const message = new HumanMessage('Regular message')

      expect(manager.isMarkedImportant(message)).toBe(false)

      const marked = manager.markAsImportant(message)

      expect(manager.isMarkedImportant(marked)).toBe(true)
    })
  })

  describe('optimizeContext', () => {
    it('should return original messages if under limit', () => {
      const messages = [
        new HumanMessage('Short message'),
      ]

      const result = manager.optimizeContext(messages)

      expect(result.messages.length).toBe(messages.length)
      expect(result.summary).toBeUndefined()
    })

    it('should trim messages if over limit', () => {
      const messages = Array.from({ length: 100 }, (_, i) =>
        new HumanMessage(`Long message with lots of content to exceed token limit ${i}. This is a very detailed message that contains a lot of information.`)
      )

      const result = manager.optimizeContext(messages)

      expect(result.messages.length).toBeLessThan(messages.length)
      expect(result.tokenCount).toBeLessThanOrEqual(1000)
    })

    it('should provide summary when messages are omitted', () => {
      const messages = Array.from({ length: 50 }, (_, i) =>
        new HumanMessage(`Message ${i} with some content`)
      )

      const result = manager.optimizeContext(messages)

      if (result.messages.length < messages.length) {
        expect(result.summary).toBeDefined()
        expect(result.summary).toContain('Context Summary')
      }
    })
  })

  describe('createSummary', () => {
    it('should extract topics from omitted messages', () => {
      const original = [
        new HumanMessage('Let\'s discuss authentication and security'),
        new AIMessage('I can help with OAuth implementation'),
        new HumanMessage('What about database optimization?'),
      ]
      const selected = [original[0]]

      const summary = manager.createSummary(original, selected)

      expect(summary).toBeTruthy()
      expect(summary).toContain('omitted')
    })

    it('should return empty summary if no messages omitted', () => {
      const messages = [
        new HumanMessage('Message 1'),
        new AIMessage('Response 1'),
      ]

      const summary = manager.createSummary(messages, messages)

      expect(summary).toBe('')
    })
  })
})
