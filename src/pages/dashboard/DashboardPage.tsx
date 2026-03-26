import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Headphones, Store, TrendingUp, Activity,
  Eye, ChevronRight, Info, AlertTriangle, CheckCircle,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useShopStore } from '@/stores/shopStore'
import { formatNumber, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const getApprovalBadge = (approvalStatus?: string) => {
  switch ((approvalStatus ?? '').toUpperCase()) {
    case 'APPROVED':
      return { label: 'Đã duyệt', variant: 'success' as const }
    case 'REJECTED':
      return { label: 'Từ chối', variant: 'danger' as const }
    default:
      return { label: 'Chờ duyệt', variant: 'warning' as const }
  }
}

export default function DashboardPage() {
  const { shops, dashboard, notifications, fetchDashboard, fetchShops, toggleShopActive } = useShopStore()
  const navigate = useNavigate()

  useEffect(() => {
    void fetchDashboard()
    void fetchShops()
  }, [fetchDashboard, fetchShops])

  const last7 = dashboard.recentDailyPlays.slice(-7)
  const todayPlays = dashboard.todayPlays
  const weekPlays = dashboard.weekPlays
  const monthPlays = dashboard.monthPlays
  const activePOIs = dashboard.activePoiCount

  const topPOIs = [...shops]
        .sort((a, b) => b.audioGuideCount - a.audioGuideCount)
    .slice(0, 3)

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* System banners */}
      {notifications.filter((n) => !n.read).slice(0, 1).map((n) => (
        <div
          key={n.id}
          className={cn(
            'flex items-center gap-3 rounded-xl px-4 py-3 text-sm',
            n.type === 'info' && 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
            n.type === 'warning' && 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300',
            n.type === 'success' && 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300',
          )}
        >
          {n.type === 'info' && <Info size={16} />}
          {n.type === 'warning' && <AlertTriangle size={16} />}
          {n.type === 'success' && <CheckCircle size={16} />}
          <span>{n.message}</span>
        </div>
      ))}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Tổng quan hoạt động gian hàng của bạn
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Lượt nghe hôm nay"
          value={formatNumber(todayPlays)}
          icon={<Headphones size={20} />}
          color="indigo"
        />
        <StatCard
          label="Lượt nghe tuần này"
          value={formatNumber(weekPlays)}
          icon={<TrendingUp size={20} />}
          color="emerald"
        />
        <StatCard
          label="Lượt nghe tháng này"
          value={formatNumber(monthPlays)}
          icon={<Activity size={20} />}
          color="amber"
        />
        <StatCard
          label="Audio guide"
          value={activePOIs}
          icon={<Store size={20} />}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-none p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Lượt nghe 7 ngày gần nhất</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng: {formatNumber(weekPlays)}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last7} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDate(v).slice(0, 5)}
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                labelFormatter={(v) => formatDate(v as string)}
                formatter={(v) => [formatNumber(v as number), 'Lượt nghe']}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="plays"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top POIs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-none p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Top gian hàng</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/shops')}>
              Xem tất cả
            </Button>
          </div>
          <div className="space-y-3">
            {topPOIs.map((shop, i) => (
              <div
                key={shop.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                onClick={() => navigate(`/shops/${shop.id}/analytics`)}
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                  i === 0 && 'bg-amber-100 text-amber-700',
                  i === 1 && 'bg-gray-100 text-gray-600',
                  i === 2 && 'bg-orange-100 text-orange-600',
                )}>
                  {i + 1}
                </div>
                <img
                  src={shop.thumbnail}
                  alt={shop.name}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{shop.name}</p>
                  <p className="text-xs text-gray-500">{shop.audioGuideCount} audio guide</p>
                </div>
                <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shops status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm dark:shadow-none p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Trạng thái gian hàng</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/shops')}>
            <Eye size={14} /> Quản lý
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <th className="pb-2 font-medium">Gian hàng</th>
                <th className="pb-2 font-medium">Danh mục</th>
                <th className="pb-2 font-medium">POI</th>
                <th className="pb-2 font-medium">Trạng thái</th>
                <th className="pb-2 font-medium">Hoạt động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-2.5 font-medium text-gray-900 dark:text-white">{shop.name}</td>
                  <td className="py-2.5 text-gray-500 dark:text-gray-400">Địa điểm</td>
                  <td className="py-2.5 text-gray-700 dark:text-gray-300">{shop.audioGuideCount}</td>
                  <td className="py-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getApprovalBadge(shop.approvalStatus).variant}>
                        {getApprovalBadge(shop.approvalStatus).label}
                      </Badge>
                      <Badge variant={shop.isActive ? 'success' : 'default'}>
                        {shop.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <Toggle
                      checked={shop.isActive}
                      onChange={() => void toggleShopActive(shop.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
