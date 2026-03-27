import { useMutation } from '@tanstack/react-query'
import { settingsService } from '@/services/settingsService'

export const useChangePassword = () => {
  return useMutation<void, Error, { currentPassword: string; newPassword: string }>({
    mutationFn: (payload) => settingsService.changePassword(payload),
  })
}

