import { apiClient } from '@/lib/api-client'
import { env } from '@/lib/env'
import type {
  DailySeriesPoint,
  NarrationGuide,
  QrCodePayload,
  Shop,
  UploadedAsset,
} from '@/types'

interface StallDto {
  id: number | string
  name: string
  address?: string
  latitude?: number
  longitude?: number
  active?: boolean
  approvalStatus?: string
  createdAt?: string
  audioGuideCount?: number
}

interface StallAudioGuideDto {
  id: number | string
  stallId: number | string
  languageCode: string
  languageName: string
  scriptText: string
  audioUrl?: string
  audioDurationSeconds?: number
  active: boolean
  approvalStatus?: string
  createdAt?: string
}

interface DashboardDto {
  stallCount?: number
  audioGuideCount?: number
  pendingApprovals?: number
  todayPlays?: number
  weekPlays?: number
  monthPlays?: number
  recentDailyPlays?: DailySeriesPoint[]
}

interface AnalyticsDto {
  totalPlays?: number
  uniqueVisitors?: number
  uniqueLanguages?: number
  averageListenDurationSeconds?: number
  dailyPlays?: DailySeriesPoint[]
  languageBreakdown?: { languageCode?: string; languageName?: string; count: number }[]
  recentLogs?: { languageCode?: string; languageName?: string; listenDurationSeconds?: number; createdAt?: string }[]
}

const DEFAULT_STALL_IMAGE =
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&h=800&fit=crop'

const resolveApiUrl = (path: string | undefined): string | undefined => {
  if (!path) {
    return undefined
  }
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) {
    return path
  }
  return `${env.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

const mapShop = (dto: StallDto): Shop => ({
  id: String(dto.id),
  ownerId: '',
  name: dto.name,
  description: '',
  category: 'stall',
  thumbnail: DEFAULT_STALL_IMAGE,
  isActive: dto.active ?? true,
  approvalStatus: dto.approvalStatus,
  qrResolvedUrl: undefined,
  address: dto.address ?? '',
  latitude: dto.latitude,
  longitude: dto.longitude,
  poiCount: dto.audioGuideCount ?? 0,
  audioGuideCount: dto.audioGuideCount ?? 0,
  createdAt: dto.createdAt ?? new Date().toISOString(),
})

const mapGuide = (dto: StallAudioGuideDto): NarrationGuide => ({
  id: String(dto.id),
  stallId: String(dto.stallId),
  languageCode: dto.languageCode,
  languageName: dto.languageName,
  title: '',
  scriptText: dto.scriptText,
  audioUrl: resolveApiUrl(dto.audioUrl),
  audioDurationSeconds: dto.audioDurationSeconds,
  active: dto.active,
  approvalStatus: dto.approvalStatus,
  createdAt: dto.createdAt ?? new Date().toISOString(),
})

export interface CreateStallPayload {
  name: string
  address: string
  latitude: number
  longitude: number
  isActive: boolean
}

export interface GenerateNarrationPayload {
  sourceText: string
  sourceLanguageCode?: string
  targetLanguageCodes?: string[]
  active?: boolean
  approvalStatus?: string
}

export interface SaveDraftNarrationPayload {
  languageCode: string
  scriptText: string
  active?: boolean
  approvalStatus?: string
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
        activePoiCount: response.audioGuideCount ?? 0,
        pendingApprovals: response.pendingApprovals ?? 0,
        totalPlays: response.monthPlays ?? 0,
      },
      notifications:
        (response.pendingApprovals ?? 0) > 0
          ? [
              {
                id: 'pending-approvals',
                type: 'warning' as const,
                message: `Bạn có ${response.pendingApprovals} địa điểm đang chờ duyệt`,
                createdAt: new Date().toISOString(),
                read: false,
              },
            ]
          : [],
      recentDailyPlays: response.recentDailyPlays ?? [],
    }
  },

  async getStalls() {
    const response = await apiClient.request<StallDto[]>('/api/v1/owner/stalls')
    const shops = response.map(mapShop)
    return { shops, guidesByStall: {} as Record<string, NarrationGuide[]> }
  },

  async getStall(stallId: string) {
    const [stall, guides] = await Promise.all([
      apiClient.request<StallDto>(`/api/v1/owner/stalls/${stallId}`),
      apiClient.request<StallAudioGuideDto[]>(`/api/v1/owner/stalls/${stallId}/audio-guides`),
    ])

    return {
      shop: mapShop(stall),
      guides: guides.map(mapGuide),
    }
  },

  async createStall(payload: CreateStallPayload) {
    const response = await apiClient.request<StallDto>('/api/v1/owner/stalls', {
      method: 'POST',
      body: {
        name: payload.name,
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        active: payload.isActive,
      },
    })
    return mapShop(response)
  },

  async updateStall(stallId: string, payload: Partial<CreateStallPayload>) {
    const current = await apiClient.request<StallDto>(`/api/v1/owner/stalls/${stallId}`)
    const response = await apiClient.request<StallDto>(`/api/v1/owner/stalls/${stallId}`, {
      method: 'PUT',
      body: {
        name: payload.name ?? current.name,
        address: payload.address ?? current.address ?? '',
        latitude: payload.latitude ?? current.latitude ?? 0,
        longitude: payload.longitude ?? current.longitude ?? 0,
        active: payload.isActive ?? current.active ?? true,
      },
    })
    return mapShop(response)
  },

  async deleteStall(stallId: string) {
    await apiClient.request<void>(`/api/v1/owner/stalls/${stallId}`, {
      method: 'DELETE',
    })
  },

  async generateNarration(stallId: string, payload: GenerateNarrationPayload) {
    const response = await apiClient.request<{
      guides: StallAudioGuideDto[]
    }>(`/api/v1/owner/stalls/${stallId}/audio-guides/generate`, {
      method: 'POST',
      body: {
        sourceText: payload.sourceText,
        sourceLanguageCode: payload.sourceLanguageCode ?? 'vi',
        targetLanguageCodes: payload.targetLanguageCodes,
        active: payload.active ?? true,
        approvalStatus: payload.approvalStatus ?? 'PENDING',
      },
    })

    return response.guides.map(mapGuide)
  },

  async saveDraftNarration(stallId: string, payload: SaveDraftNarrationPayload) {
    const response = await apiClient.request<StallAudioGuideDto>(`/api/v1/owner/stalls/${stallId}/audio-guides`, {
      method: 'POST',
      body: {
        languageCode: payload.languageCode,
        scriptText: payload.scriptText,
        audioUrl: null,
        audioDurationSeconds: null,
        active: payload.active ?? true,
        approvalStatus: payload.approvalStatus ?? 'PENDING',
      },
    })
    return mapGuide(response)
  },

  async listAudioGuides(stallId: string) {
    const response = await apiClient.request<StallAudioGuideDto[]>(`/api/v1/owner/stalls/${stallId}/audio-guides`)
    return response.map(mapGuide)
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
        id: `${stallId}-${item.createdAt ?? index}-${index}`,
        poiId: stallId,
        poiName: undefined,
        language: item.languageCode ?? item.languageName ?? 'vi',
        duration: item.listenDurationSeconds ?? 0,
        playedAt: item.createdAt ?? new Date().toISOString(),
      })),
    }
  },
}
