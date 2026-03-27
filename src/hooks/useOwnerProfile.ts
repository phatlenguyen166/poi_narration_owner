import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/services/profileService'
import type { OwnerProfileResponse } from '@/types'

export const useOwnerProfile = () => {
  return useQuery<OwnerProfileResponse, Error>({
    queryKey: ['owner-profile'],
    queryFn: () => profileService.getProfile(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

