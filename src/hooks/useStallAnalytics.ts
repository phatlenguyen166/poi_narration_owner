import { useQuery } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'
import type { AnalyticsSummary } from '@/types'

export const useStallAnalytics = (stallId?: number) => {
  return useQuery<AnalyticsSummary, Error>({
    queryKey: ['stall-analytics', stallId],
    queryFn: () => stallsService.getStallAnalytics(stallId as number),
    enabled: typeof stallId === 'number' && Number.isFinite(stallId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

