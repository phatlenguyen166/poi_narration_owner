import { useQuery } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'
import type { StallDetailResponse } from '@/types'

export const useStallsList = () => {
  return useQuery<StallDetailResponse[], Error>({
    queryKey: ['stalls'],
    queryFn: () => stallsService.getStalls(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

