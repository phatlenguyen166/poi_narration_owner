import { useQuery } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'
import type { NarrationGuide } from '@/types'

export const useStallAudioGuides = (stallId?: number) => {
  return useQuery<NarrationGuide[], Error>({
    queryKey: ['stall-audio-guides', stallId],
    queryFn: () => stallsService.getStallAudioGuides(stallId as number),
    enabled: typeof stallId === 'number' && Number.isFinite(stallId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

