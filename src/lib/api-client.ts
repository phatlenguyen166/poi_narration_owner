import { env } from './env'
import { sessionStorageService } from './session'
import type { RequestOptions } from '@/types'

export class ApiError extends Error {
  readonly status: number
  readonly payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

const jsonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

const parseResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    return text || null
  }
  return response.json()
}

const toErrorMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>
    const message = candidate.message ?? candidate.error ?? candidate.detail
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }
  return fallback
}

const refreshAccessToken = async () => {
  const tokens = sessionStorageService.getTokens()
  if (!tokens?.refreshToken) {
    sessionStorageService.clear()
    return null
  }

  const response = await fetch(`${env.apiBaseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  })

  const payload = await parseResponse(response)
  if (!response.ok || !payload || typeof payload !== 'object') {
    sessionStorageService.clear()
    return null
  }

  const nextTokens = {
    accessToken: String((payload as Record<string, unknown>).accessToken ?? ''),
    refreshToken: String((payload as Record<string, unknown>).refreshToken ?? tokens.refreshToken),
  }

  if (!nextTokens.accessToken) {
    sessionStorageService.clear()
    return null
  }

  sessionStorageService.setTokens(nextTokens)
  return nextTokens.accessToken
}

const buildRequestBody = (body: RequestOptions['body'], headers: Record<string, string>) => {
  if (body == null) return null
  if (body instanceof FormData) {
    delete headers['Content-Type']
    return body
  }
  if (typeof body === 'string' || body instanceof Blob) {
    return body
  }
  return JSON.stringify(body)
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}, retry = true): Promise<T> {
    const headers: Record<string, string> = { ...jsonHeaders, ...(options.headers ?? {}) }
    const body = buildRequestBody(options.body, headers)
    const tokens = sessionStorageService.getTokens()

    if (options.auth !== false && tokens?.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`
    }

    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body,
    })

    if (response.status === 401 && options.auth !== false && retry) {
      const nextAccessToken = await refreshAccessToken()
      if (nextAccessToken) {
        return this.request<T>(path, options, false)
      }
    }

    const payload = await parseResponse(response)
    if (!response.ok) {
      throw new ApiError(toErrorMessage(payload, 'Yêu cầu thất bại'), response.status, payload)
    }

    return payload as T
  },
}
