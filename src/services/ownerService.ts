import {
  ownerApi,
} from '@/apis/ownerApi'
import { env } from '@/lib/env'
import type {
  ApprovalDto,
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

const resolveAssetUrl = (path?: string) => {
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
  description: dto.description ?? '',
  category: 'stall',
  thumbnail: resolveAssetUrl(dto.imageUrl) ?? DEFAULT_STALL_IMAGE,
  imageUrl: dto.imageUrl,
  isActive: dto.active ?? true,
  approvalStatus: dto.approvalStatus,
  qrResolvedUrl: undefined,
  address: dto.address ?? '',
  latitude: dto.latitude,
  longitude: dto.longitude,
  triggerRadiusMeters: dto.triggerRadiusMeters,
  poiCount: dto.audioGuideCount ?? 0,
  audioGuideCount: dto.audioGuideCount ?? 0,
  createdAt: dto.createdAt ?? new Date().toISOString(),
})

const mapGuide = (dto: StallAudioGuideDto): NarrationGuide => ({
  id: String(dto.id),
  stallId: String(dto.stallId),
  languageCode: dto.languageCode,
  languageName: dto.languageName,
  title: dto.title ?? '',
  scriptText: dto.scriptText,
  audioUrl: resolveAssetUrl(dto.audioUrl),
  audioDurationSeconds: dto.audioDurationSeconds,
  active: dto.active,
  approvalStatus: dto.approvalStatus,
  createdAt: dto.createdAt ?? new Date().toISOString(),
})

const approvalStatusLabel = (status?: string) => {
  switch ((status ?? '').toUpperCase()) {
    case 'APPROVED':
      return 'đã được duyệt'
    case 'REJECTED':
      return 'đã bị từ chối'
    case 'PENDING':
      return 'đang chờ duyệt'
    default:
      return 'có cập nhật trạng thái'
  }
}

const approvalNotificationType = (status?: string): 'info' | 'warning' | 'success' => {
  switch ((status ?? '').toUpperCase()) {
    case 'APPROVED':
      return 'success'
    case 'REJECTED':
      return 'warning'
    default:
      return 'info'
  }
}

const buildApprovalNotifications = (shops: Shop[], approvals: ApprovalDto[]) =>
  approvals
    .map((approval) => {
      const shop = shops.find((item) => item.id === String(approval.targetId))
      const status = approval.status?.toUpperCase()
      if (!shop || !status) {
        return null
      }

      return {
        id: `approval-${approval.id}-${status}`,
        type: approvalNotificationType(status),
        message: `Địa điểm "${shop.name}" ${approvalStatusLabel(status)}.`,
        createdAt: approval.updatedAt ?? approval.createdAt ?? new Date().toISOString(),
        read: status === 'PENDING',
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())

const mergeStallPayload = (base: StallDto, payload: Partial<CreateStallPayload>): Partial<CreateStallRequest> => ({
  name: payload.name ?? base.name,
  address: payload.address ?? base.address ?? '',
  latitude: payload.latitude ?? base.latitude ?? 0,
  longitude: payload.longitude ?? base.longitude ?? 0,
  triggerRadiusMeters: payload.triggerRadiusMeters ?? base.triggerRadiusMeters ?? 80,
  imageUrl: payload.imageUrl ?? base.imageUrl,
  active: payload.isActive ?? base.active ?? true,
})

export const ownerService = {
  async getDashboard() {
    const [response, stalls, approvals] = await Promise.all([
      ownerApi.getDashboard(),
      ownerApi.getStalls(),
      ownerApi.listApprovals(),
    ])
    const shops = stalls.map(mapShop)
    return {
      ...mapDashboard(response),
      notifications: buildApprovalNotifications(shops, approvals),
    }
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
      address: payload.address,
      latitude: payload.latitude,
      longitude: payload.longitude,
      triggerRadiusMeters: payload.triggerRadiusMeters,
      imageUrl: payload.imageUrl,
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
  notifications: [],
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
