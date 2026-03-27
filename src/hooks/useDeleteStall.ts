import { useMutation, useQueryClient } from '@tanstack/react-query'
import { stallsService } from '@/services/stallsService'

export const useDeleteStall = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (stallId) => stallsService.deleteStall(stallId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['stalls'] })
    },
  })
}

