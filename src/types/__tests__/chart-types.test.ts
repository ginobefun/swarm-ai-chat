import { describe, it, expect, vi } from 'vitest'

// Mock Prisma client to avoid import errors
vi.mock('@prisma/client', () => ({
  SwarmSessionType: {},
  SwarmSessionStatus: {},
  SwarmParticipantRole: {},
  SwarmSenderType: {},
  SwarmContentType: {},
  SwarmMessageStatus: {},
  SwarmSkillCategory: {},
  SwarmRole: {},
  SubscriptionStatus: {},
}))

import type { ChartMetadata, ChartType, ChartDataPoint } from '../index'
import { isChartMetadata, createChartMetadata } from '../index'

describe('ChartMetadata Types', () => {
  describe('ChartType', () => {
    it('should support all valid chart types', () => {
      const validTypes: ChartType[] = ['line', 'bar', 'pie', 'area', 'scatter', 'radar']

      validTypes.forEach(type => {
        const metadata: ChartMetadata = {
          chartType: type,
          data: [],
          xAxisKey: 'x',
          yAxisKey: 'y',
        }

        expect(metadata.chartType).toBe(type)
      })
    })
  })

  describe('ChartDataPoint', () => {
    it('should accept string, number, or Date values', () => {
      const dataPoint: ChartDataPoint = {
        name: 'Point 1',
        value: 100,
        timestamp: new Date(),
      }

      expect(dataPoint.name).toBe('Point 1')
      expect(dataPoint.value).toBe(100)
      expect(dataPoint.timestamp).toBeInstanceOf(Date)
    })

    it('should support dynamic keys', () => {
      const dataPoint: ChartDataPoint = {
        customKey1: 'value1',
        customKey2: 123,
        customKey3: new Date(),
      }

      expect(dataPoint).toHaveProperty('customKey1')
      expect(dataPoint).toHaveProperty('customKey2')
      expect(dataPoint).toHaveProperty('customKey3')
    })
  })

  describe('ChartMetadata interface', () => {
    it('should have required fields', () => {
      const metadata: ChartMetadata = {
        chartType: 'line',
        data: [{ x: 1, y: 2 }],
        xAxisKey: 'x',
        yAxisKey: 'y',
      }

      expect(metadata).toHaveProperty('chartType')
      expect(metadata).toHaveProperty('data')
      expect(metadata).toHaveProperty('xAxisKey')
      expect(metadata).toHaveProperty('yAxisKey')
    })

    it('should support optional fields', () => {
      const metadata: ChartMetadata = {
        chartType: 'bar',
        data: [{ x: 1, y: 2 }],
        xAxisKey: 'x',
        yAxisKey: 'y',
        title: 'Test Chart',
        description: 'A test chart',
        xAxisLabel: 'X Axis',
        yAxisLabel: 'Y Axis',
        colors: ['#ff0000', '#00ff00'],
        showLegend: true,
        showGrid: false,
        showTooltip: true,
        width: 800,
        height: 400,
      }

      expect(metadata.title).toBe('Test Chart')
      expect(metadata.description).toBe('A test chart')
      expect(metadata.colors).toHaveLength(2)
      expect(metadata.width).toBe(800)
    })

    it('should support multiple yAxisKeys', () => {
      const metadata: ChartMetadata = {
        chartType: 'line',
        data: [{ x: 1, y1: 2, y2: 3 }],
        xAxisKey: 'x',
        yAxisKey: ['y1', 'y2'],
      }

      expect(Array.isArray(metadata.yAxisKey)).toBe(true)
      expect(metadata.yAxisKey).toHaveLength(2)
    })
  })

  describe('isChartMetadata type guard', () => {
    it('should return true for valid ChartMetadata', () => {
      const validMetadata = {
        chartType: 'line',
        data: [{ x: 1, y: 2 }],
        xAxisKey: 'x',
        yAxisKey: 'y',
      }

      expect(isChartMetadata(validMetadata)).toBe(true)
    })

    it('should return false for missing chartType', () => {
      const invalidMetadata = {
        data: [{ x: 1, y: 2 }],
        xAxisKey: 'x',
        yAxisKey: 'y',
      }

      expect(isChartMetadata(invalidMetadata)).toBe(false)
    })

    it('should return false for missing data', () => {
      const invalidMetadata = {
        chartType: 'line',
        xAxisKey: 'x',
        yAxisKey: 'y',
      }

      expect(isChartMetadata(invalidMetadata)).toBe(false)
    })

    it('should return false for non-array data', () => {
      const invalidMetadata = {
        chartType: 'line',
        data: 'not an array',
        xAxisKey: 'x',
        yAxisKey: 'y',
      }

      expect(isChartMetadata(invalidMetadata)).toBe(false)
    })

    it('should return false for missing xAxisKey', () => {
      const invalidMetadata = {
        chartType: 'line',
        data: [{ x: 1, y: 2 }],
        yAxisKey: 'y',
      }

      expect(isChartMetadata(invalidMetadata)).toBe(false)
    })

    it('should return false for missing yAxisKey', () => {
      const invalidMetadata = {
        chartType: 'line',
        data: [{ x: 1, y: 2 }],
        xAxisKey: 'x',
      }

      expect(isChartMetadata(invalidMetadata)).toBe(false)
    })

    it('should return false for null or undefined', () => {
      expect(isChartMetadata(null)).toBe(false)
      expect(isChartMetadata(undefined)).toBe(false)
    })

    it('should return false for non-object values', () => {
      expect(isChartMetadata('string')).toBe(false)
      expect(isChartMetadata(123)).toBe(false)
      expect(isChartMetadata(true)).toBe(false)
    })
  })

  describe('createChartMetadata helper', () => {
    it('should create valid ChartMetadata with required fields', () => {
      const metadata = createChartMetadata(
        'line',
        [{ x: 1, y: 2 }, { x: 2, y: 4 }],
        'x',
        'y'
      )

      expect(metadata.chartType).toBe('line')
      expect(metadata.data).toHaveLength(2)
      expect(metadata.xAxisKey).toBe('x')
      expect(metadata.yAxisKey).toBe('y')
    })

    it('should apply default values for optional fields', () => {
      const metadata = createChartMetadata(
        'bar',
        [{ x: 1, y: 2 }],
        'x',
        'y'
      )

      expect(metadata.showLegend).toBe(true)
      expect(metadata.showGrid).toBe(true)
      expect(metadata.showTooltip).toBe(true)
    })

    it('should accept optional configuration', () => {
      const metadata = createChartMetadata(
        'pie',
        [{ name: 'A', value: 10 }],
        'name',
        'value',
        {
          title: 'Sales Distribution',
          colors: ['#ff0000', '#00ff00', '#0000ff'],
          showLegend: false,
          width: 600,
          height: 400,
        }
      )

      expect(metadata.title).toBe('Sales Distribution')
      expect(metadata.colors).toHaveLength(3)
      expect(metadata.showLegend).toBe(false)
      expect(metadata.width).toBe(600)
      expect(metadata.height).toBe(400)
    })

    it('should support multiple yAxisKeys', () => {
      const metadata = createChartMetadata(
        'line',
        [{ x: 1, y1: 2, y2: 3 }],
        'x',
        ['y1', 'y2']
      )

      expect(Array.isArray(metadata.yAxisKey)).toBe(true)
      expect(metadata.yAxisKey).toHaveLength(2)
    })

    it('should create metadata that passes type guard', () => {
      const metadata = createChartMetadata(
        'area',
        [{ month: 'Jan', value: 100 }],
        'month',
        'value'
      )

      expect(isChartMetadata(metadata)).toBe(true)
    })
  })

  describe('Type safety with Artifact', () => {
    it('should allow ChartMetadata in Artifact', () => {
      const artifact = {
        id: '1',
        messageId: 'msg1',
        sessionId: 'session1',
        type: 'CHART' as const,
        title: 'Sales Chart',
        content: '',
        metadata: createChartMetadata(
          'bar',
          [{ product: 'A', sales: 100 }],
          'product',
          'sales'
        ),
      }

      expect(artifact.metadata).toBeDefined()
      if (artifact.metadata) {
        expect(isChartMetadata(artifact.metadata)).toBe(true)
      }
    })

    it('should allow generic metadata in Artifact', () => {
      const artifact = {
        id: '2',
        messageId: 'msg2',
        sessionId: 'session2',
        type: 'DOCUMENT' as const,
        title: 'Document',
        content: 'Content',
        metadata: {
          customField: 'value',
          anotherField: 123,
        },
      }

      expect(artifact.metadata).toBeDefined()
      expect(isChartMetadata(artifact.metadata)).toBe(false)
    })
  })

  describe('Real-world chart examples', () => {
    it('should support line chart for time series data', () => {
      const metadata = createChartMetadata(
        'line',
        [
          { date: '2024-01', revenue: 1000 },
          { date: '2024-02', revenue: 1200 },
          { date: '2024-03', revenue: 1500 },
        ],
        'date',
        'revenue',
        {
          title: 'Monthly Revenue',
          xAxisLabel: 'Month',
          yAxisLabel: 'Revenue ($)',
        }
      )

      expect(isChartMetadata(metadata)).toBe(true)
      expect(metadata.data).toHaveLength(3)
    })

    it('should support bar chart for categorical data', () => {
      const metadata = createChartMetadata(
        'bar',
        [
          { category: 'Electronics', sales: 5000 },
          { category: 'Clothing', sales: 3000 },
          { category: 'Food', sales: 4000 },
        ],
        'category',
        'sales',
        {
          title: 'Sales by Category',
          colors: ['#8884d8', '#82ca9d', '#ffc658'],
        }
      )

      expect(isChartMetadata(metadata)).toBe(true)
      expect(metadata.colors).toHaveLength(3)
    })

    it('should support multi-series line chart', () => {
      const metadata = createChartMetadata(
        'line',
        [
          { month: 'Jan', product1: 100, product2: 150 },
          { month: 'Feb', product1: 120, product2: 180 },
        ],
        'month',
        ['product1', 'product2'],
        {
          title: 'Product Comparison',
        }
      )

      expect(isChartMetadata(metadata)).toBe(true)
      expect(Array.isArray(metadata.yAxisKey)).toBe(true)
    })
  })
})
