import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Edit, Store } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { SkeletonCard } from '@/components/ui/Badge'
import { StallForm } from '@/pages/shops/stalls/StallForm'
import { useStallDetail } from '@/hooks/useStallDetail'
import { useUpdateStall } from '@/hooks/useUpdateStall'
import toast from 'react-hot-toast'
import type { StallCreateRequest } from '@/types'

function parseStallId(stallIdParam: string | undefined) {
  if (!stallIdParam) return undefined
  const n = Number(stallIdParam)
  return Number.isFinite(n) ? n : undefined
}

export default function StallEditPage() {
  const navigate = useNavigate()
  const { stallId: stallIdParam } = useParams()

  const stallId = useMemo(() => parseStallId(stallIdParam), [stallIdParam])
  const { data, isPending, isError, error } = useStallDetail(stallId)
  const updateMutation = useUpdateStall()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const initialValues: StallCreateRequest | null = data
    ? {
        name: data.name,
        description: data.description ?? '',
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        active: data.active,
      }
    : null

  const onSubmit = async (values: StallCreateRequest) => {
    if (!stallId) return
    setSubmitError(null)
    try {
      const updated = await updateMutation.mutateAsync({ stallId, payload: values })
      toast.success('Đã cập nhật gian hàng')
      navigate(`/shops/stalls/${updated.id}`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Không thể cập nhật gian hàng')
    }
  }

  if (isPending) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <SkeletonCard />
      </div>
    )
  }

  if (isError || !initialValues) {
    const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu gian hàng'
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-orange-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Sửa gian hàng</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/shops/stalls')}
              className="text-sm text-orange-600 hover:text-orange-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => navigate('/shops/stalls')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Edit size={18} /> Sửa gian hàng
        </h1>
      </div>

      <Card className="p-6 space-y-4">
        {submitError ? (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {submitError}
          </div>
        ) : null}

        <StallForm
          key={data?.id ?? 'stall'}
          initialValues={initialValues}
          onSubmit={onSubmit}
          isSubmitting={updateMutation.isPending}
          submitLabel="Cập nhật"
        />
      </Card>
    </div>
  )
}

