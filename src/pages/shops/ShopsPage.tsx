import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MapPin, Edit, BarChart2, Trash2, QrCode, Store, Map as MapIcon, Radio, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { useShopStore } from '@/stores/shopStore'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import type { Shop } from '@/types'

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

function ShopCard({ shop, canUseQr, onEdit, onDelete, onToggle, onAnalytics, onQR }: {
  shop: Shop
  canUseQr: boolean
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onAnalytics: () => void
  onQR: () => void
}) {
  const approvalBadge = getApprovalBadge(shop.approvalStatus)

  return (
    <div className="group overflow-hidden rounded-3xl border border-orange-100/80 bg-white shadow-sm shadow-orange-100/70 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-100/80 dark:border-gray-700 dark:bg-gray-800 dark:shadow-none dark:hover:border-orange-700">
      <div className="relative h-52 overflow-hidden">
        <img
          src={shop.thumbnail}
          alt={shop.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-950/20 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm backdrop-blur">
            Địa điểm
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${
            shop.isActive ? 'bg-emerald-100/95 text-emerald-700' : 'bg-gray-100/95 text-gray-600'
          }`}>
            {shop.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={approvalBadge.variant}>{approvalBadge.label}</Badge>
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-700 backdrop-blur">
              {shop.audioGuideCount} audio guide
            </span>
          </div>
          <h3 className="line-clamp-2 text-xl font-bold leading-tight text-white drop-shadow-sm">{shop.name}</h3>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start gap-2 rounded-2xl bg-orange-50/70 p-3 text-sm text-gray-700 dark:bg-gray-900/40 dark:text-gray-300">
          <MapPin size={16} className="mt-0.5 shrink-0 text-orange-500" />
          <span className="line-clamp-2">{shop.address || 'Chưa có địa chỉ'}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {shop.approvalStatus === 'REJECTED' ? 'Cần chỉnh sửa để gửi duyệt lại' : 'Có thể cập nhật bất cứ lúc nào'}
          </span>
          <Toggle checked={shop.isActive} onChange={onToggle} />
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 dark:border-gray-700">
          <Button variant="outline" size="sm" className="justify-center" onClick={onEdit}>
            <Edit size={13} /> Sửa
          </Button>
          <Button variant="outline" size="sm" className="justify-center" onClick={onAnalytics}>
            <BarChart2 size={13} /> Thống kê
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="justify-center bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-70 dark:bg-gray-900/40"
            onClick={onQR}
            title={canUseQr ? 'QR Code' : 'Gói FREE không hỗ trợ QR Code'}
          >
            <QrCode size={14} /> {canUseQr ? 'QR' : 'Nâng cấp'}
          </Button>
          <Button variant="ghost" size="sm" className="justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={onDelete}>
            <Trash2 size={14} /> Xóa
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ShopsPage() {
  const { shops, fetchShops, deleteShop, toggleShopActive, isLoading } = useShopStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const activeCount = shops.filter((s) => s.isActive).length
  const audioGuideCount = shops.reduce((total, shop) => total + (shop.audioGuideCount ?? 0), 0)
  const canUseQr = user?.plan !== 'free'

  useEffect(() => {
    void fetchShops()
  }, [fetchShops])

  const filtered = shops.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = () => {
    if (deleteTarget) {
      void deleteShop(deleteTarget)
        .then(() => {
          toast.success('Đã xóa gian hàng')
          setDeleteTarget(null)
        })
        .catch(() => {
          toast.error('Không thể xóa gian hàng')
        })
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 shadow-sm shadow-orange-100/70 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950/20 dark:shadow-none sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm dark:bg-gray-800 dark:text-orange-300">
              <Sparkles size={14} />
              Quản lý địa điểm thuyết minh
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">Gian hàng</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-300">
              Theo dõi trạng thái duyệt, audio guide{canUseQr ? ', QR' : ''} và hiệu suất nghe của từng địa điểm.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="bg-white/80" onClick={() => navigate('/shops/map')}>
              <MapIcon size={16} /> Xem bản đồ
            </Button>
            <Button className="shadow-lg shadow-orange-200/70" onClick={() => navigate('/shops/new')}>
              <Plus size={16} /> Thêm gian hàng
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/85 p-4 shadow-sm dark:bg-gray-800/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tổng gian hàng</p>
            <p className="mt-1 text-2xl font-black text-gray-950 dark:text-white">{shops.length}</p>
          </div>
          <div className="rounded-2xl bg-white/85 p-4 shadow-sm dark:bg-gray-800/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Đang hoạt động</p>
            <p className="mt-1 text-2xl font-black text-emerald-600">{activeCount}</p>
          </div>
          <div className="rounded-2xl bg-white/85 p-4 shadow-sm dark:bg-gray-800/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Audio guide</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-black text-orange-600">
              <Radio size={20} /> {audioGuideCount}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
          leftIcon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-md"
        />
        <div className="rounded-2xl bg-gray-50 px-4 py-2 text-sm font-medium text-gray-600 dark:bg-gray-900/50 dark:text-gray-300">
          Hiển thị {filtered.length}/{shops.length} gian hàng
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
          <p className="font-medium">Đang tải dữ liệu gian hàng...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
          <Store size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Không tìm thấy gian hàng</p>
          {search && <p className="text-sm mt-1">Thử từ khoá khác</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              canUseQr={canUseQr}
              onEdit={() => navigate(`/shops/${shop.id}/edit`)}
              onDelete={() => setDeleteTarget(shop.id)}
              onToggle={() => void toggleShopActive(shop.id)
                .then(() => {
                  toast.success(`Gian hàng ${shop.isActive ? 'đã tạm dừng' : 'đang hoạt động'}`)
                })
                .catch(() => {
                  toast.error('Không thể cập nhật trạng thái gian hàng')
                })}
              onAnalytics={() => navigate(`/shops/${shop.id}/analytics`)}
              onQR={() => {
                if (!canUseQr) {
                  toast.error('Gói FREE không hỗ trợ QR Code. Vui lòng nâng cấp gói.')
                  navigate('/settings')
                  return
                }
                navigate(`/shops/${shop.id}/qr`)
              }}
            />
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/shops/new')}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-colors hover:bg-orange-600 lg:hidden"
        title="Thêm gian hàng"
      >
        <Plus size={24} />
      </button>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa gian hàng"
        message="Bạn có chắc chắn muốn xóa gian hàng này? Tất cả POI liên quan sẽ bị xóa và không thể khôi phục."
        confirmLabel="Xóa"
      />
    </div>
  )
}
