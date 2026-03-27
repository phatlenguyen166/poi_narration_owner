import { useQuery } from '@tanstack/react-query'
import { approvalsService } from '@/services/approvalsService'
import type { OwnerApprovalItem } from '@/types'

export const useOwnerApprovals = () => {
  return useQuery<OwnerApprovalItem[], Error>({
    queryKey: ['owner-approvals'],
    queryFn: () => approvalsService.getApprovals(),
    staleTime: 60 * 1000,
    retry: 1,
  })
}

