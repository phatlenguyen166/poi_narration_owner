import { useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settingsService'
import type { OwnerPlan, OwnerSettings } from '@/types'

export const useChangeSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation<OwnerSettings, Error, OwnerPlan['id']>({
    mutationFn: (planId) => settingsService.changeSubscription(planId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ['owner-settings'] })
      void queryClient.setQueryData(['owner-settings'], data)
    },
  })
}

