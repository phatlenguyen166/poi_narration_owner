import type {
  AnalyticsSummary,
  DailySeriesPoint,
  LanguageBreakdownItem,
  MetadataCategory,
  MetadataLanguage,
  NarrationGuide,
  Notification,
  Owner,
  PlaybackLogItem,
  POI,
  QrCodePayload,
  Shop,
} from './index'

export interface RegisterPayload {
  name: string
  businessName?: string
  email: string
  password: string
  phoneNumber?: string
}

export interface AuthState {
  user: Owner | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean
  isBootstrapping: boolean
  login: (email: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  bootstrap: () => Promise<void>
  logout: () => void
  updateUser: (data: Partial<Owner>) => void
  refreshProfile: () => Promise<void>
}

export interface MetadataState {
  categories: MetadataCategory[]
  languages: MetadataLanguage[]
  isLoading: boolean
  loaded: boolean
  fetchMetadata: () => Promise<void>
  getCategoryLabel: (code?: string) => string
  getLanguage: (code?: string) => MetadataLanguage | undefined
}

export interface ShopAnalyticsState {
  summary: AnalyticsSummary
  dailyPlays: DailySeriesPoint[]
  languageBreakdown: LanguageBreakdownItem[]
  recentLogs: PlaybackLogItem[]
}

export interface DashboardState {
  todayPlays: number
  weekPlays: number
  monthPlays: number
  activePoiCount: number
  recentDailyPlays: DailySeriesPoint[]
}

export interface ShopState {
  shops: Shop[]
  pois: POI[]
  guidesByStall: Record<string, NarrationGuide[]>
  notifications: Notification[]
  dashboard: DashboardState
  analyticsByShop: Record<string, ShopAnalyticsState>
  qrCodes: Record<string, QrCodePayload>
  isLoading: boolean
  fetchShops: () => Promise<void>
  fetchDashboard: () => Promise<void>
  addShop: (shop: Shop) => void
  updateShop: (id: string, data: Partial<Shop>) => Promise<void>
  deleteShop: (id: string) => Promise<void>
  toggleShopActive: (id: string) => Promise<void>
  addPOI: (poi: POI) => void
  updatePOI: (id: string, data: Partial<POI>) => Promise<void>
  deletePOI: (id: string) => Promise<void>
  getPOIsByShop: (shopId: string) => POI[]
  upsertPoiForShop: (shopId: string, poi: POI) => void
  saveAnalytics: (shopId: string, analytics: ShopAnalyticsState) => void
  fetchAnalytics: (shopId: string) => Promise<ShopAnalyticsState>
  fetchQrCode: (shopId: string) => Promise<QrCodePayload>
}

export interface UIState {
  sidebarCollapsed: boolean
  darkMode: boolean
  toggleSidebar: () => void
  toggleDarkMode: () => void
  setSidebarCollapsed: (v: boolean) => void
}
