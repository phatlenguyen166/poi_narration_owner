import { approvalsApi } from '@/apis/approvalsApi'
import type { OwnerApprovalItem } from '@/types'

export const approvalsService = {
  getApprovals(): Promise<OwnerApprovalItem[]> {
    return approvalsApi.getApprovals()
  },
}

