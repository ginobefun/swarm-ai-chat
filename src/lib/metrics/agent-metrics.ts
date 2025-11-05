/**
 * Agent Performance Metrics System
 *
 * Tracks and analyzes agent performance metrics including:
 * - Response times
 * - Success rates
 * - Token usage
 * - Cost tracking
 * - User satisfaction
 */

export interface AgentMetric {
  id: string
  agentId: string
  agentName: string
  sessionId: string
  messageId: string

  // Performance metrics
  responseTimeMs: number
  tokenCount: number
  cost: number

  // Quality metrics
  success: boolean
  errorType?: string
  userRating?: number // 1-5 scale

  // Metadata
  timestamp: Date
  orchestrationMode?: string
  model?: string
}

export interface AgentStats {
  agentId: string
  agentName: string

  // Aggregated metrics
  totalRequests: number
  successfulRequests: number
  failedRequests: number

  // Performance
  avgResponseTime: number
  minResponseTime: number
  maxResponseTime: number
  p50ResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number

  // Token usage
  totalTokens: number
  avgTokens: number

  // Cost
  totalCost: number
  avgCost: number

  // Quality
  successRate: number
  avgUserRating?: number

  // Time period
  periodStart: Date
  periodEnd: Date
}

/**
 * Agent Metrics Tracker
 */
export class AgentMetricsTracker {
  private metrics: Map<string, AgentMetric[]> = new Map()

  /**
   * Record a new metric
   */
  record(metric: AgentMetric): void {
    const agentMetrics = this.metrics.get(metric.agentId) || []
    agentMetrics.push(metric)
    this.metrics.set(metric.agentId, agentMetrics)
  }

  /**
   * Get all metrics for an agent
   */
  getMetrics(agentId: string, limit?: number): AgentMetric[] {
    const metrics = this.metrics.get(agentId) || []
    return limit ? metrics.slice(-limit) : metrics
  }

  /**
   * Calculate statistics for an agent
   */
  getStats(agentId: string, periodDays: number = 7): AgentStats | null {
    const metrics = this.getMetrics(agentId)

    if (metrics.length === 0) {
      return null
    }

    // Filter metrics within period
    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - periodDays)
    const periodMetrics = metrics.filter((m) => m.timestamp >= periodStart)

    if (periodMetrics.length === 0) {
      return null
    }

    // Calculate aggregates
    const successfulRequests = periodMetrics.filter((m) => m.success).length
    const responseTimes = periodMetrics.map((m) => m.responseTimeMs).sort((a, b) => a - b)
    const tokens = periodMetrics.map((m) => m.tokenCount)
    const costs = periodMetrics.map((m) => m.cost)
    const ratings = periodMetrics
      .filter((m) => m.userRating !== undefined)
      .map((m) => m.userRating!)

    return {
      agentId,
      agentName: periodMetrics[0].agentName,
      totalRequests: periodMetrics.length,
      successfulRequests,
      failedRequests: periodMetrics.length - successfulRequests,
      avgResponseTime: this.average(responseTimes),
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      p50ResponseTime: this.percentile(responseTimes, 50),
      p95ResponseTime: this.percentile(responseTimes, 95),
      p99ResponseTime: this.percentile(responseTimes, 99),
      totalTokens: this.sum(tokens),
      avgTokens: this.average(tokens),
      totalCost: this.sum(costs),
      avgCost: this.average(costs),
      successRate: (successfulRequests / periodMetrics.length) * 100,
      avgUserRating: ratings.length > 0 ? this.average(ratings) : undefined,
      periodStart,
      periodEnd: new Date(),
    }
  }

  /**
   * Compare multiple agents
   */
  compareAgents(agentIds: string[], periodDays: number = 7): AgentStats[] {
    return agentIds
      .map((id) => this.getStats(id, periodDays))
      .filter((stats): stats is AgentStats => stats !== null)
  }

  /**
   * Get top performing agents
   */
  getTopPerformers(limit: number = 5, periodDays: number = 7): AgentStats[] {
    const allAgentIds = Array.from(this.metrics.keys())
    const allStats = this.compareAgents(allAgentIds, periodDays)

    // Sort by composite score
    return allStats
      .sort((a, b) => this.calculateScore(b) - this.calculateScore(a))
      .slice(0, limit)
  }

  /**
   * Calculate composite performance score
   */
  private calculateScore(stats: AgentStats): number {
    // Weighted score calculation
    const successWeight = 0.4
    const speedWeight = 0.3
    const satisfactionWeight = 0.3

    // Normalize success rate (0-100 -> 0-1)
    const successScore = stats.successRate / 100

    // Normalize speed (faster is better, cap at 10 seconds)
    const speedScore = Math.max(0, 1 - stats.avgResponseTime / 10000)

    // Normalize satisfaction (1-5 -> 0-1)
    const satisfactionScore = stats.avgUserRating
      ? (stats.avgUserRating - 1) / 4
      : 0.5 // Default to middle if no ratings

    return (
      successScore * successWeight +
      speedScore * speedWeight +
      satisfactionScore * satisfactionWeight
    )
  }

  /**
   * Get trending agents (improving performance)
   */
  getTrendingAgents(limit: number = 5): Array<{
    agentId: string
    agentName: string
    trend: 'up' | 'down' | 'stable'
    improvement: number
  }> {
    const allAgentIds = Array.from(this.metrics.keys())
    const trends = allAgentIds.map((agentId) => {
      const recentStats = this.getStats(agentId, 7)
      const oldStats = this.getStats(agentId, 14)

      if (!recentStats || !oldStats) {
        return null
      }

      const recentScore = this.calculateScore(recentStats)
      const oldScore = this.calculateScore(oldStats)
      const improvement = recentScore - oldScore

      return {
        agentId,
        agentName: recentStats.agentName,
        trend: improvement > 0.05 ? 'up' as const : improvement < -0.05 ? 'down' as const : 'stable' as const,
        improvement,
      }
    })

    return trends
      .filter((t): t is NonNullable<typeof t> => t !== null)
      .sort((a, b) => b.improvement - a.improvement)
      .slice(0, limit)
  }

  /**
   * Export metrics as JSON
   */
  export(agentId?: string): string {
    const data = agentId
      ? { [agentId]: this.metrics.get(agentId) || [] }
      : Object.fromEntries(this.metrics)

    return JSON.stringify(data, null, 2)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear()
  }

  /**
   * Clear metrics for a specific agent
   */
  clearAgent(agentId: string): void {
    this.metrics.delete(agentId)
  }

  // Helper methods
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((a, b) => a + b, 0) / numbers.length
  }

  private sum(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0)
  }

  private percentile(sortedNumbers: number[], p: number): number {
    if (sortedNumbers.length === 0) return 0
    const index = Math.ceil((p / 100) * sortedNumbers.length) - 1
    return sortedNumbers[Math.max(0, index)]
  }
}

/**
 * Global metrics tracker instance
 */
export const globalMetricsTracker = new AgentMetricsTracker()

/**
 * Helper to create a metric from agent response
 */
export function createMetric(params: {
  agentId: string
  agentName: string
  sessionId: string
  messageId: string
  startTime: number
  tokenCount: number
  cost: number
  success: boolean
  errorType?: string
  model?: string
}): AgentMetric {
  return {
    id: `${params.agentId}-${Date.now()}`,
    agentId: params.agentId,
    agentName: params.agentName,
    sessionId: params.sessionId,
    messageId: params.messageId,
    responseTimeMs: Date.now() - params.startTime,
    tokenCount: params.tokenCount,
    cost: params.cost,
    success: params.success,
    errorType: params.errorType,
    timestamp: new Date(),
    model: params.model,
  }
}
