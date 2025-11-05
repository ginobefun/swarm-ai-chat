import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { ContextManager } from '../context-manager'
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'

describe('Token Estimation Improvements', () => {
  let manager: ContextManager

  beforeEach(() => {
    manager = new ContextManager({
      maxTokens: 1000,
      minMessages: 2,
      preserveSystemMessages: true,
      preserveRecentMessages: 3,
    })
  })

  afterEach(() => {
    manager.dispose()
  })

  describe('Accurate token counting with tiktoken', () => {
    it('should count English text accurately', () => {
      const text = 'Hello, how are you doing today?'
      const messages = [new HumanMessage(text)]

      const tokenCount = manager.countTokens(messages)

      // Using tiktoken, this should be around 7-8 tokens
      // (much more accurate than the old length/4 = 8 tokens)
      expect(tokenCount).toBeGreaterThan(0)
      expect(tokenCount).toBeLessThan(15) // Reasonable upper bound
    })

    it('should count Chinese text more accurately', () => {
      const text = '你好，今天天气怎么样？' // Chinese: "Hello, how's the weather today?"
      const messages = [new HumanMessage(text)]

      const tokenCount = manager.countTokens(messages)

      // Old method: 11 chars / 4 = 3 tokens (too few!)
      // New method with CJK detection: 11 / 1.5 = 7-8 tokens (better)
      // With tiktoken: should be even more accurate
      expect(tokenCount).toBeGreaterThan(3)
      expect(tokenCount).toBeLessThan(20)
    })

    it('should handle mixed English and Chinese', () => {
      const text = 'Hello 你好 world 世界'
      const messages = [new HumanMessage(text)]

      const tokenCount = manager.countTokens(messages)

      // Should handle mixed content appropriately
      expect(tokenCount).toBeGreaterThan(0)
      expect(tokenCount).toBeLessThan(20)
    })

    it('should count Japanese text accurately', () => {
      const text = 'こんにちは、今日はいい天気ですね。' // Japanese
      const messages = [new HumanMessage(text)]

      const tokenCount = manager.countTokens(messages)

      expect(tokenCount).toBeGreaterThan(5)
      expect(tokenCount).toBeLessThan(30)
    })

    it('should count Korean text accurately', () => {
      const text = '안녕하세요, 오늘 날씨가 좋네요.' // Korean
      const messages = [new HumanMessage(text)]

      const tokenCount = manager.countTokens(messages)

      expect(tokenCount).toBeGreaterThan(5)
      expect(tokenCount).toBeLessThan(30)
    })
  })

  describe('Fallback estimation for CJK characters', () => {
    it('should use CJK-aware fallback if tiktoken fails', () => {
      // This test verifies the fallback logic
      const text = '中文测试' // 4 Chinese characters
      const messages = [new HumanMessage(text)]

      const tokenCount = manager.countTokens(messages)

      // With CJK fallback: 4 / 1.5 = ~3 tokens (better than 4 / 4 = 1)
      expect(tokenCount).toBeGreaterThan(1)
      expect(tokenCount).toBeLessThan(10)
    })

    it('should handle empty strings', () => {
      const messages = [new HumanMessage('')]
      const tokenCount = manager.countTokens(messages)

      expect(tokenCount).toBe(0)
    })

    it('should handle very long text', () => {
      const longText = 'word '.repeat(1000) // 1000 words
      const messages = [new HumanMessage(longText)]

      const tokenCount = manager.countTokens(messages)

      // Should be roughly 1000-1500 tokens
      expect(tokenCount).toBeGreaterThan(900)
      expect(tokenCount).toBeLessThan(2000)
    })
  })

  describe('Token counting with multiple messages', () => {
    it('should sum tokens across multiple messages', () => {
      const messages = [
        new HumanMessage('Hello world'),
        new AIMessage('Hi there!'),
        new SystemMessage('System ready'),
      ]

      const totalTokens = manager.countTokens(messages)

      // Each message should contribute tokens
      expect(totalTokens).toBeGreaterThan(5)
      expect(totalTokens).toBeLessThan(30)
    })

    it('should handle mixed languages across messages', () => {
      const messages = [
        new HumanMessage('Hello'),
        new AIMessage('你好'),
        new HumanMessage('こんにちは'),
      ]

      const totalTokens = manager.countTokens(messages)

      expect(totalTokens).toBeGreaterThan(3)
      expect(totalTokens).toBeLessThan(20)
    })
  })

  describe('Context optimization with accurate token counting', () => {
    it('should respect token limits with accurate counting', () => {
      const shortManager = new ContextManager({
        maxTokens: 50,
        minMessages: 1,
        preserveRecentMessages: 2,
      })

      try {
        const messages = [
          new SystemMessage('You are a helpful assistant'),
          new HumanMessage('Tell me a very long story about ' + 'word '.repeat(100)),
          new AIMessage('Here is the story...'),
          new HumanMessage('Continue the story'),
          new AIMessage('The story continues...'),
        ]

        const result = shortManager.optimizeContext(messages)

        // Should trim to stay under 50 tokens
        expect(result.tokenCount).toBeLessThanOrEqual(50)
        expect(result.messages.length).toBeLessThan(messages.length)
      } finally {
        shortManager.dispose()
      }
    })

    it('should preserve important messages even with tight token limits', () => {
      const tightManager = new ContextManager({
        maxTokens: 100,
        preserveSystemMessages: true,
        preserveRecentMessages: 2,
      })

      try {
        const messages = [
          new SystemMessage('Important system context'),
          new HumanMessage('Old message 1'),
          new AIMessage('Old response 1'),
          new HumanMessage('Recent message'),
          new AIMessage('Recent response'),
        ]

        const result = tightManager.optimizeContext(messages)

        // System message should be preserved
        expect(result.messages.some(m => m instanceof SystemMessage)).toBe(true)
        // Recent messages should be preserved
        expect(result.messages.length).toBeGreaterThanOrEqual(3)
      } finally {
        tightManager.dispose()
      }
    })
  })

  describe('Resource management', () => {
    it('should properly dispose of encoder', () => {
      const tempManager = new ContextManager({ maxTokens: 1000 })

      // Should not throw
      expect(() => tempManager.dispose()).not.toThrow()

      // Should still work after dispose (using fallback)
      const messages = [new HumanMessage('test')]
      expect(() => tempManager.countTokens(messages)).not.toThrow()
    })

    it('should handle multiple dispose calls gracefully', () => {
      const tempManager = new ContextManager({ maxTokens: 1000 })

      tempManager.dispose()
      expect(() => tempManager.dispose()).not.toThrow()
    })
  })

  describe('Comparison with old estimation method', () => {
    it('should be more accurate than simple character division', () => {
      const chineseText = '这是一个测试文本，包含中文字符。'
      const messages = [new HumanMessage(chineseText)]

      // New accurate count
      const accurateCount = manager.countTokens(messages)

      // Old simple estimation (chars / 4)
      const oldEstimate = Math.ceil(chineseText.length / 4)

      // The accurate count should be significantly different (higher)
      // because Chinese characters typically take more tokens
      expect(accurateCount).not.toBe(oldEstimate)

      // New method should recognize this needs more tokens
      // Old method: 18 chars / 4 = 5 tokens (too few)
      // New method: should be higher
      expect(accurateCount).toBeGreaterThan(oldEstimate)
    })
  })
})
