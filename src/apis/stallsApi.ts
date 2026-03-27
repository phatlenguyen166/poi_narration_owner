import { axiosClient } from '@/lib/axiosClient'
import type {
  AnalyticsDto,
  SaveDraftNarrationRequest,
  StallAudioGuideDto,
  StallCreateRequest,
  StallDetailResponse,
  StallDtoResponse,
  StallUpdateRequest,
} from '@/types'

export const stallsApi = {
  async getStalls(): Promise<StallDtoResponse[]> {
    const { data } = await axiosClient.get<StallDtoResponse[]>('/api/v1/owner/stalls')
    return data
  },

  async getStallDetail(stallId: number): Promise<StallDetailResponse> {
    const { data } = await axiosClient.get<StallDtoResponse>(`/api/v1/owner/stalls/${stallId}`)
    return data as unknown as StallDetailResponse
  },

  async createStall(payload: StallCreateRequest): Promise<StallDtoResponse> {
    const { data } = await axiosClient.post<StallDtoResponse>('/api/v1/owner/stalls', payload)
    return data
  },

  async updateStall(stallId: number, payload: StallUpdateRequest): Promise<StallDtoResponse> {
    const { data } = await axiosClient.put<StallDtoResponse>(`/api/v1/owner/stalls/${stallId}`, payload)
    return data
  },

  async deleteStall(stallId: number): Promise<void> {
    await axiosClient.delete(`/api/v1/owner/stalls/${stallId}`)
  },

  async listStallAudioGuides(stallId: number): Promise<StallAudioGuideDto[]> {
    const { data } = await axiosClient.get<StallAudioGuideDto[]>(`/api/v1/owner/stalls/${stallId}/audio-guides`)
    return data
  },

  async createStallAudioDraft(stallId: number, payload: SaveDraftNarrationRequest): Promise<StallAudioGuideDto> {
    const { data } = await axiosClient.post<StallAudioGuideDto>(`/api/v1/owner/stalls/${stallId}/audio-guides`, {
      ...payload,
      audioUrl: null,
      audioDurationSeconds: null,
      approvalStatus: payload.approvalStatus ?? 'PENDING',
    })
    return data
  },

  async submitStallApproval(stallId: number): Promise<void> {
    await axiosClient.post<void>(`/api/v1/owner/stalls/${stallId}/submit-approval`)
  },

  async getStallAnalytics(stallId: number): Promise<AnalyticsDto> {
    const { data } = await axiosClient.get<AnalyticsDto>(`/api/v1/owner/stalls/${stallId}/analytics`)
    return data
  },
}

