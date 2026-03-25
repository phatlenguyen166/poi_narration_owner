import { authApi } from '@/apis/authApi'
import type {
  AuthRequest,
  Owner,
  OwnerNotificationSettings,
  OwnerPlan,
  OwnerProfileDto,
  OwnerRegisterRequest,
  OwnerSettings,
  OwnerSettingsDto,
  SessionPayload,
} from '@/types'

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

const mapOwner = (owner: OwnerProfileDto): Owner => ({
  id: String(owner.id),
  name: owner.name,
  email: owner.email,
  phoneNumber: owner.phoneNumber,
  plan: normalizePlan(owner.plan),
})

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

export const authService = {
  async login(payload: AuthRequest) {
    const session = await authApi.login(payload)
    return { ...session, user: mapOwner(session.user) } satisfies SessionPayload
  },

  async register(payload: OwnerRegisterRequest) {
    const session = await authApi.register(payload)
    return { ...session, user: mapOwner(session.user) } satisfies SessionPayload
  },

  refresh(refreshToken: string) {
    return authApi.refresh(refreshToken)
  },

  async me() {
    const owner = await authApi.me()
    return mapOwner(owner)
  },

  async updateProfile(payload: { name: string; email: string; phoneNumber?: string }) {
    const owner = await authApi.updateProfile(payload)
    return mapOwner(owner)
  },

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return authApi.changePassword(payload)
  },

  async getSettings() {
    const settings = await authApi.getSettings()
    return mapSettings(settings)
  },

  updateNotificationSettings(payload: OwnerNotificationSettings) {
    return authApi.updateNotificationSettings(payload)
  },

  async changeSubscription(planId: OwnerPlan['id']) {
    const settings = await authApi.changeSubscription(planId)
    return mapSettings(settings)
  },
}
