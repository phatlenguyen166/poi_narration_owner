import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'
import type { NarrationGuide, SaveDraftNarrationRequest } from '@/types'

export const useCreateStallAudioDraft = () => {
  const queryClient = useQueryClient()

  return useMutation<NarrationGuide, Error, { stallId: number; payload: SaveDraftNarrationRequest }>({
    mutationFn: ({ stallId, payload }) => stallsService.createStallAudioDraft(stallId, payload),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['stall-audio-guides', variables.stallId] })
    },
  })
}

