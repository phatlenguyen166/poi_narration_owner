import { useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsService } from '@/services/settingsService'
import type { OwnerNotificationSettings } from '@/types'

export const useUpdateOwnerNotifications = () => {
  const queryClient = useQueryClient()

  return useMutation<OwnerNotificationSettings, Error, OwnerNotificationSettings>({
    mutationFn: (payload) => settingsService.updateNotificationSettings(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['owner-settings'] })
    },
  })
}

