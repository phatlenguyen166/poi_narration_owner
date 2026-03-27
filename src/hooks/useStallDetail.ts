import { useQuery } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'
import type { StallDetailResponse } from '@/types'

export const useStallDetail = (stallId?: number) => {
  return useQuery<StallDetailResponse, Error>({
    queryKey: ['stall-detail', stallId],
    queryFn: () => stallsService.getStallDetail(stallId as number),
    enabled: typeof stallId === 'number' && Number.isFinite(stallId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

