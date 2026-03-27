import { useQuery } from '@tanstack/react-query'
import { settingsService } from '@/services/settingsService'
import type { OwnerSettings } from '@/types'

export const useOwnerSettings = () => {
  return useQuery<OwnerSettings, Error>({
    queryKey: ['owner-settings'],
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

