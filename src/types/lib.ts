export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions {
  method?: HttpMethod
  body?: BodyInit | object | null
  headers?: Record<string, string>
  auth?: boolean
}

export interface SessionTokens {
  accessToken: string
  refreshToken: string
}
