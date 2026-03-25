import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UIState } from '@/types'

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      darkMode: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleDarkMode: () => {
        document.documentElement.classList.remove('dark')
        set({ darkMode: false })
      },
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    }),
    { name: 'ui-storage' }
  )
)
