'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Activity, Clock, DollarSign, CheckCircle } from 'lucide-react'
import { AgentStats, AgentMetricsTracker } from '@/lib/metrics/agent-metrics'

interface AgentPerformanceDashboardProps {
  tracker: AgentMetricsTracker
  agentIds?: string[]
  periodDays?: number
  refreshInterval?: number
}

/**
 * AgentPerformanceDashboard Component
 *
 * Displays comprehensive performance metrics for AI agents:
 * - Response time statistics
 * - Success rates
 * - Token usage
 * - Cost analysis
 * - Performance trends
 * - Agent comparisons
 *
 * Features:
 * - Real-time updates
 * - Interactive charts
 * - Agent comparison
 * - Performance scoring
 */
const AgentPerformanceDashboard: React.FC<AgentPerformanceDashboardProps> = ({
  tracker,
  agentIds,
  periodDays = 7,
  refreshInterval = 30000, // 30 seconds
}) => {
  const [stats, setStats] = useState<AgentStats[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState(periodDays)
  const [loading, setLoading] = useState(true)

  // Load stats
  const loadStats = () => {
    setLoading(true)
    try {
      const allStats = agentIds
        ? tracker.compareAgents(agentIds, selectedPeriod)
        : tracker.getTopPerformers(10, selectedPeriod)

      setStats(allStats)
    } finally {
      setLoading(false)
    }
  }

  // Load stats on mount and periodically
  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, refreshInterval)
    return () => clearInterval(interval)
  }, [selectedPeriod])

  // Format number
  const formatNumber = (num: number, decimals: number = 0): string => {
    return num.toFixed(decimals)
  }

  // Format time
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Format cost
  const formatCost = (cost: number): string => {
    return `$${cost.toFixed(4)}`
  }

  // Get trend icon (disabled for now)
  // const getTrendIcon = (current: number, previous: number) => {
  //   const diff = current - previous
  //   if (diff > 5) return <TrendingUp className="w-4 h-4 text-green-500" />
  //   if (diff < -5) return <TrendingDown className="w-4 h-4 text-red-500" />
  //   return <Minus className="w-4 h-4 text-gray-400" />
  // }

  if (loading && stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 animate-pulse mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Loading metrics...</p>
        </div>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No Metrics Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Agent performance data will appear here
          </p>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const responseTimeData = stats.map((s) => ({
    name: s.agentName,
    avg: s.avgResponseTime,
    p95: s.p95ResponseTime,
    p99: s.p99ResponseTime,
  }))

  const successRateData = stats.map((s) => ({
    name: s.agentName,
    successRate: s.successRate,
    failureRate: 100 - s.successRate,
  }))

  const costData = stats.map((s) => ({
    name: s.agentName,
    totalCost: s.totalCost,
    avgCost: s.avgCost,
  }))

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Agent Performance Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitoring {stats.length} agents over the last {selectedPeriod} days
            </p>
          </div>

          {/* Period selector */}
          <div className="flex gap-2">
            {[1, 7, 30].map((days) => (
              <button
                key={days}
                onClick={() => setSelectedPeriod(days)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedPeriod === days
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {days}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {/* Total Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.reduce((sum, s) => sum + s.totalRequests, 0))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Requests</div>
        </motion.div>

        {/* Avg Response Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatTime(
              stats.reduce((sum, s) => sum + s.avgResponseTime, 0) / stats.length
            )}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
        </motion.div>

        {/* Success Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatNumber(
              stats.reduce((sum, s) => sum + s.successRate, 0) / stats.length,
              1
            )}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
        </motion.div>

        {/* Total Cost */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCost(stats.reduce((sum, s) => sum + s.totalCost, 0))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Cost</div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="p-6 space-y-6">
        {/* Response Time Chart */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Response Time Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" name="Average" fill="#8884d8" />
              <Bar dataKey="p95" name="P95" fill="#82ca9d" />
              <Bar dataKey="p99" name="P99" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate Chart */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Success vs Failure Rates
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="successRate" name="Success %" fill="#10b981" stackId="a" />
              <Bar dataKey="failureRate" name="Failure %" fill="#ef4444" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Chart */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cost Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalCost" name="Total Cost" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Details Table */}
      <div className="p-6">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {stats.map((stat) => (
                <tr key={stat.agentId} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {stat.agentName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatNumber(stat.totalRequests)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        stat.successRate >= 95
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : stat.successRate >= 80
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {formatNumber(stat.successRate, 1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatTime(stat.avgResponseTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {formatCost(stat.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {stat.avgUserRating ? `⭐ ${stat.avgUserRating.toFixed(1)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AgentPerformanceDashboard
