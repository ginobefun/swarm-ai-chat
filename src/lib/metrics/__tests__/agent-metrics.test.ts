import { describe, it, expect, beforeEach } from 'vitest'
import { AgentMetricsTracker, createMetric, type AgentMetric } from '../agent-metrics'

describe('Agent Metrics Tracker', () => {
  let tracker: AgentMetricsTracker

  beforeEach(() => {
    tracker = new AgentMetricsTracker()
  })

  describe('record', () => {
    it('should record a metric', () => {
      const metric: AgentMetric = {
        id: 'metric-1',
        agentId: 'agent-1',
        agentName: 'Developer',
        sessionId: 'session-1',
        messageId: 'msg-1',
        responseTimeMs: 1500,
        tokenCount: 150,
        cost: 0.003,
        success: true,
        timestamp: new Date(),
      }

      tracker.record(metric)

      const metrics = tracker.getMetrics('agent-1')
      expect(metrics).toHaveLength(1)
      expect(metrics[0]).toEqual(metric)
    })

    it('should accumulate metrics for the same agent', () => {
      const baseMetric = {
        agentId: 'agent-1',
        agentName: 'Developer',
        sessionId: 'session-1',
        messageId: 'msg-1',
        tokenCount: 100,
        cost: 0.002,
        success: true,
        timestamp: new Date(),
      }

      tracker.record({ ...baseMetric, id: 'metric-1', responseTimeMs: 1000 })
      tracker.record({ ...baseMetric, id: 'metric-2', responseTimeMs: 2000 })

      const metrics = tracker.getMetrics('agent-1')
      expect(metrics).toHaveLength(2)
    })
  })

  describe('getStats', () => {
    it('should calculate statistics for an agent', () => {
      const baseMetric = {
        agentId: 'agent-1',
        agentName: 'Developer',
        sessionId: 'session-1',
        messageId: 'msg-1',
        tokenCount: 100,
        cost: 0.002,
        timestamp: new Date(),
      }

      tracker.record({ ...baseMetric, id: 'metric-1', responseTimeMs: 1000, success: true })
      tracker.record({ ...baseMetric, id: 'metric-2', responseTimeMs: 2000, success: true })
      tracker.record({ ...baseMetric, id: 'metric-3', responseTimeMs: 1500, success: false })

      const stats = tracker.getStats('agent-1')

      expect(stats).toBeDefined()
      expect(stats!.totalRequests).toBe(3)
      expect(stats!.successfulRequests).toBe(2)
      expect(stats!.failedRequests).toBe(1)
      expect(stats!.successRate).toBeCloseTo(66.67, 1)
      expect(stats!.avgResponseTime).toBe(1500)
    })

    it('should return null for non-existent agent', () => {
      const stats = tracker.getStats('non-existent')

      expect(stats).toBeNull()
    })

    it('should calculate percentiles correctly', () => {
      const baseMetric = {
        agentId: 'agent-1',
        agentName: 'Developer',
        sessionId: 'session-1',
        messageId: 'msg-1',
        tokenCount: 100,
        cost: 0.002,
        success: true,
        timestamp: new Date(),
      }

      // Record metrics with different response times
      const times = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
      times.forEach((time, i) => {
        tracker.record({
          ...baseMetric,
          id: `metric-${i}`,
          responseTimeMs: time,
        })
      })

      const stats = tracker.getStats('agent-1')

      expect(stats!.minResponseTime).toBe(100)
      expect(stats!.maxResponseTime).toBe(1000)
      expect(stats!.p50ResponseTime).toBeGreaterThanOrEqual(400)
      expect(stats!.p95ResponseTime).toBeGreaterThanOrEqual(900)
    })
  })

  describe('compareAgents', () => {
    it('should compare multiple agents', () => {
      const baseMetric = {
        sessionId: 'session-1',
        messageId: 'msg-1',
        tokenCount: 100,
        cost: 0.002,
        success: true,
        timestamp: new Date(),
      }

      tracker.record({
        ...baseMetric,
        id: 'metric-1',
        agentId: 'agent-1',
        agentName: 'Developer',
        responseTimeMs: 1000,
      })
      tracker.record({
        ...baseMetric,
        id: 'metric-2',
        agentId: 'agent-2',
        agentName: 'Designer',
        responseTimeMs: 1500,
      })

      const comparison = tracker.compareAgents(['agent-1', 'agent-2'])

      expect(comparison).toHaveLength(2)
      expect(comparison[0].agentId).toBe('agent-1')
      expect(comparison[1].agentId).toBe('agent-2')
    })
  })

  describe('getTopPerformers', () => {
    it('should return top performing agents', () => {
      const baseMetric = {
        sessionId: 'session-1',
        messageId: 'msg-1',
        tokenCount: 100,
        cost: 0.002,
        timestamp: new Date(),
      }

      // Agent 1: Fast and successful
      tracker.record({
        ...baseMetric,
        id: 'metric-1',
        agentId: 'agent-1',
        agentName: 'Fast Agent',
        responseTimeMs: 500,
        success: true,
      })

      // Agent 2: Slow but successful
      tracker.record({
        ...baseMetric,
        id: 'metric-2',
        agentId: 'agent-2',
        agentName: 'Slow Agent',
        responseTimeMs: 5000,
        success: true,
      })

      // Agent 3: Fast but failed
      tracker.record({
        ...baseMetric,
        id: 'metric-3',
        agentId: 'agent-3',
        agentName: 'Failed Agent',
        responseTimeMs: 500,
        success: false,
      })

      const topPerformers = tracker.getTopPerformers(2)

      expect(topPerformers).toHaveLength(2)
      // Fast and successful agent should rank higher
      expect(topPerformers[0].agentId).toBe('agent-1')
    })
  })

  describe('createMetric', () => {
    it('should create a metric from parameters', () => {
      const startTime = Date.now() - 1500

      const metric = createMetric({
        agentId: 'agent-1',
        agentName: 'Developer',
        sessionId: 'session-1',
        messageId: 'msg-1',
        startTime,
        tokenCount: 150,
        cost: 0.003,
        success: true,
      })

      expect(metric.id).toContain('agent-1')
      expect(metric.responseTimeMs).toBeGreaterThan(1000)
      expect(metric.tokenCount).toBe(150)
      expect(metric.success).toBe(true)
    })
  })

  describe('export', () => {
    it('should export metrics as JSON', () => {
      const metric: AgentMetric = {
        id: 'metric-1',
        agentId: 'agent-1',
        agentName: 'Developer',
        sessionId: 'session-1',
        messageId: 'msg-1',
        responseTimeMs: 1500,
        tokenCount: 150,
        cost: 0.003,
        success: true,
        timestamp: new Date(),
      }

      tracker.record(metric)

      const exported = tracker.export()

      expect(exported).toContain('agent-1')
      expect(exported).toContain('metric-1')

      const parsed = JSON.parse(exported)
      expect(parsed['agent-1']).toHaveLength(1)
    })
  })

  describe('clear', () => {
    it('should clear all metrics', () => {
      const metric: AgentMetric = {
        id: 'metric-1',
        agentId: 'agent-1',
        agentName: 'Developer',
        sessionId: 'session-1',
        messageId: 'msg-1',
        responseTimeMs: 1500,
        tokenCount: 150,
        cost: 0.003,
        success: true,
        timestamp: new Date(),
      }

      tracker.record(metric)
      expect(tracker.getMetrics('agent-1')).toHaveLength(1)

      tracker.clear()
      expect(tracker.getMetrics('agent-1')).toHaveLength(0)
    })

    it('should clear metrics for specific agent', () => {
      tracker.record({
        id: 'metric-1',
        agentId: 'agent-1',
        agentName: 'Agent 1',
        sessionId: 'session-1',
        messageId: 'msg-1',
        responseTimeMs: 1000,
        tokenCount: 100,
        cost: 0.002,
        success: true,
        timestamp: new Date(),
      })
      tracker.record({
        id: 'metric-2',
        agentId: 'agent-2',
        agentName: 'Agent 2',
        sessionId: 'session-1',
        messageId: 'msg-2',
        responseTimeMs: 1000,
        tokenCount: 100,
        cost: 0.002,
        success: true,
        timestamp: new Date(),
      })

      tracker.clearAgent('agent-1')

      expect(tracker.getMetrics('agent-1')).toHaveLength(0)
      expect(tracker.getMetrics('agent-2')).toHaveLength(1)
    })
  })
})
