import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Headphones, Clock, Users, ChevronLeft } from 'lucide-react'
import { StatCard } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useShopStore } from '@/stores/shopStore'
import { mockPlayLogs, mockDailyStats, LANGUAGES } from '@/data/mock'
import { formatNumber, formatDuration, formatDate, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

type Range = '7d' | '30d' | 'custom'

export default function AnalyticsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { shops, pois } = useShopStore()
  const shop = shops.find((s) => s.id === id)
  const [range, setRange] = useState<Range>('7d')

  const shopPOIs = pois.filter((p) => p.shopId === id)

  const days = range === '7d' ? 7 : 30
  const chartData = mockDailyStats.slice(-days)

  const totalPlays = chartData.reduce((s, d) => s + d.plays, 0)
  const avgDuration = Math.floor(
    mockPlayLogs.reduce((s, l) => s + l.duration, 0) / mockPlayLogs.length
  )

  // Language breakdown
  const langData = useMemo(() => {
    const map: Record<string, number> = {}
    mockPlayLogs.forEach((l) => {
      map[l.language] = (map[l.language] || 0) + 1
    })
    return Object.entries(map).map(([code, count]) => {
      const lang = LANGUAGES.find((l) => l.code === code)
      return { name: lang ? `${lang.flag} ${lang.label}` : code, count }
    })
  }, [])

  // Heatmap data (7 days x 24 hours)
  const heatmapData = useMemo(() => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
    const data: { day: string; hour: number; plays: number }[] = []
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        data.push({
          day: days[d],
          hour: h,
          plays: Math.floor(Math.random() * 20),
        })
      }
    }
    return data
  }, [])

  const maxHeatmap = Math.max(...heatmapData.map((d) => d.plays))

  if (!shop) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Không tìm thấy gian hàng</p>
        <Button className="mt-4" onClick={() => navigate('/shops')}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/shops')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Thống kê - {shop.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{shop.address}</p>
        </div>
      </div>

      {/* Range picker */}
      <div className="flex items-center gap-2">
        {(['7d', '30d', 'custom'] as Range[]).map((r) => (
          <Button
            key={r}
            variant={range === r ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setRange(r)}
          >
            {r === '7d' ? '7 ngày' : r === '30d' ? '30 ngày' : 'Tuỳ chỉnh'}
          </Button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Tổng lượt nghe"
          value={formatNumber(totalPlays)}
          icon={<Headphones size={20} />}
          trend="+15% so với kỳ trước"
          trendUp
          color="indigo"
        />
        <StatCard
          label="Thời gian nghe TB"
          value={formatDuration(avgDuration)}
          icon={<Clock size={20} />}
          color="emerald"
        />
        <StatCard
          label="Khách unique"
          value={formatNumber(Math.floor(totalPlays * 0.7))}
          icon={<Users size={20} />}
          color="amber"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Lượt nghe theo ngày</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
              <XAxis
                dataKey="date"
                tickFormatter={(v) => formatDate(v).slice(0, 5)}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                labelFormatter={(v) => formatDate(v as string)}
                formatter={(v) => [formatNumber(v as number), 'Lượt nghe']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="plays" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart - Language */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Ngôn ngữ được nghe</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={langData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-700" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => [formatNumber(v as number), 'Lượt nghe']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Heatmap giờ cao điểm</h2>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-fit">
            {/* Y axis - days */}
            <div className="flex flex-col gap-1 mr-1">
              <div className="w-6 h-5" /> {/* header spacer */}
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
                <div key={d} className="w-6 h-5 flex items-center justify-end text-[10px] text-gray-400">{d}</div>
              ))}
            </div>
            {/* Grid */}
            <div>
              {/* Hour headers */}
              <div className="flex gap-1 mb-1">
                {Array.from({ length: 24 }, (_, h) => (
                  <div key={h} className={cn('w-5 h-5 text-[9px] text-gray-400 flex items-center justify-center', h % 4 === 0 ? 'visible' : 'invisible')}>
                    {h}
                  </div>
                ))}
              </div>
              {/* Rows */}
              {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
                <div key={day} className="flex gap-1 mb-1">
                  {Array.from({ length: 24 }, (_, h) => {
                    const cell = heatmapData.find((d) => d.day === day && d.hour === h)
                    const intensity = cell ? cell.plays / maxHeatmap : 0
                    return (
                      <div
                        key={h}
                        title={`${day} ${h}:00 - ${cell?.plays ?? 0} lượt`}
                        className="w-5 h-5 rounded-sm cursor-default"
                        style={{
                          backgroundColor: intensity === 0
                            ? '#f3f4f6'
                            : `rgba(99, 102, 241, ${0.15 + intensity * 0.85})`,
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>Ít</span>
          <div className="flex gap-1">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
              <div key={v} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(99, 102, 241, ${v})` }} />
            ))}
          </div>
          <span>Nhiều</span>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Lịch sử lượt nghe</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50">
                <th className="px-5 py-3 font-medium">Thời gian</th>
                <th className="px-5 py-3 font-medium">POI</th>
                <th className="px-5 py-3 font-medium">Ngôn ngữ</th>
                <th className="px-5 py-3 font-medium">Thời lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {mockPlayLogs.slice(0, 15).map((log) => {
                const poi = shopPOIs.find((p) => p.id === log.poiId) || pois[0]
                const lang = LANGUAGES.find((l) => l.code === log.language)
                return (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400 text-xs">
                      {formatDateTime(log.playedAt)}
                    </td>
                    <td className="px-5 py-3 text-gray-900 dark:text-white font-medium">
                      {poi?.name || '-'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-base">{lang?.flag}</span>
                      <span className="text-gray-600 dark:text-gray-400 text-xs ml-1">{lang?.label}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 dark:text-gray-400">
                      {formatDuration(log.duration)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
