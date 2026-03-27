import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Clock, Search } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import { Badge, SkeletonCard } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDateTime } from '@/lib/utils'
import { useOwnerApprovals } from '@/hooks/useOwnerApprovals'
import type { OwnerApprovalItem } from '@/types'

const statusBadge = (status?: string) => {
  const s = (status ?? '').toUpperCase()
  if (s.includes('APPROVED')) return { variant: 'success' as const, label: status ?? 'APPROVED' }
  if (s.includes('REJECT')) return { variant: 'danger' as const, label: status ?? 'REJECTED' }
  if (s.includes('PENDING')) return { variant: 'warning' as const, label: status ?? 'PENDING' }
  return { variant: 'info' as const, label: status ?? 'UNKNOWN' }
}

export default function ApprovalsPage() {
  const navigate = useNavigate()
  const { data, isPending, isError, error, refetch } = useOwnerApprovals()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const list = data ?? []
    const query = q.trim().toLowerCase()
    if (!query) return list
    return list.filter((a) => {
      return (
        a.id.toLowerCase().includes(query) ||
        (a.targetType ?? '').toLowerCase().includes(query) ||
        (a.targetId ?? '').toLowerCase().includes(query) ||
        (a.status ?? '').toLowerCase().includes(query) ||
        (a.commentText ?? '').toLowerCase().includes(query)
      )
    })
  }, [data, q])

  if (isPending) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <SkeletonCard />
      </div>
    )
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Không thể tải approvals'
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Approvals</h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          <div className="flex gap-2">
            <Button onClick={() => void refetch()}>Thử lại</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Quay lại</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Approvals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{filtered.length} items</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Quay lại Dashboard</Button>
      </div>

      <Input
        placeholder="Tìm theo status/target/comment..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        leftIcon={<Search size={16} />}
      />

      {filtered.length === 0 ? (
        <Card className="p-6 text-sm text-gray-500 dark:text-gray-400">Không có approvals.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item: OwnerApprovalItem) => {
            const badge = statusBadge(item.status)
            return (
              <Card key={item.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {item.targetType ?? 'TARGET'} · {item.targetId ?? item.id}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {item.id}
                    </p>
                  </div>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>

                {item.commentText ? (
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {item.commentText}
                  </div>
                ) : null}

                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <Clock size={14} />
                  <span>{formatDateTime(item.createdAt)}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

