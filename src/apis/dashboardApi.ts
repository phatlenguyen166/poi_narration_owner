import { axiosClient } from '@/lib/axiosClient'
import type { DashboardDto } from '@/types'

export const dashboardApi = {
  async getDashboard(): Promise<DashboardDto> {
    const { data } = await axiosClient.get<DashboardDto>('/api/v1/owner/dashboard')
    return data
  },
}

