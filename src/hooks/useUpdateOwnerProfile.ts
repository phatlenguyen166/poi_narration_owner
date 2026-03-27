import { useMutation, useQueryClient } from '@tanstack/react-query'
import { profileService } from '@/services/profileService'
import type { OwnerProfileResponse, OwnerProfileUpdateRequest } from '@/types'

export const useUpdateOwnerProfile = () => {
  const queryClient = useQueryClient()

  return useMutation<OwnerProfileResponse, Error, OwnerProfileUpdateRequest>({
    mutationFn: (payload) => profileService.updateProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['owner-profile'] })
    },
  })
}

