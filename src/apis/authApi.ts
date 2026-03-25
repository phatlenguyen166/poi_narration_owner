import { apiClient } from '@/lib/api-client'
import type { AuthRequest, AuthTokensDto, OwnerNotificationSettings, OwnerProfileDto, OwnerRegisterRequest, OwnerSettingsDto, SessionPayload } from '@/types'

export const authApi = {
  login(payload: AuthRequest) {
    return apiClient.request<AuthTokensDto>('/api/v1/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    })
  },
  register(payload: OwnerRegisterRequest) {
    return apiClient.request<AuthTokensDto>('/api/v1/auth/owner/register', {
      method: 'POST',
      body: payload,
      auth: false,
    })
  },
  refresh(refreshToken: string) {
    return apiClient.request<Pick<SessionPayload, 'accessToken' | 'refreshToken'>>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    })
  },
  me() {
    return apiClient.request<OwnerProfileDto>('/api/v1/auth/me')
  },
  updateProfile(payload: { name: string; email: string; phoneNumber?: string }) {
    return apiClient.request<OwnerProfileDto>('/api/v1/owner/profile', {
      method: 'PUT',
      body: payload,
    })
  },
  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return apiClient.request<void>('/api/v1/owner/change-password', {
      method: 'POST',
      body: payload,
    })
  },
  getSettings() {
    return apiClient.request<OwnerSettingsDto>('/api/v1/owner/settings')
  },
  updateNotificationSettings(payload: OwnerNotificationSettings) {
    return apiClient.request<OwnerNotificationSettings>('/api/v1/owner/settings/notifications', {
      method: 'PUT',
      body: payload,
    })
  },
  changeSubscription(planId: string) {
    return apiClient.request<OwnerSettingsDto>('/api/v1/owner/settings/subscription', {
      method: 'POST',
      body: { planId },
    })
  },
}
