import { axiosClient } from '@/lib/axiosClient'
import type { OwnerNotificationSettings, OwnerSettingsDto, OwnerPlan } from '@/types'

export const settingsApi = {
  async getSettings(): Promise<OwnerSettingsDto> {
    const { data } = await axiosClient.get<OwnerSettingsDto>('/api/v1/owner/settings')
    return data
  },

  async updateNotificationSettings(payload: OwnerNotificationSettings): Promise<OwnerNotificationSettings> {
    const { data } = await axiosClient.put<OwnerNotificationSettings>('/api/v1/owner/settings/notifications', payload)
    return data
  },

  async changeSubscription(planId: OwnerPlan['id']): Promise<OwnerSettingsDto> {
    const { data } = await axiosClient.post<OwnerSettingsDto>('/api/v1/owner/settings/subscription', { planId })
    return data
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    await axiosClient.post<void>('/api/v1/owner/change-password', payload)
  },
}

