import type { SessionTokens } from '@/types'

const ACCESS_TOKEN_KEY = 'owner-access-token'
const REFRESH_TOKEN_KEY = 'owner-refresh-token'

export const sessionStorageService = {
  getTokens(): SessionTokens | null {
    if (typeof window === 'undefined') return null
    const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY)
    const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!accessToken || !refreshToken) return null
    return { accessToken, refreshToken }
  },
  setTokens(tokens: SessionTokens) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
    window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  },
  clear() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(ACCESS_TOKEN_KEY)
    window.localStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}
