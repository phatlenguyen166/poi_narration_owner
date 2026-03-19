import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { authApi } from '@/services/authApi'
import { sessionStorageService } from '@/lib/session'
import type { Owner } from '@/types'

interface RegisterPayload {
  name: string
  email: string
  password: string
  phoneNumber?: string
}

interface AuthState {
  user: Owner | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  isBootstrapping: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  bootstrap: () => Promise<void>
  logout: () => void
  updateUser: (data: Partial<Owner>) => void
  refreshProfile: () => Promise<void>
}

const applySession = (set: (partial: Partial<AuthState>) => void, user: Owner, accessToken: string, refreshToken: string) => {
  sessionStorageService.setTokens({ accessToken, refreshToken })
  set({
    user,
    accessToken,
    refreshToken,
    isAuthenticated: true,
    isHydrated: true,
    isBootstrapping: false,
  })
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,
      isBootstrapping: false,
      login: async (email, password) => {
        const session = await authApi.login({ email, password })
        applySession(set, session.user, session.accessToken, session.refreshToken)
      },
      register: async ({ name, email, password, phoneNumber }) => {
        const session = await authApi.register({ name, email, password, phoneNumber })
        applySession(set, session.user, session.accessToken, session.refreshToken)
      },
      bootstrap: async () => {
        if (get().isBootstrapping) return
        const tokens = sessionStorageService.getTokens()
        if (!tokens?.accessToken || !tokens.refreshToken) {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isHydrated: true,
            isBootstrapping: false,
          })
          return
        }

        set({ isBootstrapping: true })

        try {
          const user = await authApi.me()
          set({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isHydrated: true,
            isBootstrapping: false,
          })
        } catch {
          sessionStorageService.clear()
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isHydrated: true,
            isBootstrapping: false,
          })
        }
      },
      logout: () => {
        sessionStorageService.clear()
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isHydrated: true,
          isBootstrapping: false,
        })
      },
      updateUser: (data) =>
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
      refreshProfile: async () => {
        const user = await authApi.me()
        set((state) => ({
          user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: true,
          isHydrated: true,
          isBootstrapping: false,
        }))
      },
    }),
    {
      name: 'owner-auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.bootstrap()
      },
    },
  ),
)
