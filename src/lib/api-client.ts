/**
 * API Client - Unified HTTP client with error handling and retry logic
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request cancellation support
 * - Unified error handling
 * - Type-safe request/response
 * - Request interceptors
 * - Rate limiting and concurrency control
 */

export class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(`API Error ${status}: ${statusText}`)
    this.name = 'APIError'
  }
}

export interface RequestConfig extends RequestInit {
  retry?: number
  retryDelay?: number
  timeout?: number
  skipQueue?: boolean  // Skip rate limiting for urgent requests
}

interface QueuedRequest<T> {
  execute: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: any) => void
}

export class APIClient {
  private baseURL: string
  private defaultConfig: RequestConfig

  // Rate limiting
  private requestQueue: QueuedRequest<any>[] = []
  private activeRequests: number = 0
  private maxConcurrent: number = 5  // Max concurrent requests
  private requestsPerSecond: number = 10  // Rate limit
  private requestTimestamps: number[] = []  // Track request times for rate limiting
  private processing: boolean = false

  constructor(
    baseURL: string = '/api',
    config: RequestConfig = {},
    options: { maxConcurrent?: number; requestsPerSecond?: number } = {}
  ) {
    this.baseURL = baseURL
    this.defaultConfig = {
      retry: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config,
    }
    this.maxConcurrent = options.maxConcurrent ?? 5
    this.requestsPerSecond = options.requestsPerSecond ?? 10
  }

  /**
   * Make a request with retry logic
   */
  private async requestWithRetry<T>(
    url: string,
    config: RequestConfig,
    attempt: number = 1
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = config.timeout
      ? setTimeout(() => controller.abort(), config.timeout)
      : null

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      })

      if (timeoutId) clearTimeout(timeoutId)

      // Success
      if (response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/json')) {
          return await response.json()
        }
        return (await response.text()) as unknown as T
      }

      // Handle error
      const error = new APIError(
        response.status,
        response.statusText,
        await this.parseErrorResponse(response)
      )

      // Retry on 5xx errors or network issues
      const shouldRetry =
        response.status >= 500 &&
        attempt < (config.retry ?? this.defaultConfig.retry ?? 3)

      if (shouldRetry) {
        const delay = (config.retryDelay ?? this.defaultConfig.retryDelay ?? 1000) * Math.pow(2, attempt - 1)
        await this.sleep(delay)
        return this.requestWithRetry<T>(url, config, attempt + 1)
      }

      throw error
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId)

      // Handle abort
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError(408, 'Request Timeout')
      }

      // Handle network errors
      if (error instanceof TypeError) {
        const shouldRetry = attempt < (config.retry ?? this.defaultConfig.retry ?? 3)
        if (shouldRetry) {
          const delay = (config.retryDelay ?? this.defaultConfig.retryDelay ?? 1000) * Math.pow(2, attempt - 1)
          await this.sleep(delay)
          return this.requestWithRetry<T>(url, config, attempt + 1)
        }
        throw new APIError(0, 'Network Error', { originalError: error })
      }

      throw error
    }
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<any> {
    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }
      return await response.text()
    } catch {
      return null
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Check if we can make a request now based on rate limits
   */
  private canMakeRequest(): boolean {
    // Check concurrent limit
    if (this.activeRequests >= this.maxConcurrent) {
      return false
    }

    // Check rate limit (requests per second)
    const now = Date.now()
    const oneSecondAgo = now - 1000

    // Remove timestamps older than 1 second
    this.requestTimestamps = this.requestTimestamps.filter(ts => ts > oneSecondAgo)

    // Check if we've exceeded the rate limit
    return this.requestTimestamps.length < this.requestsPerSecond
  }

  /**
   * Record a request timestamp
   */
  private recordRequest(): void {
    this.requestTimestamps.push(Date.now())
    this.activeRequests++
  }

  /**
   * Mark a request as complete
   */
  private completeRequest(): void {
    this.activeRequests--
    this.processQueue()
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) {
      return
    }

    this.processing = true

    while (this.requestQueue.length > 0 && this.canMakeRequest()) {
      const request = this.requestQueue.shift()
      if (!request) break

      this.recordRequest()

      // Execute request asynchronously
      request.execute()
        .then(result => {
          request.resolve(result)
          this.completeRequest()
        })
        .catch(error => {
          request.reject(error)
          this.completeRequest()
        })

      // Small delay to prevent busy loop
      await this.sleep(10)
    }

    this.processing = false

    // Check if there are more requests to process
    if (this.requestQueue.length > 0) {
      // Schedule next processing cycle
      setTimeout(() => this.processQueue(), 100)
    }
  }

  /**
   * Queue a request or execute immediately if rate limit allows
   */
  private async queueRequest<T>(execute: () => Promise<T>, skipQueue: boolean = false): Promise<T> {
    // Skip queue for urgent requests
    if (skipQueue) {
      return execute()
    }

    // If we can make the request immediately, do so
    if (this.canMakeRequest()) {
      this.recordRequest()
      try {
        const result = await execute()
        this.completeRequest()
        return result
      } catch (error) {
        this.completeRequest()
        throw error
      }
    }

    // Otherwise, queue the request
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({
        execute,
        resolve,
        reject,
      })

      // Start processing if not already processing
      this.processQueue()
    })
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    return this.queueRequest(
      () => this.requestWithRetry<T>(url, {
        ...this.defaultConfig,
        ...config,
        method: 'GET',
      }),
      config.skipQueue
    )
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    return this.queueRequest(
      () => this.requestWithRetry<T>(url, {
        ...this.defaultConfig,
        ...config,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      }),
      config.skipQueue
    )
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    return this.queueRequest(
      () => this.requestWithRetry<T>(url, {
        ...this.defaultConfig,
        ...config,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      }),
      config.skipQueue
    )
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    return this.queueRequest(
      () => this.requestWithRetry<T>(url, {
        ...this.defaultConfig,
        ...config,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      }),
      config.skipQueue
    )
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    return this.queueRequest(
      () => this.requestWithRetry<T>(url, {
        ...this.defaultConfig,
        ...config,
        method: 'DELETE',
      }),
      config.skipQueue
    )
  }

  /**
   * Get current queue statistics
   */
  getQueueStats() {
    return {
      queueLength: this.requestQueue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
      requestsPerSecond: this.requestsPerSecond,
      recentRequestCount: this.requestTimestamps.length,
    }
  }

  /**
   * Clear the request queue
   * Useful for cleanup or when changing contexts
   */
  clearQueue() {
    this.requestQueue = []
  }
}

// Default API client instance
export const apiClient = new APIClient()

// Typed API methods for specific endpoints
export const api = {
  // Sessions
  sessions: {
    list: () => apiClient.get('/sessions'),
    get: (id: string) => apiClient.get(`/sessions/${id}`),
    create: (data: any) => apiClient.post('/sessions', data),
    update: (id: string, data: any) => apiClient.patch(`/sessions/${id}`, data),
    delete: (id: string) => apiClient.delete(`/sessions/${id}`),
  },

  // Group chat
  groupChat: {
    send: (sessionId: string, message: string, mode?: string) =>
      apiClient.post('/group-chat', { sessionId, message, mode }),
    manage: {
      listAgents: (sessionId: string) =>
        apiClient.get(`/group-chat/manage?sessionId=${sessionId}&action=list`),
      addAgent: (sessionId: string, agentId: string) =>
        apiClient.post('/group-chat/manage', {
          sessionId,
          action: 'add',
          agentId,
        }),
      removeAgent: (sessionId: string, agentId: string) =>
        apiClient.post('/group-chat/manage', {
          sessionId,
          action: 'remove',
          agentId,
        }),
    },
  },

  // Artifacts
  artifacts: {
    list: (sessionId: string, page = 1, limit = 20) =>
      apiClient.get(`/artifacts?sessionId=${sessionId}&page=${page}&limit=${limit}`),
    get: (id: string) => apiClient.get(`/artifacts/${id}`),
    create: (data: any) => apiClient.post('/artifacts', data),
    update: (id: string, data: any) => apiClient.patch(`/artifacts/${id}`, data),
    delete: (id: string) => apiClient.delete(`/artifacts/${id}`),
  },

  // Agents
  agents: {
    list: () => apiClient.get('/agents'),
    get: (id: string) => apiClient.get(`/agents/${id}`),
    create: (data: any) => apiClient.post('/agents', data),
    update: (id: string, data: any) => apiClient.patch(`/agents/${id}`, data),
    delete: (id: string) => apiClient.delete(`/agents/${id}`),
  },

  // Profile
  profile: {
    get: () => apiClient.get('/profile'),
    update: (data: any) => apiClient.patch('/profile', data),
  },
}
