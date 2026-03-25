import {
  ownerApi,
} from '@/apis/ownerApi'
import type {
  AnalyticsDto,
  CreateStallPayload,
  CreateStallRequest,
  DailySeriesPoint,
  DashboardDto,
  GenerateNarrationPayload,
  GenerateNarrationRequest,
  NarrationGuide,
  QrCodePayload,
  SaveDraftNarrationPayload,
  SaveDraftNarrationRequest,
  Shop,
  StallAudioGuideDto,
  StallDto,
  UploadedAsset,
} from '@/types'

const DEFAULT_STALL_IMAGE =
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1200&h=800&fit=crop'

const mapShop = (dto: StallDto): Shop => ({
  id: String(dto.id),
  ownerId: '',
  name: dto.name,
  description: dto.description ?? '',
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
  title: dto.title,
  scriptText: dto.scriptText,
  audioUrl: dto.audioUrl,
  audioDurationSeconds: dto.audioDurationSeconds,
  active: dto.active,
  approvalStatus: dto.approvalStatus,
  createdAt: dto.createdAt ?? new Date().toISOString(),
})

const mergeStallPayload = (base: StallDto, payload: Partial<CreateStallPayload>): Partial<CreateStallRequest> => ({
  name: payload.name ?? base.name,
  description: payload.description ?? base.description ?? '',
  address: payload.address ?? base.address ?? '',
  latitude: payload.latitude ?? base.latitude ?? 0,
  longitude: payload.longitude ?? base.longitude ?? 0,
  active: payload.isActive ?? base.active ?? true,
})

export const ownerService = {
  async getDashboard() {
    const response = await ownerApi.getDashboard()
    return mapDashboard(response)
  },

  async getStalls() {
    const response = await ownerApi.getStalls()
    const shops = response.map(mapShop)
    return { shops, guidesByStall: {} as Record<string, NarrationGuide[]> }
  },

  async getStall(stallId: string) {
    const [stall, guides] = await Promise.all([ownerApi.getStall(stallId), ownerApi.listAudioGuides(stallId)])
    return {
      shop: mapShop(stall),
      guides: guides.map(mapGuide),
    }
  },

  async createStall(payload: CreateStallPayload) {
    const response = await ownerApi.createStall({
      name: payload.name,
      description: payload.description,
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
      active: payload.isActive,
    })
    return mapShop(response)
  },

  async updateStall(stallId: string, payload: Partial<CreateStallPayload>) {
    const current = await ownerApi.getStall(stallId)
    const response = await ownerApi.updateStall(stallId, mergeStallPayload(current, payload))
    return mapShop(response)
  },

  async deleteStall(stallId: string) {
    await ownerApi.deleteStall(stallId)
  },

  async generateNarration(stallId: string, payload: GenerateNarrationPayload) {
    const response = await ownerApi.generateNarration(stallId, {
      title: payload.title,
      sourceText: payload.sourceText,
      sourceLanguageCode: payload.sourceLanguageCode ?? 'vi',
      targetLanguageCodes: payload.targetLanguageCodes,
      active: payload.active ?? true,
      approvalStatus: payload.approvalStatus ?? 'PENDING',
    } satisfies GenerateNarrationRequest)

    return response.guides.map(mapGuide)
  },

  async saveDraftNarration(stallId: string, payload: SaveDraftNarrationPayload) {
    const response = await ownerApi.saveDraftNarration(stallId, {
      languageCode: payload.languageCode,
      title: payload.title,
      scriptText: payload.scriptText,
      active: payload.active ?? true,
      approvalStatus: payload.approvalStatus ?? 'PENDING',
    } satisfies SaveDraftNarrationRequest)
    return mapGuide(response)
  },

  async listAudioGuides(stallId: string) {
    const response = await ownerApi.listAudioGuides(stallId)
    return response.map(mapGuide)
  },

  async uploadImage(file: File): Promise<UploadedAsset> {
    const response = await ownerApi.uploadImage(file)
    return {
      id: String(response.assetId ?? ''),
      url: response.url,
      fileName: response.fileName,
    }
  },

  submitApproval(stallId: string) {
    return ownerApi.submitApproval(stallId)
  },

  getQrCode(stallId: string): Promise<QrCodePayload> {
    return ownerApi.getQrCode(stallId)
  },

  async getAnalytics(stallId: string) {
    const response = await ownerApi.getAnalytics(stallId)
    return mapAnalytics(stallId, response)
  },
}

const mapDashboard = (response: DashboardDto) => ({
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
  recentDailyPlays: response.recentDailyPlays ?? ([] as DailySeriesPoint[]),
})

const mapAnalytics = (stallId: string, response: AnalyticsDto) => ({
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
})
