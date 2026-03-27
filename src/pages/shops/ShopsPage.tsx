import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MapPin, Edit, BarChart2, Trash2, QrCode, Store, Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { useShopStore } from '@/stores/shopStore'
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

function ShopCard({ shop, onEdit, onDelete, onToggle, onAnalytics, onQR }: {
  shop: Shop
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onAnalytics: () => void
  onQR: () => void
}) {
  const approvalBadge = getApprovalBadge(shop.approvalStatus)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md dark:hover:shadow-none transition-shadow">
      <div className="relative">
        <img
          src={shop.thumbnail}
          alt={shop.name}
          className="w-full h-44 object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={shop.isActive ? 'success' : 'default'}>
            {shop.isActive ? '● Đang hoạt động' : '○ Tạm dừng'}
          </Badge>
        </div>
        <div className="absolute top-3 left-3">
          <Badge variant="info">Địa điểm</Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{shop.name}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={approvalBadge.variant}>{approvalBadge.label}</Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400">{shop.audioGuideCount} audio guide</span>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <MapPin size={12} />
          <span className="truncate">{shop.address}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {shop.approvalStatus === 'REJECTED' ? 'Cần chỉnh sửa để gửi duyệt lại' : 'Có thể cập nhật bất cứ lúc nào'}
          </span>
          <Toggle checked={shop.isActive} onChange={onToggle} />
        </div>

        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit size={13} /> Sửa
          </Button>
          <Button variant="outline" size="sm" className="flex-1" onClick={onAnalytics}>
            <BarChart2 size={13} /> Thống kê
          </Button>
          <Button variant="ghost" size="sm" onClick={onQR} title="QR Code">
            <QrCode size={14} />
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={onDelete}>
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function ShopsPage() {
  const { shops, fetchShops, deleteShop, toggleShopActive, isLoading } = useShopStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gian hàng</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {shops.length} gian hàng · {shops.filter((s) => s.isActive).length} đang hoạt động
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/shops/map')}>
            <MapIcon size={16} /> Xem bản đồ
          </Button>
          <Button onClick={() => navigate('/shops/new')}>
            <Plus size={16} /> Thêm gian hàng
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <Input
          placeholder="Tìm kiếm gian hàng..."
          leftIcon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="font-medium">Đang tải dữ liệu gian hàng...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <Store size={48} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Không tìm thấy gian hàng</p>
          {search && <p className="text-sm mt-1">Thử từ khoá khác</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((shop) => (
            <ShopCard
              key={shop.id}
              shop={shop}
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
              onQR={() => navigate(`/shops/${shop.id}/qr`)}
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
