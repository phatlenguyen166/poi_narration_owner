import type { DailySeriesPoint } from './analytics'
import type { OwnerNotificationSettings } from './owner'

export interface AuthRequest {
  email: string
  password: string
}

export interface OwnerRegisterRequest extends AuthRequest {
  name: string
  businessName?: string
  phoneNumber?: string
}

export interface OwnerProfileDto {
  id: number | string
  name: string
  email: string
  phoneNumber?: string
  role?: string
  plan?: string | null
}

export interface OwnerSettingsDto {
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

export interface AuthTokensDto {
  accessToken: string
  refreshToken: string
  user: OwnerProfileDto
}

export interface LanguageDto {
  id: number | string
  code: string
  name: string
}

export interface StallDto {
  id: number | string
  name: string
  description?: string
  address?: string
  latitude?: number
  longitude?: number
  active?: boolean
  approvalStatus?: string
  createdAt?: string
  audioGuideCount?: number
}

export interface StallAudioGuideDto {
  id: number | string
  stallId: number | string
  languageCode: string
  languageName: string
  title: string
  scriptText: string
  audioUrl?: string
  audioDurationSeconds?: number
  active: boolean
  approvalStatus?: string
  createdAt?: string
}

export interface DashboardDto {
  stallCount?: number
  audioGuideCount?: number
  pendingApprovals?: number
  todayPlays?: number
  weekPlays?: number
  monthPlays?: number
  recentDailyPlays?: DailySeriesPoint[]
}

export interface AnalyticsDto {
  totalPlays?: number
  uniqueVisitors?: number
  uniqueLanguages?: number
  averageListenDurationSeconds?: number
  dailyPlays?: DailySeriesPoint[]
  languageBreakdown?: { languageCode?: string; languageName?: string; count: number }[]
  recentLogs?: { languageCode?: string; languageName?: string; listenDurationSeconds?: number; createdAt?: string }[]
}

export interface CreateStallRequest {
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  active: boolean
}

export interface GenerateNarrationRequest {
  title?: string
  sourceText: string
  sourceLanguageCode?: string
  targetLanguageCodes?: string[]
  active?: boolean
  approvalStatus?: string
}

export interface SaveDraftNarrationRequest {
  languageCode: string
  title: string
  scriptText: string
  active?: boolean
  approvalStatus?: string
}
