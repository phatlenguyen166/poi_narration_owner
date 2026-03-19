export interface Shop {
  id: string
  ownerId: string
  name: string
  description: string
  category: string
  thumbnail: string
  isActive: boolean
  approvalStatus?: string
  qrResolvedUrl?: string
  address: string
  latitude?: number
  longitude?: number
  poiCount: number
  createdAt: string
}

export interface POI {
  id: string
  shopId: string
  name: string
  lat: number
  lng: number
  radius: number
  priority: 1 | 2 | 3 | 4 | 5
  isActive: boolean
  approvalStatus?: string
  contents: POIContent[]
  createdAt: string
}

export interface POIContent {
  id: string
  poiId: string
  language: string
  script: string
  audioUrl?: string
  audioFile?: File
  audioAssetId?: string
  status: 'draft' | 'published'
}

export interface PlayLog {
  id: string
  poiId: string
  language: string
  duration: number
  playedAt: string
}

export interface Owner {
  id: string
  name: string
  email: string
  phoneNumber?: string
  avatar?: string
  plan?: 'free' | 'pro' | 'enterprise'
}

export interface OwnerNotificationSettings {
  emailPlays: boolean
  emailWeekly: boolean
  pushNew: boolean
  pushMilestone: boolean
}

export interface OwnerPlan {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: string
  period: string
  current: boolean
  popular: boolean
  ctaLabel: string
  renewalAt?: string
  features: string[]
}

export interface OwnerSettings {
  notifications: OwnerNotificationSettings
  currentPlan: 'free' | 'pro' | 'enterprise'
  renewalAt?: string
  availablePlans: OwnerPlan[]
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success'
  message: string
  createdAt: string
  read: boolean
}

export interface DailyStats {
  date: string
  plays: number
}

export interface HourlyHeatmap {
  day: number
  hour: number
  plays: number
}

export interface SessionPayload {
  user: Owner
  accessToken: string
  refreshToken: string
}

export interface UploadedAsset {
  id: string
  url: string
  fileName?: string
}

export interface DashboardSummary {
  stallCount?: number
  todayPlays: number
  weekPlays: number
  monthPlays: number
  activePoiCount: number
  pendingApprovals?: number
  totalPlays?: number
}

export interface DailySeriesPoint {
  date: string
  plays: number
}

export interface LanguageBreakdownItem {
  name: string
  count: number
}

export interface PlaybackLogItem {
  id: string
  poiId: string
  poiName?: string
  language: string
  duration: number
  playedAt: string
}

export interface AnalyticsSummary {
  totalPlays: number
  averageDurationSeconds: number
  uniqueVisitors: number
  uniqueLanguages?: number
}

export interface QrCodePayload {
  code?: string
  targetType?: string
  targetId?: string
  resolvedUrl: string
}

export interface MetadataCategory {
  value: string
  label: string
}

export interface MetadataLanguage {
  id: string
  code: string
  name: string
  flag: string
}
