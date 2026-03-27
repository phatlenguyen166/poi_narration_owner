import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'
import type { StallCreateRequest, StallDetailResponse } from '@/types'

export const useCreateStall = () => {
  const queryClient = useQueryClient()

  return useMutation<StallDetailResponse, Error, StallCreateRequest>({
    mutationFn: (payload) => stallsService.createStall(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stalls'] })
    },
  })
}

