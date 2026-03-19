import { Outlet, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function ProtectedLayout() {
  const { isAuthenticated, isHydrated, isBootstrapping, bootstrap } = useAuthStore()

  useEffect(() => {
    if (!isHydrated) {
      void bootstrap()
    }
  }, [bootstrap, isHydrated])

  if (!isHydrated || isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-950 text-sm text-gray-500 dark:text-gray-400">
        Đang kiểm tra phiên đăng nhập...
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
