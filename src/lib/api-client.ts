/**
 * API Client - Unified HTTP client with error handling and retry logic
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Request cancellation support
 * - Unified error handling
 * - Type-safe request/response
 * - Request interceptors
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
}

export class APIClient {
  private baseURL: string
  private defaultConfig: RequestConfig

  constructor(baseURL: string = '/api', config: RequestConfig = {}) {
    this.baseURL = baseURL
    this.defaultConfig = {
      retry: 3,
      retryDelay: 1000,
      timeout: 30000,
      ...config,
    }
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
   * GET request
   */
  async get<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    return this.requestWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'GET',
    })
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
    return this.requestWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
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
    return this.requestWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
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
    return this.requestWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    return this.requestWithRetry<T>(url, {
      ...this.defaultConfig,
      ...config,
      method: 'DELETE',
    })
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
