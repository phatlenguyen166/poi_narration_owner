import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface AppLayoutProps {
  breadcrumbs?: { label: string; to?: string }[]
}

export function AppLayout({ breadcrumbs }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-gray-950 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

