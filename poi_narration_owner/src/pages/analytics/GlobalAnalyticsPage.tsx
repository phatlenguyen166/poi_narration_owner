import { useNavigate } from 'react-router-dom'
import { BarChart2, ExternalLink, Headphones, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useShopStore } from '@/stores/shopStore'
import { StatCard } from '@/components/ui/Card'
import { mockDailyStats } from '@/data/mock'
import { formatNumber } from '@/lib/utils'

export default function GlobalAnalyticsPage() {
  const { shops } = useShopStore()
  const navigate = useNavigate()
  const totalPlays = mockDailyStats.slice(-30).reduce((s, d) => s + d.plays, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Thống kê tổng quan</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Xem thống kê chi tiết từng gian hàng</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard
          label="Tổng lượt nghe (30 ngày)"
          value={formatNumber(totalPlays)}
          icon={<Headphones size={20} />}
          color="indigo"
        />
        <StatCard
          label="Tổng gian hàng"
          value={shops.length}
          icon={<TrendingUp size={20} />}
          color="emerald"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Thống kê theo gian hàng</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {shops.map((shop) => (
            <div key={shop.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <img src={shop.thumbnail} alt={shop.name} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white">{shop.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{shop.poiCount} POI</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/shops/${shop.id}/analytics`)}
              >
                <BarChart2 size={14} /> Xem chi tiết <ExternalLink size={12} />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
