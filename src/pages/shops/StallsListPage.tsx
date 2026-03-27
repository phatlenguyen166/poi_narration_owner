import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit, MapPin, Plus, Radio, Store, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { SkeletonCard } from '@/components/ui/Badge'
import { useDeleteStall } from '@/hooks/useDeleteStall'
import { useStallsList } from '@/hooks/useStallsList'
import type { StallDetailResponse } from '@/types'
import toast from 'react-hot-toast'

function StallRow({ stall, onView, onEdit, onDelete }: {
  stall: StallDetailResponse
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card className="p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-orange-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{stall.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <MapPin size={12} />
            <span className="truncate">{stall.address}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={stall.active ? 'success' : 'default'}>
            {stall.active ? '● Đang hoạt động' : '○ Tạm dừng'}
          </Badge>
          {stall.approvalStatus ? (
            <Badge variant="info">{stall.approvalStatus}</Badge>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Radio size={14} />
          <span>
            <span className="font-semibold">{stall.audioGuideCount}</span> audio guides
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onView}>
          Xem
        </Button>
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit size={14} /> Sửa
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={onDelete}
          className="ml-auto"
        >
          <Trash2 size={14} /> Xóa
        </Button>
      </div>
    </Card>
  )
}

export default function StallsListPage() {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useStallsList()

  const [search, setSearch] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const deleteMutation = useDeleteStall()

  const filtered = useMemo(() => {
    const list = data ?? []
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        String(s.id).includes(q),
    )
  }, [data, search])

  const onConfirmDelete = async () => {
    if (deleteTarget == null) return
    try {
      await deleteMutation.mutateAsync(deleteTarget)
      toast.success('Đã xóa gian hàng')
      setDeleteOpen(false)
      setDeleteTarget(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể xóa gian hàng')
    }
  }

  if (isPending) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <SkeletonCard />
      </div>
    )
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu gian hàng'
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="p-6 space-y-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Gian hàng</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void refetch()} loading={deleteMutation.isPending}>
              Thử lại
            </Button>
            <Button variant="outline" onClick={() => navigate('/shops')}>
              Quay lại
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gian hàng (Stalls)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filtered.length} gian hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/shops/stalls/new')}>
            <Plus size={16} /> Tạo mới
          </Button>
        </div>
      </div>

      <div className="mb-5 max-w-lg">
        <Input
          placeholder="Tìm theo tên, địa chỉ hoặc id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          <p className="font-medium">Không tìm thấy gian hàng</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((stall) => (
            <StallRow
              key={stall.id}
              stall={stall}
              onView={() => navigate(`/shops/stalls/${stall.id}`)}
              onEdit={() => navigate(`/shops/stalls/${stall.id}/edit`)}
              onDelete={() => {
                setDeleteTarget(stall.id)
                setDeleteOpen(true)
              }}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={onConfirmDelete}
        title="Xóa gian hàng"
        message="Bạn có chắc chắn muốn xóa gian hàng này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

