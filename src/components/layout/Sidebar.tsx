import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Store,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Radio,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/shops', icon: Store, label: 'Gian hàng' },
  { to: '/analytics', icon: BarChart2, label: 'Thống kê' },
  { to: '/settings', icon: Settings, label: 'Cài đặt' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-md dark:shadow-none transition-all duration-300 relative',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 bg-indigo-600 dark:bg-transparent dark:border-b dark:border-gray-700',
        sidebarCollapsed ? 'justify-center' : ''
      )}>
        <div className="flex-shrink-0 w-8 h-8 bg-white/20 dark:bg-indigo-600 rounded-lg flex items-center justify-center">
          <Radio size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-bold text-white text-sm leading-tight">
            Audio Tour<br />
            <span className="text-indigo-200 dark:text-indigo-400 font-normal text-xs">Owner Portal</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:ring-0 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200',
                sidebarCollapsed && 'justify-center'
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-gray-100 dark:border-gray-700 p-3 bg-gray-50/50 dark:bg-transparent">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 mb-2">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt="avatar"
              className="w-8 h-8 rounded-full bg-gray-200"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt="avatar"
              className="w-8 h-8 rounded-full bg-gray-200"
            />
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors w-full rounded-lg px-2 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20',
            sidebarCollapsed && 'justify-center'
          )}
          title={sidebarCollapsed ? 'Đăng xuất' : undefined}
        >
          <LogOut size={16} />
          {!sidebarCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>

      {/* Collapse button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm z-10"
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  )
}
