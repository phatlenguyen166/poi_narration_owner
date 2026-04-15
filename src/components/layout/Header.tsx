import { useNavigate } from 'react-router-dom'
import { Bell, Menu } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
import { useShopStore } from '@/stores/shopStore'

interface BreadcrumbItem {
  label: string
  to?: string
}

interface HeaderProps {
  breadcrumbs?: BreadcrumbItem[]
}

export function Header({ breadcrumbs = [] }: HeaderProps) {
  const { toggleSidebar } = useUIStore()
  const { notifications, fetchDashboard } = useShopStore()
  const [showNotif, setShowNotif] = useState(false)
  const navigate = useNavigate()
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    void fetchDashboard().catch(() => undefined)
  }, [fetchDashboard])

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-[rgba(255,251,245,0.86)] dark:bg-gray-900 border-b border-orange-100 dark:border-gray-700 shadow-sm shadow-orange-100/60 dark:shadow-none flex-shrink-0 backdrop-blur-xl">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
        >
          <Menu size={20} />
        </button>
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-300 dark:text-gray-600">/</span>}
              {crumb.to ? (
                <button
                  onClick={() => navigate(crumb.to!)}
                  className="text-gray-500 hover:text-orange-600 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-gray-900 dark:text-white font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotif(false)} />
              <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Thông báo</h3>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 && (
                    <div className="px-4 py-6 text-sm text-center text-gray-400 dark:text-gray-500">
                      Chưa có thông báo hệ thống.
                    </div>
                  )}
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0',
                        !n.read && 'bg-orange-50'
                      )}
                    >
                      <div className="flex gap-2">
                        <span className={cn(
                          'mt-0.5 w-2 h-2 rounded-full flex-shrink-0',
                          n.type === 'success' && 'bg-emerald-500',
                          n.type === 'warning' && 'bg-amber-500',
                          n.type === 'info' && 'bg-blue-500',
                        )} />
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-200">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
