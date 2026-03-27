import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'
import type { StallDetailResponse, StallUpdateRequest } from '@/types'

export const useUpdateStall = () => {
  const queryClient = useQueryClient()

  return useMutation<StallDetailResponse, Error, { stallId: number; payload: StallUpdateRequest }>({
    mutationFn: ({ stallId, payload }) => stallsService.updateStall(stallId, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['stalls'] })
      void queryClient.invalidateQueries({ queryKey: ['stall-detail', data.id] })
    },
  })
}

