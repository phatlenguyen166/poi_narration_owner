import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Plus } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { StallForm } from '@/pages/shops/stalls/StallForm'
import { useCreateStall } from '@/hooks/useCreateStall'
import { SkeletonCard } from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import type { StallCreateRequest } from '@/types'

export default function StallCreatePage() {
  const navigate = useNavigate()
  const createMutation = useCreateStall()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const initialValues: StallCreateRequest = {
    name: '',
    description: '',
    address: '',
    latitude: 10.7769,
    longitude: 106.7009,
    active: true,
  }

  const onSubmit = async (values: StallCreateRequest) => {
    setSubmitError(null)
    try {
      const created = await createMutation.mutateAsync(values)
      toast.success('Đã tạo gian hàng')
      navigate(`/shops/stalls/${created.id}`)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Không thể tạo gian hàng')
    }
  }

  if (createMutation.isPending) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <SkeletonCard />
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
          <Plus size={18} /> Tạo gian hàng
        </h1>
      </div>

      <Card className="p-6 space-y-4">
        {submitError ? (
          <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
            {submitError}
          </div>
        ) : null}

        <StallForm
          initialValues={initialValues}
          onSubmit={onSubmit}
          isSubmitting={createMutation.isPending}
          submitLabel="Tạo"
        />
      </Card>
    </div>
  )
}

