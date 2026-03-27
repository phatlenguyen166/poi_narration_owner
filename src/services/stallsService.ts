import { stallsApi } from '@/apis/stallsApi'
import { env } from '@/lib/env'
import type {
  AnalyticsDto,
  AnalyticsSummary,
  NarrationGuide,
  SaveDraftNarrationRequest,
  StallAudioGuideDto,
  StallCreateRequest,
  StallDetailResponse,
  StallDtoResponse,
  StallUpdateRequest,
} from '@/types'

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
  }
  return fallback
}

const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value.toLowerCase() === 'true'
  return fallback
}

const toStringOrEmpty = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value == null) return ''
  return String(value)
}

const resolveApiUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url
  if (url.startsWith('/')) return `${env.apiBaseUrl}${url}`
  return `${env.apiBaseUrl}/${url}`
}

const mapDetail = (dto: StallDtoResponse): StallDetailResponse => ({
  id: toNumber(dto.id),
  name: toStringOrEmpty(dto.name),
  // description is optional for the list/detail UI.
  address: toStringOrEmpty(dto.address),
  latitude: toNumber(dto.latitude),
  longitude: toNumber(dto.longitude),
  active: toBoolean(dto.active, true),
  approvalStatus: toStringOrEmpty(dto.approvalStatus),
  createdAt: toStringOrEmpty(dto.createdAt) || new Date().toISOString(),
  audioGuideCount: toNumber(dto.audioGuideCount),
  description: dto.description != null ? toStringOrEmpty(dto.description) : undefined,
})

const mapGuide = (dto: StallAudioGuideDto): NarrationGuide => ({
  id: String(dto.id),
  stallId: String(dto.stallId),
  languageCode: dto.languageCode,
  languageName: dto.languageName,
  title: dto.title ?? '',
  scriptText: dto.scriptText ?? '',
  audioUrl: resolveApiUrl(dto.audioUrl),
  audioDurationSeconds: dto.audioDurationSeconds,
  active: dto.active,
  approvalStatus: dto.approvalStatus,
  createdAt: dto.createdAt ?? new Date().toISOString(),
})

const mapAnalytics = (response: AnalyticsDto): AnalyticsSummary => ({
  totalPlays: response.totalPlays ?? 0,
  averageDurationSeconds: response.averageListenDurationSeconds ?? 0,
  uniqueVisitors: response.uniqueVisitors ?? 0,
  uniqueLanguages: response.uniqueLanguages ?? 0,
})

export const stallsService = {
  async getStallDetail(stallId: number): Promise<StallDetailResponse> {
    const dto = await stallsApi.getStallDetail(stallId)
    return mapDetail(dto as unknown as StallDtoResponse)
  },

  async getStalls(): Promise<StallDetailResponse[]> {
    const dtos = await stallsApi.getStalls()
    return dtos.map((dto) => mapDetail(dto))
  },

  async createStall(payload: StallCreateRequest): Promise<StallDetailResponse> {
    const dto = await stallsApi.createStall(payload)
    return mapDetail(dto)
  },

  async updateStall(stallId: number, payload: StallUpdateRequest): Promise<StallDetailResponse> {
    const dto = await stallsApi.updateStall(stallId, payload)
    return mapDetail(dto)
  },

  async deleteStall(stallId: number): Promise<void> {
    await stallsApi.deleteStall(stallId)
  },

  async getStallAudioGuides(stallId: number): Promise<NarrationGuide[]> {
    const dtos = await stallsApi.listStallAudioGuides(stallId)
    return dtos.map((dto) => mapGuide(dto))
  },

  async createStallAudioDraft(stallId: number, payload: SaveDraftNarrationRequest): Promise<NarrationGuide> {
    const dto = await stallsApi.createStallAudioDraft(stallId, payload)
    return mapGuide(dto)
  },

  async submitStallApproval(stallId: number): Promise<void> {
    await stallsApi.submitStallApproval(stallId)
  },

  async getStallAnalytics(stallId: number): Promise<AnalyticsSummary> {
    const dto = await stallsApi.getStallAnalytics(stallId)
    return mapAnalytics(dto)
  },
}

