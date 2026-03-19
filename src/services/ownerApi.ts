import { apiClient } from '@/lib/api-client'
import type {
  DailySeriesPoint,
  POI,
  POIContent,
  QrCodePayload,
  Shop,
  UploadedAsset,
} from '@/types'

interface StallDto {
  id: number | string
  ownerId?: number | string
  name: string
  description?: string
  category?: string
  thumbnailUrl?: string
  thumbnail?: string
  active?: boolean
  isActive?: boolean
  address?: string
  latitude?: number
  longitude?: number
  poiCount?: number
  createdAt?: string
  approvalStatus?: string
  status?: string
  pois?: PoiDto[]
}

interface PoiDto {
  id: number | string
  stallId?: number | string
  shopId?: number | string
  name: string
  latitude?: number
  longitude?: number
  lat?: number
  lng?: number
  radiusMeters?: number
  radius?: number
  priority?: number
  active?: boolean
  isActive?: boolean
  approvalStatus?: string
  status?: string
  createdAt?: string
  contents?: PoiContentDto[]
}

interface PoiContentDto {
  id: number | string
  languageCode?: string
  language?: string
  scriptText?: string
  script?: string
  audioAssetUrl?: string
  audioUrl?: string
  audioAssetId?: number | string
  status?: string
  contentStatus?: string
}

interface DashboardDto {
  stallCount?: number
  poiCount?: number
  pendingApprovals?: number
  todayPlays?: number
  weekPlays?: number
  monthPlays?: number
  notifications?: { id: string; type: 'info' | 'warning' | 'success'; message: string; createdAt: string; read: boolean }[]
  recentDailyPlays?: DailySeriesPoint[]
}

interface AnalyticsDto {
  totalPlays?: number
  uniqueVisitors?: number
  uniqueLanguages?: number
  averageListenDurationSeconds?: number
  dailyPlays?: DailySeriesPoint[]
  languageBreakdown?: { languageCode?: string; languageName?: string; count: number }[]
  recentLogs?: { poiId?: string; poiName?: string; languageCode?: string; languageName?: string; listenDurationSeconds?: number; playedAt: string }[]
}

const normalizeStatus = (value?: string) => value?.toLowerCase() === 'approved' ? 'published' : 'draft'

const mapContent = (dto: PoiContentDto): POIContent => ({
  id: String(dto.id),
  poiId: '',
  language: dto.languageCode ?? dto.language ?? 'vi',
  script: dto.scriptText ?? dto.script ?? '',
  audioUrl: dto.audioAssetUrl ?? dto.audioUrl,
  audioAssetId: dto.audioAssetId ? String(dto.audioAssetId) : undefined,
  status: normalizeStatus(dto.contentStatus ?? dto.status),
})

const mapPoi = (dto: PoiDto): POI => ({
  id: String(dto.id),
  shopId: String(dto.stallId ?? dto.shopId ?? ''),
  name: dto.name,
  lat: dto.latitude ?? dto.lat ?? 0,
  lng: dto.longitude ?? dto.lng ?? 0,
  radius: dto.radiusMeters ?? dto.radius ?? 50,
  priority: ((dto.priority ?? 1) as 1 | 2 | 3 | 4 | 5),
  isActive: dto.active ?? dto.isActive ?? true,
  approvalStatus: dto.approvalStatus ?? dto.status,
  contents: (dto.contents ?? []).map((content) => ({ ...mapContent(content), poiId: String(dto.id) })),
  createdAt: dto.createdAt ?? new Date().toISOString(),
})

const mapShop = (dto: StallDto): Shop => {
  const pois = (dto.pois ?? []).map(mapPoi)
  return {
    id: String(dto.id),
    ownerId: String(dto.ownerId ?? ''),
    name: dto.name,
    description: dto.description ?? '',
    category: dto.category ?? 'other',
    thumbnail: dto.thumbnailUrl ?? dto.thumbnail ?? 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=250&fit=crop',
    isActive: dto.active ?? dto.isActive ?? true,
    approvalStatus: dto.approvalStatus ?? dto.status,
    address: dto.address ?? '',
    latitude: dto.latitude,
    longitude: dto.longitude,
    poiCount: dto.poiCount ?? pois.length,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    qrResolvedUrl: undefined,
  }
}

const buildNotifications = (dashboard: DashboardDto): DashboardDto['notifications'] => {
  const notifications: NonNullable<DashboardDto['notifications']> = []
  if ((dashboard.pendingApprovals ?? 0) > 0) {
    notifications.push({
      id: 'pending-approvals',
      type: 'warning',
      message: `Ban co ${dashboard.pendingApprovals} muc dang cho duyet`,
      createdAt: new Date().toISOString(),
      read: false,
    })
  }
  return notifications
}

export interface CreateStallPayload {
  name: string
  description: string
  category: string
  thumbnailUrl?: string
  isActive: boolean
  address: string
  latitude: number
  longitude: number
}

export interface CreatePoiPayload {
  name: string
  latitude: number
  longitude: number
  radiusMeters: number
  priority: number
  active: boolean
}

export interface SaveContentPayload {
  languageCode: string
  scriptText: string
  audioAssetId?: string
  contentStatus?: 'READY' | 'DRAFT'
}

export const ownerApi = {
  async getDashboard() {
    const response = await apiClient.request<DashboardDto>('/api/v1/owner/dashboard')
    return {
      summary: {
        stallCount: response.stallCount ?? 0,
        todayPlays: response.todayPlays ?? 0,
        weekPlays: response.weekPlays ?? 0,
        monthPlays: response.monthPlays ?? 0,
        activePoiCount: response.poiCount ?? 0,
        pendingApprovals: response.pendingApprovals ?? 0,
        totalPlays: response.monthPlays ?? 0,
      },
      notifications: response.notifications ?? buildNotifications(response),
      recentDailyPlays: response.recentDailyPlays ?? [],
    }
  },
  async getStalls() {
    const response = await apiClient.request<StallDto[]>('/api/v1/owner/stalls')
    const shops = response.map(mapShop)
    const pois = response.flatMap((stall) =>
      (stall.pois ?? []).map((poi) => ({ ...mapPoi(poi), shopId: String(stall.id) })),
    )
    return { shops, pois }
  },
  async createStall(payload: CreateStallPayload) {
    const response = await apiClient.request<StallDto>('/api/v1/owner/stalls', {
      method: 'POST',
      body: {
        ...payload,
        active: payload.isActive,
      },
    })
    return mapShop(response)
  },
  async getStall(stallId: string) {
    const response = await apiClient.request<StallDto>(`/api/v1/owner/stalls/${stallId}`)
    return {
      shop: mapShop(response),
      pois: (response.pois ?? []).map((poi) => ({ ...mapPoi(poi), shopId: String(response.id) })),
    }
  },
  async updateStall(stallId: string, payload: Partial<CreateStallPayload>) {
    const response = await apiClient.request<StallDto>(`/api/v1/owner/stalls/${stallId}`, {
      method: 'PUT',
      body: payload,
    })
    return mapShop(response)
  },
  async deleteStall(stallId: string) {
    await apiClient.request<void>(`/api/v1/owner/stalls/${stallId}`, {
      method: 'DELETE',
    })
  },
  async createPoi(stallId: string, payload: CreatePoiPayload) {
    const response = await apiClient.request<PoiDto>(`/api/v1/owner/stalls/${stallId}/pois`, {
      method: 'POST',
      body: payload,
    })
    return { ...mapPoi(response), shopId: stallId }
  },
  async updatePoi(poiId: string, payload: Partial<CreatePoiPayload>) {
    const response = await apiClient.request<PoiDto>(`/api/v1/owner/pois/${poiId}`, {
      method: 'PUT',
      body: payload,
    })
    return mapPoi(response)
  },
  async deletePoi(poiId: string) {
    await apiClient.request<void>(`/api/v1/owner/pois/${poiId}`, {
      method: 'DELETE',
    })
  },
  async savePoiContents(poiId: string, payload: SaveContentPayload[]) {
    const response = await apiClient.request<PoiDto>(`/api/v1/owner/pois/${poiId}/contents`, {
      method: 'PUT',
      body: {
        contents: payload.map((item) => ({
          ...item,
          contentStatus: item.contentStatus ?? (item.audioAssetId || item.scriptText ? 'READY' : 'DRAFT'),
        })),
      },
    })
    return mapPoi(response)
  },
  async uploadImage(file: File): Promise<UploadedAsset> {
    const body = new FormData()
    body.append('file', file)
    const response = await apiClient.request<{ assetId?: string; fileName?: string; url: string }>('/api/v1/uploads/images', {
      method: 'POST',
      body,
    })
    return {
      id: String(response.assetId ?? ''),
      url: response.url,
      fileName: response.fileName,
    }
  },
  async uploadAudio(poiId: string, languageCode: string, file: File): Promise<UploadedAsset> {
    const body = new FormData()
    body.append('file', file)
    body.append('languageCode', languageCode)
    const response = await apiClient.request<{ assetId?: string; fileName?: string; url: string }>(`/api/v1/uploads/audio/pois/${poiId}`, {
      method: 'POST',
      body,
    })
    return {
      id: String(response.assetId ?? ''),
      url: response.url,
      fileName: response.fileName,
    }
  },
  submitApproval(stallId: string) {
    return apiClient.request<void>(`/api/v1/owner/stalls/${stallId}/submit-approval`, {
      method: 'POST',
    })
  },
  getQrCode(stallId: string) {
    return apiClient.request<QrCodePayload>(`/api/v1/owner/stalls/${stallId}/qr`)
  },
  async getAnalytics(stallId: string) {
    const response = await apiClient.request<AnalyticsDto>(`/api/v1/owner/stalls/${stallId}/analytics`)
    return {
      summary: {
        totalPlays: response.totalPlays ?? 0,
        averageDurationSeconds: response.averageListenDurationSeconds ?? 0,
        uniqueVisitors: response.uniqueVisitors ?? 0,
        uniqueLanguages: response.uniqueLanguages ?? 0,
      },
      dailyPlays: response.dailyPlays ?? [],
      languageBreakdown: (response.languageBreakdown ?? []).map((item) => ({
        name: [item.languageCode, item.languageName].filter(Boolean).join(' - '),
        count: item.count,
      })),
      recentLogs: (response.recentLogs ?? []).map((item, index) => ({
        id: `${item.poiId ?? 'poi'}-${item.playedAt}-${index}`,
        poiId: String(item.poiId ?? ''),
        poiName: item.poiName,
        language: item.languageCode ?? item.languageName ?? 'vi',
        duration: item.listenDurationSeconds ?? 0,
        playedAt: item.playedAt,
      })),
    }
  },
}
