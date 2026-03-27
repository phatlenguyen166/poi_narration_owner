import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { env } from './env'
import { sessionStorageService } from './session'
import { ApiError } from './api-client'

type AxiosExtraConfig = {
  // Avoid using `config.auth` because Axios reserves that name for basic-auth credentials.
  skipAuth?: boolean
}

const jsonHeaders: Record<string, string> = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
}

const parseResponse = async (response: Response): Promise<unknown> => {
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
    if (typeof message === 'string' && message.trim()) return message
  }
  if (typeof payload === 'string' && payload.trim()) return payload
  return fallback
}

const refreshAccessToken = async (): Promise<string | null> => {
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

  const record = payload as Record<string, unknown>
  const nextAccessToken = typeof record.accessToken === 'string' ? record.accessToken : ''
  const nextRefreshToken = typeof record.refreshToken === 'string' ? record.refreshToken : tokens.refreshToken

  if (!nextAccessToken) {
    sessionStorageService.clear()
    return null
  }

  sessionStorageService.setTokens({
    accessToken: nextAccessToken,
    refreshToken: String(nextRefreshToken),
  })

  return nextAccessToken
}

export const axiosClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: jsonHeaders,
})

axiosClient.interceptors.request.use((config) => {
  const extra = config as InternalAxiosRequestConfig & AxiosExtraConfig
  if (extra.skipAuth === true) return config

  const tokens = sessionStorageService.getTokens()
  if (tokens?.accessToken) {
    config.headers = config.headers ?? {}
    ;(config.headers as Record<string, string>).Authorization = `Bearer ${tokens.accessToken}`
  }
  return config
})

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const payload = error.response?.data

    const originalConfig = error.config as (InternalAxiosRequestConfig & AxiosExtraConfig & { _retry?: boolean }) | undefined

    if (status === 401 && originalConfig && originalConfig.skipAuth !== true && !originalConfig._retry) {
      originalConfig._retry = true
      const nextAccessToken = await refreshAccessToken()

      if (nextAccessToken) {
        originalConfig.headers = originalConfig.headers ?? {}
        ;(originalConfig.headers as Record<string, string>).Authorization = `Bearer ${nextAccessToken}`
        return axiosClient(originalConfig)
      }
    }

    const message = toErrorMessage(payload, error.message || 'Yêu cầu thất bại')
    throw new ApiError(message, status ?? 0, payload)
  },
)

