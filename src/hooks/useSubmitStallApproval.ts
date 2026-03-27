import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'

export const useSubmitStallApproval = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (stallId) => stallsService.submitStallApproval(stallId),
    onSuccess: (_, stallId) => {
      void queryClient.invalidateQueries({ queryKey: ['stall-detail', stallId] })
      void queryClient.invalidateQueries({ queryKey: ['stall-audio-guides', stallId] })
      void queryClient.invalidateQueries({ queryKey: ['stall-analytics', stallId] })
    },
  })
}

