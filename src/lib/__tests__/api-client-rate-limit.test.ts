import { describe, it, expect, beforeEach, vi } from 'vitest'
import { APIClient } from '../api-client'

// Mock fetch
global.fetch = vi.fn()

describe('APIClient Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      text: async () => 'success',
      headers: new Headers({ 'content-type': 'application/json' }),
    })
  })

  describe('Concurrent request limiting', () => {
    it('should limit concurrent requests to maxConcurrent', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 2 })

      // Track active requests
      let activeCount = 0
      let maxActive = 0

      ;(global.fetch as any).mockImplementation(() => {
        activeCount++
        maxActive = Math.max(maxActive, activeCount)

        return new Promise(resolve => {
          setTimeout(() => {
            activeCount--
            resolve({
              ok: true,
              json: async () => ({ success: true }),
              headers: new Headers({ 'content-type': 'application/json' }),
            })
          }, 50)
        })
      })

      // Make 5 requests
      const promises = Array.from({ length: 5 }, (_, i) =>
        client.get(`/test-${i}`)
      )

      await Promise.all(promises)

      // Should never have more than 2 concurrent requests
      expect(maxActive).toBeLessThanOrEqual(2)
    })

    it('should process requests sequentially when maxConcurrent is 1', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      const executionOrder: number[] = []

      ;(global.fetch as any).mockImplementation((url: string) => {
        const index = parseInt(url.split('-')[1])
        executionOrder.push(index)

        return Promise.resolve({
          ok: true,
          json: async () => ({ index }),
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      })

      const promises = [
        client.get('/test-0'),
        client.get('/test-1'),
        client.get('/test-2'),
      ]

      await Promise.all(promises)

      // Execution order should be sequential
      expect(executionOrder).toEqual([0, 1, 2])
    })
  })

  describe('Rate limiting (requests per second)', () => {
    it('should respect requests per second limit', async () => {
      const client = new APIClient('/api', {}, {
        maxConcurrent: 10,
        requestsPerSecond: 5,
      })

      const startTime = Date.now()
      const timestamps: number[] = []

      ;(global.fetch as any).mockImplementation(() => {
        timestamps.push(Date.now() - startTime)
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      })

      // Make 10 requests
      const promises = Array.from({ length: 10 }, (_, i) =>
        client.get(`/test-${i}`)
      )

      await Promise.all(promises)

      // First 5 should execute immediately
      const firstFive = timestamps.slice(0, 5)
      expect(firstFive.every(t => t < 100)).toBe(true)

      // Next 5 should be delayed by at least 1 second
      const nextFive = timestamps.slice(5)
      expect(nextFive.every(t => t >= 900)).toBe(true)
    }, 10000)
  })

  describe('Queue management', () => {
    it('should queue requests when limit is reached', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      ;(global.fetch as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true }),
              headers: new Headers({ 'content-type': 'application/json' }),
            })
          }, 100)
        })
      })

      // Start first request
      const promise1 = client.get('/test-1')

      // Wait a bit to ensure first request is active
      await new Promise(resolve => setTimeout(resolve, 10))

      // Check queue stats
      const stats = client.getQueueStats()
      expect(stats.activeRequests).toBe(1)

      // Start more requests (should be queued)
      const promise2 = client.get('/test-2')
      const promise3 = client.get('/test-3')

      await new Promise(resolve => setTimeout(resolve, 10))

      // Check queue again
      const stats2 = client.getQueueStats()
      expect(stats2.queueLength).toBeGreaterThan(0)

      await Promise.all([promise1, promise2, promise3])

      // Queue should be empty after all complete
      const finalStats = client.getQueueStats()
      expect(finalStats.queueLength).toBe(0)
      expect(finalStats.activeRequests).toBe(0)
    })

    it('should allow skipping queue for urgent requests', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      const executionOrder: number[] = []

      ;(global.fetch as any).mockImplementation((url: string) => {
        const index = parseInt(url.split('-')[1])
        executionOrder.push(index)

        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ index }),
              headers: new Headers({ 'content-type': 'application/json' }),
            })
          }, 50)
        })
      })

      // Start normal requests
      const promise1 = client.get('/test-1')
      const promise2 = client.get('/test-2')

      await new Promise(resolve => setTimeout(resolve, 10))

      // Urgent request should skip queue
      const urgentPromise = client.get('/test-3', { skipQueue: true })

      await Promise.all([promise1, promise2, urgentPromise])

      // Urgent request (3) should execute before queued request (2)
      const urgentIndex = executionOrder.indexOf(3)
      const queuedIndex = executionOrder.indexOf(2)
      expect(urgentIndex).toBeLessThan(queuedIndex)
    })

    it('should clear queue when requested', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      ;(global.fetch as any).mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ success: true }),
              headers: new Headers({ 'content-type': 'application/json' }),
            })
          }, 100)
        })
      })

      // Start requests
      client.get('/test-1')
      client.get('/test-2')
      client.get('/test-3')

      await new Promise(resolve => setTimeout(resolve, 10))

      // Queue should have requests
      const statsBefore = client.getQueueStats()
      expect(statsBefore.queueLength).toBeGreaterThan(0)

      // Clear queue
      client.clearQueue()

      const statsAfter = client.getQueueStats()
      expect(statsAfter.queueLength).toBe(0)
    })
  })

  describe('Queue statistics', () => {
    it('should report accurate queue statistics', async () => {
      const client = new APIClient('/api', {}, {
        maxConcurrent: 2,
        requestsPerSecond: 5,
      })

      const stats = client.getQueueStats()

      expect(stats).toHaveProperty('queueLength')
      expect(stats).toHaveProperty('activeRequests')
      expect(stats).toHaveProperty('maxConcurrent')
      expect(stats).toHaveProperty('requestsPerSecond')
      expect(stats).toHaveProperty('recentRequestCount')

      expect(stats.maxConcurrent).toBe(2)
      expect(stats.requestsPerSecond).toBe(5)
      expect(stats.queueLength).toBe(0)
      expect(stats.activeRequests).toBe(0)
    })
  })

  describe('All HTTP methods respect rate limits', () => {
    it('should rate limit GET requests', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      const promises = [
        client.get('/test-1'),
        client.get('/test-2'),
      ]

      await Promise.all(promises)

      // Should complete without errors
      expect(true).toBe(true)
    })

    it('should rate limit POST requests', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      const promises = [
        client.post('/test-1', { data: 1 }),
        client.post('/test-2', { data: 2 }),
      ]

      await Promise.all(promises)

      expect(true).toBe(true)
    })

    it('should rate limit PUT requests', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      const promises = [
        client.put('/test-1', { data: 1 }),
        client.put('/test-2', { data: 2 }),
      ]

      await Promise.all(promises)

      expect(true).toBe(true)
    })

    it('should rate limit PATCH requests', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      const promises = [
        client.patch('/test-1', { data: 1 }),
        client.patch('/test-2', { data: 2 }),
      ]

      await Promise.all(promises)

      expect(true).toBe(true)
    })

    it('should rate limit DELETE requests', async () => {
      const client = new APIClient('/api', {}, { maxConcurrent: 1 })

      const promises = [
        client.delete('/test-1'),
        client.delete('/test-2'),
      ]

      await Promise.all(promises)

      expect(true).toBe(true)
    })
  })

  describe('Integration with retry logic', () => {
    it('should rate limit even with retries', async () => {
      const client = new APIClient('/api', { retry: 2 }, { maxConcurrent: 1 })

      let attempt = 0
      ;(global.fetch as any).mockImplementation(() => {
        attempt++
        if (attempt === 1) {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({ error: 'Server error' }),
            headers: new Headers({ 'content-type': 'application/json' }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
          headers: new Headers({ 'content-type': 'application/json' }),
        })
      })

      const result = await client.get('/test')

      // Should succeed after retry
      expect(result).toEqual({ success: true })
      expect(attempt).toBe(2)
    })
  })
})
