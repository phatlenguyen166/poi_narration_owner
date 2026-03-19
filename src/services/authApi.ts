import { apiClient } from '@/lib/api-client'
import type { Owner, OwnerNotificationSettings, OwnerPlan, OwnerSettings, SessionPayload } from '@/types'

interface AuthRequest {
  email: string
  password: string
}

interface OwnerRegisterRequest extends AuthRequest {
  name: string
  phoneNumber?: string
}

interface OwnerProfileDto {
  id: number | string
  name: string
  email: string
  phoneNumber?: string
  role?: string
  plan?: string | null
}

interface OwnerSettingsDto {
  notifications: OwnerNotificationSettings
  currentPlan: string
  renewalAt?: string
  availablePlans: Array<{
    id: string
    name: string
    price: string
    period: string
    current: boolean
    popular: boolean
    ctaLabel: string
    renewalAt?: string
    features: string[]
  }>
}

interface AuthTokensDto {
  accessToken: string
  refreshToken: string
  user: OwnerProfileDto
}

const mapOwner = (owner: OwnerProfileDto): Owner => ({
  id: String(owner.id),
  name: owner.name,
  email: owner.email,
  phoneNumber: owner.phoneNumber,
  plan: normalizePlan(owner.plan),
})

const normalizePlan = (plan?: string | null): Owner['plan'] => {
  switch ((plan ?? '').trim().toLowerCase()) {
    case 'free':
    case 'pro':
    case 'enterprise':
      return plan?.trim().toLowerCase() as Owner['plan']
    default:
      return 'pro'
  }
}

const mapSettings = (settings: OwnerSettingsDto): OwnerSettings => ({
  notifications: settings.notifications,
  currentPlan: normalizePlan(settings.currentPlan) ?? 'pro',
  renewalAt: settings.renewalAt,
  availablePlans: settings.availablePlans.map((plan): OwnerPlan => ({
    id: normalizePlan(plan.id) ?? 'pro',
    name: plan.name,
    price: plan.price,
    period: plan.period,
    current: plan.current,
    popular: plan.popular,
    ctaLabel: plan.ctaLabel,
    renewalAt: plan.renewalAt,
    features: plan.features,
  })),
})

export const authApi = {
  async login(payload: AuthRequest) {
    const session = await apiClient.request<AuthTokensDto>('/api/v1/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    })
    return { ...session, user: mapOwner(session.user) } satisfies SessionPayload
  },
  async register(payload: OwnerRegisterRequest) {
    const session = await apiClient.request<AuthTokensDto>('/api/v1/auth/owner/register', {
      method: 'POST',
      body: payload,
      auth: false,
    })
    return { ...session, user: mapOwner(session.user) } satisfies SessionPayload
  },
  refresh(refreshToken: string) {
    return apiClient.request<Pick<SessionPayload, 'accessToken' | 'refreshToken'>>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    })
  },
  async me() {
    const owner = await apiClient.request<OwnerProfileDto>('/api/v1/auth/me')
    return mapOwner(owner)
  },
  async updateProfile(payload: { name: string; email: string; phoneNumber?: string }) {
    const owner = await apiClient.request<OwnerProfileDto>('/api/v1/owner/profile', {
      method: 'PUT',
      body: payload,
    })
    return mapOwner(owner)
  },
  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return apiClient.request<void>('/api/v1/owner/change-password', {
      method: 'POST',
      body: payload,
    })
  },
  async getSettings() {
    const settings = await apiClient.request<OwnerSettingsDto>('/api/v1/owner/settings')
    return mapSettings(settings)
  },
  updateNotificationSettings(payload: OwnerNotificationSettings) {
    return apiClient.request<OwnerNotificationSettings>('/api/v1/owner/settings/notifications', {
      method: 'PUT',
      body: payload,
    })
  },
  async changeSubscription(planId: OwnerPlan['id']) {
    const settings = await apiClient.request<OwnerSettingsDto>('/api/v1/owner/settings/subscription', {
      method: 'POST',
      body: { planId },
    })
    return mapSettings(settings)
  },
}
