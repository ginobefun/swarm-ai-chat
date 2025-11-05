/**
 * Tests for Supervisor decision logic
 */

import { describe, it, expect } from 'vitest'
import { SupervisorAgent, OrchestrationDecision } from '../orchestrator'
import { BaseMessage, HumanMessage } from '@langchain/core/messages'

// Test helper to create agent configs
const createMockAgent = (id: string, role: string, name: string) => ({
  id,
  name,
  role,
  description: `${name} agent for ${role}`,
  systemPrompt: 'Test prompt',
  capabilities: [],
})

// Test helper to create conversation state
const createMockState = (messages: BaseMessage[] = []) => ({
  sessionId: 'test-session',
  messages,
  participants: [],
  metadata: {},
})

describe('SupervisorAgent - Rule-based selection', () => {
  const apiKey = 'test-key'
  const baseURL = 'http://test'

  const availableAgents = [
    createMockAgent('dev-1', '开发工程师', 'Developer'),
    createMockAgent('pm-1', '产品经理', 'Product Manager'),
    createMockAgent('architect-1', '架构师', 'Architect'),
    createMockAgent('designer-1', '设计师', 'Designer'),
    createMockAgent('analyst-1', '数据分析师', 'Data Analyst'),
  ]

  it('should select developer for code-related queries (Chinese)', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '帮我实现一个用户登录功能的代码'
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    expect(decision.nextAgentId).toBe('dev-1')
    expect(decision.reasoning).toContain('Rule-based match')
  })

  it('should select developer for code-related queries (English)', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = 'implement a login function in typescript'
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    expect(decision.nextAgentId).toBe('dev-1')
    expect(decision.reasoning).toContain('Rule-based match')
  })

  it('should select PM for product-related queries', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '我需要一个产品需求文档PRD'
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    expect(decision.nextAgentId).toBe('pm-1')
    expect(decision.reasoning).toContain('Rule-based match')
  })

  it('should select architect for architecture queries', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '请设计一个微服务架构方案'
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    expect(decision.nextAgentId).toBe('architect-1')
    expect(decision.reasoning).toContain('Rule-based match')
  })

  it('should select designer for UI/UX queries', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '帮我设计一个登录界面的UI原型'
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    expect(decision.nextAgentId).toBe('designer-1')
    expect(decision.reasoning).toContain('Rule-based match')
  })

  it('should select analyst for data-related queries', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '分析一下用户数据的统计报表'
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    expect(decision.nextAgentId).toBe('analyst-1')
    expect(decision.reasoning).toContain('Rule-based match')
  })

  it('should prioritize explicit mentions over rules', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '帮我实现代码' // Would match developer by rule
    const state = createMockState()
    const mentionedAgents = ['pm-1'] // But PM is explicitly mentioned

    const decision = await supervisor.decideNextAgent(
      userInput,
      state,
      availableAgents,
      mentionedAgents
    )

    expect(decision.nextAgentId).toBe('pm-1')
    expect(decision.reasoning).toContain('explicitly mentioned')
  })

  it('should handle multiple keyword matches (first match wins)', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    // This has both "实现" (develop) and "需求" (product)
    // Should match developer first since it's checked first
    const userInput = '实现产品需求'
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    // First rule match (developer) should win
    expect(decision.nextAgentId).toBe('dev-1')
  })

  it.skip('should handle queries with no rule matches', async () => {
    // Skipped: This test requires actual LLM API call which takes too long
    // In production, supervisor will fall back to LLM-based decision
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '你好，今天天气怎么样？' // No keyword matches
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    // Should fallback to LLM-based selection or default
    expect(decision.nextAgentId).toBeTruthy()
    expect(availableAgents.some(a => a.id === decision.nextAgentId)).toBe(true)
  })

  it.skip('should handle empty available agents list', async () => {
    // Skipped: This test requires actual LLM API call which takes too long
    // In production, supervisor will return a fallback decision
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '帮我写代码'
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, [])

    // Should return fallback decision
    expect(decision).toBeTruthy()
  })

  it('should be case insensitive', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = 'IMPLEMENT CODE FOR LOGIN' // All caps
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    expect(decision.nextAgentId).toBe('dev-1')
  })

  it('should match partial keywords', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '开发一个测试功能' // Contains "开发" which is a keyword
    const state = createMockState()

    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)

    expect(decision.nextAgentId).toBe('dev-1')
  })
})

describe('SupervisorAgent - Decision performance', () => {
  const apiKey = 'test-key'
  const baseURL = 'http://test'

  const availableAgents = [
    createMockAgent('dev-1', '开发工程师', 'Developer'),
  ]

  it('should make rule-based decisions quickly', async () => {
    const supervisor = new SupervisorAgent(apiKey, baseURL)
    const userInput = '帮我修复bug'
    const state = createMockState()

    const startTime = Date.now()
    const decision = await supervisor.decideNextAgent(userInput, state, availableAgents)
    const endTime = Date.now()

    // Rule-based decision should be very fast (< 10ms)
    expect(endTime - startTime).toBeLessThan(10)
    expect(decision.nextAgentId).toBe('dev-1')
  })
})
