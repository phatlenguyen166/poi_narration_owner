import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Owner } from '@/types'
import { mockOwner } from '@/data/mock'

interface AuthState {
  user: Owner | null
  isAuthenticated: boolean
  login: (email: string, _password: string) => Promise<void>
  logout: () => void
  updateUser: (data: Partial<Owner>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, _password: string) => {
        // mock login
        await new Promise((r) => setTimeout(r, 800))
        set({ user: { ...mockOwner, email }, isAuthenticated: true })
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUser: (data) =>
        set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
    }),
    { name: 'auth-storage' }
  )
)
