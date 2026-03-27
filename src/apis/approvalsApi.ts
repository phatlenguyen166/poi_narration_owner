import { axiosClient } from '@/lib/axiosClient'
import type { OwnerApprovalItem } from '@/types'

type ApprovalDto = {
  id: number | string
  targetType?: string
  targetId?: number | string
  status?: string
  commentText?: string
  createdAt?: string
}

const mapApproval = (dto: ApprovalDto): OwnerApprovalItem => ({
  id: String(dto.id),
  targetType: dto.targetType,
  targetId: dto.targetId != null ? String(dto.targetId) : undefined,
  status: dto.status,
  commentText: dto.commentText,
  createdAt: dto.createdAt ?? new Date().toISOString(),
})

export const approvalsApi = {
  async getApprovals(): Promise<OwnerApprovalItem[]> {
    const { data } = await axiosClient.get<ApprovalDto[]>('/api/v1/owner/approvals')
    return (data ?? []).map(mapApproval)
  },
}

