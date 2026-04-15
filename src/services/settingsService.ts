import { settingsApi } from '@/apis/settingsApi'
import type { Owner, OwnerNotificationSettings, OwnerPlan, OwnerSettings, OwnerSettingsDto } from '@/types'

const knownBrokenTextMap: Record<string, string> = {
  'N\uFFFDng c\uFFFDp ngay': 'Nâng cấp ngay',
  'Th\uFFFDng k\uFFFD nâng cao': 'Thống kê nâng cao',
  'Th\uFFFDng k\uFFFD n\uFFFDng cao': 'Thống kê nâng cao',
  'Liên hệ tư vấn': 'Nâng cấp ngay',
  'Li\uFFFDn h? t? v?n': 'Nâng cấp ngay',
  'G\uFFFDi hi?n t?i': 'Gói hiện tại',
  '0?/th\uFFFDng': '0đ/tháng',
  '199,000?/th\uFFFDng': '199,000đ/tháng',
  '/th\uFFFDng': '/tháng',
  '0?': '0đ',
  '199,000?': '199,000đ',
}

const fixMojibake = (value?: string | null): string => {
  const input = (value ?? '').toString()
  if (!input) return ''

  if (knownBrokenTextMap[input]) {
    return knownBrokenTextMap[input]
  }

  // Heuristic: common UTF-8-as-Latin1 artifacts for Vietnamese text/currency (e.g. "â‚«", "Ä‘", "Ã´").
  if (!/[ÃÂÄâ\uFFFD]/.test(input)) return input

  try {
    const bytes = new Uint8Array(input.length)
    for (let i = 0; i < input.length; i++) bytes[i] = input.charCodeAt(i) & 0xff
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
    if (knownBrokenTextMap[decoded]) {
      return knownBrokenTextMap[decoded]
    }
    return decoded || input
  } catch {
    return input
  }
}

const normalizePlan = (plan?: string | null): Owner['plan'] => {
  const value = (plan ?? '').trim().toLowerCase()
  if (!value) return undefined
  if (value === 'free' || value === 'pro' || value === 'enterprise') return value as Owner['plan']
  return undefined
}

const mapSettings = (settings: OwnerSettingsDto): OwnerSettings => ({
  notifications: settings.notifications,
  currentPlan: (normalizePlan(settings.currentPlan) ?? 'pro') as OwnerSettings['currentPlan'],
  renewalAt: settings.renewalAt,
  availablePlans: settings.availablePlans.map((plan): OwnerPlan => ({
    id: (normalizePlan(plan.id) ?? 'pro') as OwnerPlan['id'],
    name: fixMojibake(plan.name),
    price: fixMojibake(plan.price),
    period: fixMojibake(plan.period),
    current: plan.current,
    popular: plan.popular,
    ctaLabel: fixMojibake(plan.ctaLabel),
    renewalAt: plan.renewalAt,
    features: plan.features.map((f) => fixMojibake(f)),
  })),
})

export const settingsService = {
  async getSettings(): Promise<OwnerSettings> {
    const dto = await settingsApi.getSettings()
    return mapSettings(dto)
  },

  updateNotificationSettings(payload: OwnerNotificationSettings): Promise<OwnerNotificationSettings> {
    return settingsApi.updateNotificationSettings(payload)
  },

  async changeSubscription(planId: OwnerPlan['id']): Promise<OwnerSettings> {
    const dto = await settingsApi.changeSubscription(planId)
    return mapSettings(dto)
  },

  changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    return settingsApi.changePassword(payload)
  },
}
