/**
 * Context Manager - Intelligent context selection and optimization
 *
 * Features:
 * - Smart message selection based on importance
 * - Token counting and management
 * - Context summarization
 * - Key message identification
 */

import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'

export interface MessageImportance {
  message: BaseMessage
  score: number
  reasons: string[]
}

export interface ContextWindow {
  messages: BaseMessage[]
  tokenCount: number
  summary?: string
}

export interface ContextManagerOptions {
  maxTokens: number
  minMessages?: number
  preserveSystemMessages?: boolean
  preserveRecentMessages?: number
}

/**
 * Context Manager Class
 */
export class ContextManager {
  private maxTokens: number
  private minMessages: number
  private preserveSystemMessages: boolean
  private preserveRecentMessages: number

  constructor(options: ContextManagerOptions) {
    this.maxTokens = options.maxTokens
    this.minMessages = options.minMessages || 5
    this.preserveSystemMessages = options.preserveSystemMessages !== false
    this.preserveRecentMessages = options.preserveRecentMessages || 10
  }

  /**
   * Estimate token count for a message (rough estimation)
   * Real implementation should use tiktoken or similar
   */
  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  /**
   * Count tokens in messages
   */
  countTokens(messages: BaseMessage[]): number {
    return messages.reduce((total, msg) => {
      return total + this.estimateTokens(msg.content as string)
    }, 0)
  }

  /**
   * Calculate importance score for a message
   */
  private calculateImportance(
    message: BaseMessage,
    index: number,
    allMessages: BaseMessage[]
  ): MessageImportance {
    let score = 0
    const reasons: string[] = []

    // System messages are always important
    if (message instanceof SystemMessage) {
      score += 100
      reasons.push('System message')
    }

    // Recent messages are more important
    const recency = (index / allMessages.length) * 30
    score += recency
    if (recency > 20) reasons.push('Recent message')

    // Check for artifact indicators
    if ((message.content as string).includes('<artifact')) {
      score += 40
      reasons.push('Contains artifact')
    }

    // Check for @mentions
    if ((message.content as string).includes('@')) {
      score += 25
      reasons.push('Contains mentions')
    }

    // Check for questions
    if ((message.content as string).includes('?')) {
      score += 15
      reasons.push('Question')
    }

    // Check for code blocks
    if ((message.content as string).includes('```')) {
      score += 20
      reasons.push('Contains code')
    }

    // Check for decision points (keywords)
    const decisionKeywords = [
      'decide',
      'choose',
      'select',
      'prefer',
      'important',
      'critical',
      'must',
      'should',
    ]
    const hasDecisionKeyword = decisionKeywords.some((keyword) =>
      (message.content as string).toLowerCase().includes(keyword)
    )
    if (hasDecisionKeyword) {
      score += 20
      reasons.push('Decision point')
    }

    // Length bonus (longer messages often more important)
    const length = (message.content as string).length
    if (length > 500) {
      score += 10
      reasons.push('Detailed message')
    }

    return { message, score, reasons }
  }

  /**
   * Select important messages from history
   */
  selectImportantMessages(
    messages: BaseMessage[],
    targetCount: number
  ): BaseMessage[] {
    // Calculate importance for all messages
    const scored = messages.map((msg, index) =>
      this.calculateImportance(msg, index, messages)
    )

    // Sort by score (descending)
    scored.sort((a, b) => b.score - a.score)

    // Take top N messages
    const selected = scored.slice(0, targetCount).map((s) => s.message)

    // Sort by original order
    return selected.sort(
      (a, b) => messages.indexOf(a) - messages.indexOf(b)
    )
  }

  /**
   * Trim message history to fit within token limit
   */
  trimHistory(messages: BaseMessage[]): ContextWindow {
    if (messages.length === 0) {
      return { messages: [], tokenCount: 0 }
    }

    // Step 1: Always preserve system messages
    const systemMessages = this.preserveSystemMessages
      ? messages.filter((m) => m instanceof SystemMessage)
      : []

    // Step 2: Always preserve recent messages
    const recentMessages = messages.slice(-this.preserveRecentMessages)

    // Step 3: Extract key messages from middle
    const middleMessages = messages.slice(
      systemMessages.length,
      -this.preserveRecentMessages
    )

    // Calculate how many tokens we have available
    const systemTokens = this.countTokens(systemMessages)
    const recentTokens = this.countTokens(recentMessages)
    const availableTokens = this.maxTokens - systemTokens - recentTokens

    // Select important middle messages that fit in available tokens
    const keyMessages: BaseMessage[] = []
    let keyTokens = 0

    if (availableTokens > 0 && middleMessages.length > 0) {
      // Score all middle messages
      const scored = middleMessages.map((msg, index) =>
        this.calculateImportance(msg, index, middleMessages)
      )

      // Sort by importance
      scored.sort((a, b) => b.score - a.score)

      // Add messages until we run out of tokens
      for (const { message } of scored) {
        const tokens = this.estimateTokens(message.content as string)
        if (keyTokens + tokens <= availableTokens) {
          keyMessages.push(message)
          keyTokens += tokens
        }
      }

      // Sort key messages back to original order
      keyMessages.sort(
        (a, b) => messages.indexOf(a) - messages.indexOf(b)
      )
    }

    // Combine all selected messages
    const combined = [...systemMessages, ...keyMessages, ...recentMessages]

    // Deduplicate (in case of overlap)
    const unique = Array.from(new Set(combined))

    // Sort by original order
    const sorted = unique.sort(
      (a, b) => messages.indexOf(a) - messages.indexOf(b)
    )

    const totalTokens = this.countTokens(sorted)

    return {
      messages: sorted,
      tokenCount: totalTokens,
    }
  }

  /**
   * Create a summary of omitted messages
   */
  createSummary(
    originalMessages: BaseMessage[],
    selectedMessages: BaseMessage[]
  ): string {
    const omitted = originalMessages.filter(
      (msg) => !selectedMessages.includes(msg)
    )

    if (omitted.length === 0) {
      return ''
    }

    const summary = [
      `[Context Summary: ${omitted.length} messages omitted]`,
      `Topics discussed: ${this.extractTopics(omitted).join(', ')}`,
      `Key points: ${this.extractKeyPoints(omitted).join('; ')}`,
    ]

    return summary.join('\n')
  }

  /**
   * Extract main topics from messages
   */
  private extractTopics(messages: BaseMessage[]): string[] {
    // Simple keyword extraction
    const keywords = new Set<string>()
    const commonWords = new Set([
      'the',
      'be',
      'to',
      'of',
      'and',
      'a',
      'in',
      'that',
      'have',
      'i',
      'it',
      'for',
      'not',
      'on',
      'with',
      'he',
      'as',
      'you',
      'do',
      'at',
    ])

    messages.forEach((msg) => {
      const words = (msg.content as string)
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 4 && !commonWords.has(w))

      words.slice(0, 3).forEach((w) => keywords.add(w))
    })

    return Array.from(keywords).slice(0, 5)
  }

  /**
   * Extract key points from messages
   */
  private extractKeyPoints(messages: BaseMessage[]): string[] {
    const points: string[] = []

    messages.forEach((msg) => {
      const content = msg.content as string

      // Extract sentences with decision indicators
      const sentences = content.split(/[.!?]+/)
      const keyIndicators = ['decided', 'chose', 'selected', 'implemented', 'created']

      sentences.forEach((sentence) => {
        if (
          keyIndicators.some((indicator) =>
            sentence.toLowerCase().includes(indicator)
          )
        ) {
          points.push(sentence.trim().slice(0, 100))
        }
      })
    })

    return points.slice(0, 3)
  }

  /**
   * Mark message as important (for manual marking)
   */
  markAsImportant(message: BaseMessage): BaseMessage {
    // Add metadata to indicate importance
    return {
      ...message,
      additional_kwargs: {
        ...message.additional_kwargs,
        important: true,
      },
    }
  }

  /**
   * Check if message is marked as important
   */
  isMarkedImportant(message: BaseMessage): boolean {
    return message.additional_kwargs?.important === true
  }

  /**
   * Optimize context window for a conversation
   */
  optimizeContext(messages: BaseMessage[]): ContextWindow {
    // First, try to fit all messages
    const totalTokens = this.countTokens(messages)

    if (totalTokens <= this.maxTokens) {
      return {
        messages,
        tokenCount: totalTokens,
      }
    }

    // Messages don't fit, need to trim
    const trimmed = this.trimHistory(messages)

    // Add summary if we omitted messages
    if (trimmed.messages.length < messages.length) {
      const summary = this.createSummary(messages, trimmed.messages)
      trimmed.summary = summary
    }

    return trimmed
  }
}

/**
 * Create a context manager instance with default settings
 */
export function createContextManager(maxTokens: number = 8000): ContextManager {
  return new ContextManager({
    maxTokens,
    minMessages: 5,
    preserveSystemMessages: true,
    preserveRecentMessages: 10,
  })
}

/**
 * Helper function to create a context summary message
 */
export function createSummaryMessage(summary: string): SystemMessage {
  return new SystemMessage(summary)
}
