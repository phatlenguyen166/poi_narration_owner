import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Globe, MapPin, Mic, Play, Radio, Store, Users } from 'lucide-react'
import toast from 'react-hot-toast'

import { Badge, SkeletonCard, Toggle } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, StatCard } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/Dialog'
import { Input, Textarea } from '@/components/ui/Input'
import { useStallDetail } from '@/hooks/useStallDetail'
import { useStallAudioGuides } from '@/hooks/useStallAudioGuides'
import { useCreateStallAudioDraft } from '@/hooks/useCreateStallAudioDraft'
import { useSubmitStallApproval } from '@/hooks/useSubmitStallApproval'
import { useStallAnalytics } from '@/hooks/useStallAnalytics'
import { useDeleteStall } from '@/hooks/useDeleteStall'
import { formatDateTime, formatDuration, formatNumber } from '@/lib/utils'
import type { SaveDraftNarrationRequest } from '@/types'

function parseStallId(stallIdParam: string | undefined) {
  if (!stallIdParam) return undefined
  const n = Number(stallIdParam)
  return Number.isFinite(n) ? n : undefined
}

export default function StallDetailPage() {
  const navigate = useNavigate()
  const { stallId: stallIdParam } = useParams()

  const stallId = useMemo(() => parseStallId(stallIdParam), [stallIdParam])
  const { data, isPending, isError, error, refetch } = useStallDetail(stallId)
  const deleteMutation = useDeleteStall()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data: audioGuides, isPending: audioGuidesPending, isError: audioGuidesError, error: audioGuidesErrorObj } =
    useStallAudioGuides(stallId)
  const createDraftMutation = useCreateStallAudioDraft()
  const submitApprovalMutation = useSubmitStallApproval()
  const { data: analytics, isPending: analyticsPending, isError: analyticsError, error: analyticsErrorObj } =
    useStallAnalytics(stallId)

  const [languageCode, setLanguageCode] = useState('vi')
  const [draftTitle, setDraftTitle] = useState('')
  const [draftScriptText, setDraftScriptText] = useState('')
  const [draftActive, setDraftActive] = useState(true)

  useEffect(() => {
    if (!data?.name) return
    if (draftTitle.trim()) return
    setDraftTitle(`Thuyết minh ${data.name}`)
  }, [data?.name, draftTitle])

  const onDelete = async () => {
    if (!data) return
    try {
      await deleteMutation.mutateAsync(data.id)
      toast.success('Đã xóa gian hàng')
      navigate('/shops/stalls')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể xóa gian hàng')
    } finally {
      setDeleteOpen(false)
    }
  }

  const onCreateDraft = async () => {
    if (!stallId) return
    if (!draftScriptText.trim()) return

    const payload: SaveDraftNarrationRequest = {
      languageCode,
      title: draftTitle.trim() || `Thuyết minh ${data?.name ?? ''}`,
      scriptText: draftScriptText.trim(),
      active: draftActive,
      approvalStatus: 'PENDING',
    }

    try {
      await createDraftMutation.mutateAsync({ stallId, payload })
      toast.success('Đã lưu bản nháp thuyết minh')
      setDraftScriptText('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể lưu bản nháp')
    }
  }

  const onSubmitApproval = async () => {
    if (!stallId) return
    try {
      await submitApprovalMutation.mutateAsync(stallId)
      toast.success('Đã gửi duyệt')
      void refetch()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể gửi duyệt')
    }
  }

  const approvalBadge = useMemo(() => {
    if (!data) return { variant: 'default' as const, label: '' }
    const status = data.approvalStatus.toUpperCase()
    if (status === 'APPROVED') return { variant: 'success' as const, label: 'Đã duyệt' }
    if (status === 'REJECTED') return { variant: 'danger' as const, label: 'Từ chối' }
    if (status === 'PENDING') return { variant: 'warning' as const, label: 'Đang chờ' }
    return { variant: 'info' as const, label: data.approvalStatus }
  }, [data])

  if (isPending) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <SkeletonCard />
      </div>
    )
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu gian hàng'
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Store size={18} className="text-orange-500" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Chi tiết gian hàng</h1>
            </div>
            <Badge variant="danger">Lỗi</Badge>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void refetch()} loading={isPending}>
              Thử lại
            </Button>
            <Button variant="outline" onClick={() => navigate('/shops/stalls')}>
              Quay lại
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <Card className="p-6 space-y-4">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Không tìm thấy gian hàng</h1>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate('/shops/stalls')}>
              Quay lại
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => navigate('/shops/stalls')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Gian hàng
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">{data.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Store size={20} className="text-orange-500" />
            {data.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={data.active ? 'success' : 'default'}>{data.active ? 'Đang hoạt động' : 'Tạm dừng'}</Badge>
          <Badge variant={approvalBadge.variant}>{approvalBadge.label || data.approvalStatus}</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={16} /> Thông tin cơ bản
            </h2>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Địa chỉ</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{data.address}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tọa độ</p>
              <p className="font-mono text-sm text-gray-700 dark:text-gray-300">
                {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Tạo lúc</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{formatDateTime(data.createdAt)}</p>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <StatCard
            label="Audio guides"
            value={formatNumber(data.audioGuideCount)}
            icon={<Radio size={18} className="text-orange-600 dark:text-orange-400" />}
            trend={`${data.approvalStatus}`}
            trendUp
            color="amber"
          />

          <Card className="p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Hành động</h2>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => navigate(`/shops/stalls/${data.id}/edit`)}>
                Sửa
              </Button>
              <Button
                variant="danger"
                onClick={() => setDeleteOpen(true)}
              >
                Xóa
              </Button>
              <Button
                variant="secondary"
                onClick={() => void onSubmitApproval()}
                loading={submitApprovalMutation.isPending}
                disabled={(data.approvalStatus ?? '').toUpperCase() === 'APPROVED'}
              >
                <Play size={14} /> Gửi duyệt
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mic size={16} /> Audio guides
            </h2>

            {audioGuidesPending ? (
              <SkeletonCard />
            ) : audioGuidesError ? (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                {audioGuidesErrorObj instanceof Error ? audioGuidesErrorObj.message : 'Không thể tải audio guides'}
              </div>
            ) : (
              <div className="space-y-3">
                {(audioGuides?.length ?? 0) === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chưa có bản nháp/thuyết minh cho gian hàng này.</p>
                ) : (
                  audioGuides!.map((g) => (
                    <div key={g.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{g.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {g.languageName} ({g.languageCode})
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={g.active ? 'success' : 'default'}>
                            {g.active ? 'Đang bật' : 'Tắt'}
                          </Badge>
                          {g.approvalStatus ? <Badge variant="info">{g.approvalStatus}</Badge> : null}
                        </div>
                      </div>

                      {g.audioUrl ? (
                        <div className="mt-3">
                          <audio controls src={g.audioUrl} className="w-full h-8" />
                        </div>
                      ) : null}

                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Tạo lúc {formatDateTime(g.createdAt)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Create draft */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <Mic size={14} /> Tạo bản nháp
              </h3>

              <div className="grid md:grid-cols-3 gap-3">
                <Input label="Language code" value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} />
                <Input label="Title" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
                <div className="flex items-end">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      if (!draftTitle.trim() && data?.name) setDraftTitle(`Thuyết minh ${data.name}`)
                    }}
                  >
                    Gợi ý title
                  </Button>
                </div>
              </div>

              <Textarea
                label="Script"
                placeholder="Nhập nội dung thuyết minh..."
                rows={6}
                value={draftScriptText}
                onChange={(e) => setDraftScriptText(e.target.value)}
              />

              <Toggle checked={draftActive} onChange={setDraftActive} label="Kích hoạt audio guide" />

              <div className="flex justify-end">
                <Button
                  onClick={() => void onCreateDraft()}
                  loading={createDraftMutation.isPending}
                  disabled={!draftScriptText.trim()}
                >
                  Lưu bản nháp
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={16} /> Analytics
            </h2>

            {analyticsPending ? (
              <SkeletonCard />
            ) : analyticsError ? (
              <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                {analyticsErrorObj instanceof Error ? analyticsErrorObj.message : 'Không thể tải analytics'}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                <StatCard
                  label="Tổng lượt nghe"
                  value={formatNumber(analytics?.totalPlays ?? 0)}
                  icon={<Play size={18} className="text-orange-600 dark:text-orange-400" />}
                  color="orange"
                />
                <StatCard
                  label="Thời lượng trung bình"
                  value={formatDuration(analytics?.averageDurationSeconds ?? 0)}
                  icon={<Clock size={18} className="text-indigo-600 dark:text-indigo-400" />}
                  color="indigo"
                />
                <StatCard
                  label="Lượt truy cập duy nhất"
                  value={formatNumber(analytics?.uniqueVisitors ?? 0)}
                  icon={<Users size={18} className="text-emerald-600 dark:text-emerald-400" />}
                  color="emerald"
                />
                <StatCard
                  label="Ngôn ngữ duy nhất"
                  value={formatNumber(analytics?.uniqueLanguages ?? 0)}
                  icon={<Globe size={18} className="text-amber-600 dark:text-amber-400" />}
                  color="amber"
                />
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => void onDelete()}
        title="Xóa gian hàng"
        message="Bạn có chắc chắn muốn xóa gian hàng này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}

