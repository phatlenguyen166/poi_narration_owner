import { useQuery } from '@tanstack/react-query'
import { dashboardService, type OwnerDashboard } from '@/services/dashboardService'

export const useOwnerDashboard = () => {
  return useQuery<OwnerDashboard, Error>({
    queryKey: ['owner-dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 60 * 1000,
    retry: 1,
  })
}

