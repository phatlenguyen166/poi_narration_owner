import { create } from 'zustand'

import { ownerApi } from '@/services/ownerApi'
import type {
  AnalyticsSummary,
  DailySeriesPoint,
  LanguageBreakdownItem,
  NarrationGuide,
  Notification,
  PlaybackLogItem,
  POI,
  QrCodePayload,
  Shop,
} from '@/types'

interface ShopAnalyticsState {
  summary: AnalyticsSummary
  dailyPlays: DailySeriesPoint[]
  languageBreakdown: LanguageBreakdownItem[]
  recentLogs: PlaybackLogItem[]
}

interface DashboardState {
  todayPlays: number
  weekPlays: number
  monthPlays: number
  activePoiCount: number
  recentDailyPlays: DailySeriesPoint[]
}

interface ShopState {
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

const initialDashboard = (): DashboardState => ({
  todayPlays: 0,
  weekPlays: 0,
  monthPlays: 0,
  activePoiCount: 0,
  recentDailyPlays: [],
})

export const useShopStore = create<ShopState>()((set, get) => ({
  shops: [],
  pois: [],
  guidesByStall: {},
  notifications: [],
  dashboard: initialDashboard(),
  analyticsByShop: {},
  qrCodes: {},
  isLoading: false,

  fetchShops: async () => {
    set({ isLoading: true })
    try {
      const { shops, guidesByStall } = await ownerApi.getStalls()
      set({ shops, pois: [], guidesByStall, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  fetchDashboard: async () => {
    const response = await ownerApi.getDashboard()
    set({
      dashboard: {
        ...response.summary,
        recentDailyPlays: response.recentDailyPlays,
      },
      notifications: response.notifications,
    })
  },

  addShop: (shop) => set((state) => ({ shops: [...state.shops, shop] })),

  updateShop: async (id, data) => {
    const existing = get().shops.find((shop) => shop.id === id)
    if (!existing) return
    const updated = await ownerApi.updateStall(id, {
      name: data.name ?? existing.name,
      isActive: data.isActive ?? existing.isActive,
      address: data.address ?? existing.address,
      latitude: data.latitude ?? existing.latitude ?? 0,
      longitude: data.longitude ?? existing.longitude ?? 0,
    })
    set((state) => ({ shops: state.shops.map((shop) => (shop.id === id ? { ...shop, ...updated } : shop)) }))
  },

  deleteShop: async (id) => {
    await ownerApi.deleteStall(id)
    set((state) => ({
      shops: state.shops.filter((shop) => shop.id !== id),
      pois: state.pois.filter((poi) => poi.shopId !== id),
    }))
  },

  toggleShopActive: async (id) => {
    const shop = get().shops.find((item) => item.id === id)
    if (!shop) return
    const updated = await ownerApi.updateStall(id, {
      name: shop.name,
      isActive: !shop.isActive,
      address: shop.address,
      latitude: shop.latitude ?? 0,
      longitude: shop.longitude ?? 0,
    })
    set((state) => ({
      shops: state.shops.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }))
  },

  addPOI: (poi) => set((state) => ({ pois: [...state.pois.filter((item) => item.id !== poi.id), poi] })),

  updatePOI: async (id, data) => {
    set((state) => ({
      pois: state.pois.map((poi) => (poi.id === id ? { ...poi, ...data } : poi)),
    }))
  },

  deletePOI: async (id) => {
    set((state) => ({
      pois: state.pois.filter((poi) => poi.id !== id),
      shops: state.shops.map((shop) => ({
        ...shop,
        poiCount: state.pois.filter((poi) => poi.shopId === shop.id && poi.id !== id).length,
      })),
    }))
  },

  getPOIsByShop: (shopId) => get().pois.filter((poi) => poi.shopId === shopId),

  upsertPoiForShop: (shopId, poi) =>
    set((state) => ({
      pois: [...state.pois.filter((item) => item.id !== poi.id), { ...poi, shopId }],
      shops: state.shops.map((shop) =>
        shop.id === shopId
          ? {
              ...shop,
              poiCount: state.pois.filter((item) => item.shopId === shopId && item.id !== poi.id).length + 1,
            }
          : shop,
      ),
    })),

  saveAnalytics: (shopId, analytics) =>
    set((state) => ({
      analyticsByShop: {
        ...state.analyticsByShop,
        [shopId]: analytics,
      },
    })),

  fetchAnalytics: async (shopId) => {
    const analytics = await ownerApi.getAnalytics(shopId)
    get().saveAnalytics(shopId, analytics)
    return analytics
  },

  fetchQrCode: async (shopId) => {
    const qrCode = await ownerApi.getQrCode(shopId)
    set((state) => ({
      qrCodes: {
        ...state.qrCodes,
        [shopId]: qrCode,
      },
    }))
    return qrCode
  },
}))
