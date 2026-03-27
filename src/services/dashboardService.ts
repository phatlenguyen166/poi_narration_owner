import { dashboardApi } from '@/apis/dashboardApi'
import type { DailySeriesPoint, DashboardSummary, Notification } from '@/types'

export type OwnerDashboard = {
  summary: DashboardSummary
  notifications: Notification[]
  recentDailyPlays: DailySeriesPoint[]
}

export const dashboardService = {
  async getDashboard(): Promise<OwnerDashboard> {
    const response = await dashboardApi.getDashboard()
    return {
      summary: {
        stallCount: response.stallCount ?? 0,
        todayPlays: response.todayPlays ?? 0,
        weekPlays: response.weekPlays ?? 0,
        monthPlays: response.monthPlays ?? 0,
        activePoiCount: response.audioGuideCount ?? 0,
        pendingApprovals: response.pendingApprovals ?? 0,
        totalPlays: response.monthPlays ?? 0,
      },
      notifications:
        (response.pendingApprovals ?? 0) > 0
          ? [
              {
                id: 'pending-approvals',
                type: 'warning' as const,
                message: `Bạn có ${response.pendingApprovals} địa điểm đang chờ duyệt`,
                createdAt: new Date().toISOString(),
                read: false,
              },
            ]
          : [],
      recentDailyPlays: response.recentDailyPlays ?? ([] as DailySeriesPoint[]),
    }
  },
}

