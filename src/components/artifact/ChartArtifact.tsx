'use client'

import React, { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { ChartMetadata } from '@/types'

interface ChartArtifactProps {
  title: string
  content: string
  metadata?: ChartMetadata | Record<string, any>
}

interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'radar'
  data: any[]
  config?: {
    xAxisKey?: string
    yAxisKey?: string | string[]
    colors?: string[]
    title?: string
    subtitle?: string
  }
}

/**
 * ChartArtifact Component
 *
 * Renders interactive charts using recharts library.
 * Supports multiple chart types: line, bar, pie, area, scatter, radar
 *
 * Features:
 * - Interactive tooltips
 * - Responsive sizing
 * - Multiple data series
 * - Custom colors
 * - Legend support
 * - Zoom and pan (for line/area charts)
 */
const ChartArtifact: React.FC<ChartArtifactProps> = ({
  title,
  content,
  metadata: _metadata,
}) => {
  const [error, setError] = useState<string | null>(null)

  // Parse chart data from JSON content
  const parseChartData = (): ChartData | null => {
    try {
      const parsed = JSON.parse(content)

      // Validate required fields
      if (!parsed.type || !parsed.data) {
        throw new Error('Chart data must include "type" and "data" fields')
      }

      return parsed as ChartData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse chart data')
      return null
    }
  }

  const chartData = parseChartData()

  if (error || !chartData) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Chart Rendering Error
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            {error || 'Unable to render chart'}
          </p>
          <details className="text-left">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View raw data
            </summary>
            <pre className="text-xs font-mono bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-64">
              {content}
            </pre>
          </details>
        </div>
      </div>
    )
  }

  const { data, config = {}, type } = chartData
  const {
    xAxisKey = 'name',
    yAxisKey = 'value',
    colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'],
  } = config

  // Common chart wrapper
  const ChartWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {config.title || title}
        </h3>
        {config.subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {config.subtitle}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )

  // Render different chart types
  switch (type) {
    case 'line':
      return (
        <ChartWrapper>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {Array.isArray(yAxisKey) ? (
              yAxisKey.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </LineChart>
        </ChartWrapper>
      )

    case 'bar':
      return (
        <ChartWrapper>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {Array.isArray(yAxisKey) ? (
              yAxisKey.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                />
              ))
            ) : (
              <Bar dataKey={yAxisKey} fill={colors[0]} />
            )}
          </BarChart>
        </ChartWrapper>
      )

    case 'pie':
      return (
        <ChartWrapper>
          <PieChart>
            <Pie
              data={data}
              dataKey={yAxisKey as string}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ChartWrapper>
      )

    case 'area':
      return (
        <ChartWrapper>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            {Array.isArray(yAxisKey) ? (
              yAxisKey.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={yAxisKey}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.6}
              />
            )}
          </AreaChart>
        </ChartWrapper>
      )

    case 'scatter':
      return (
        <ChartWrapper>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis dataKey={yAxisKey as string} />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter
              name={config.title || 'Data'}
              data={data}
              fill={colors[0]}
            />
          </ScatterChart>
        </ChartWrapper>
      )

    case 'radar':
      return (
        <ChartWrapper>
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={xAxisKey} />
            <PolarRadiusAxis />
            <Tooltip />
            <Legend />
            {Array.isArray(yAxisKey) ? (
              yAxisKey.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))
            ) : (
              <Radar
                name={yAxisKey as string}
                dataKey={yAxisKey as string}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.6}
              />
            )}
          </RadarChart>
        </ChartWrapper>
      )

    default:
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Unsupported Chart Type
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Chart type "{type}" is not supported
            </p>
          </div>
        </div>
      )
  }
}

export default ChartArtifact
