import { apiClient } from '@/lib/api-client'
import type {
  ApprovalDto,
  AnalyticsDto,
  CreateStallRequest,
  DashboardDto,
  GenerateNarrationRequest,
  QrCodePayload,
  SaveDraftNarrationRequest,
  StallAudioGuideDto,
  StallDto,
} from '@/types'

export const ownerApi = {
  getDashboard() {
    return apiClient.request<DashboardDto>('/api/v1/owner/dashboard')
  },

  getStalls() {
    return apiClient.request<StallDto[]>('/api/v1/owner/stalls')
  },

  getStall(stallId: string) {
    return apiClient.request<StallDto>(`/api/v1/owner/stalls/${stallId}`)
  },

  createStall(payload: CreateStallRequest) {
    return apiClient.request<StallDto>('/api/v1/owner/stalls', {
      method: 'POST',
      body: payload,
    })
  },

  updateStall(stallId: string, payload: Partial<CreateStallRequest>) {
    return apiClient.request<StallDto>(`/api/v1/owner/stalls/${stallId}`, {
      method: 'PUT',
      body: payload,
    })
  },

  deleteStall(stallId: string) {
    return apiClient.request<void>(`/api/v1/owner/stalls/${stallId}`, {
      method: 'DELETE',
    })
  },

  generateNarration(stallId: string, payload: GenerateNarrationRequest) {
    return apiClient.request<{ guides: StallAudioGuideDto[] }>(`/api/v1/owner/stalls/${stallId}/audio-guides/generate`, {
      method: 'POST',
      body: payload,
    })
  },

  saveDraftNarration(stallId: string, payload: SaveDraftNarrationRequest) {
    return apiClient.request<StallAudioGuideDto>(`/api/v1/owner/stalls/${stallId}/audio-guides`, {
      method: 'POST',
      body: {
        ...payload,
        audioUrl: null,
        audioDurationSeconds: null,
      },
    })
  },

  listAudioGuides(stallId: string) {
    return apiClient.request<StallAudioGuideDto[]>(`/api/v1/owner/stalls/${stallId}/audio-guides`)
  },

  listApprovals() {
    return apiClient.request<ApprovalDto[]>('/api/v1/owner/approvals')
  },

  uploadImage(file: File) {
    const body = new FormData()
    body.append('file', file)
    return apiClient.request<{ assetId?: string; fileName?: string; url: string }>('/api/v1/uploads/images', {
      method: 'POST',
      body,
    })
  },

  submitApproval(stallId: string) {
    return apiClient.request<void>(`/api/v1/owner/stalls/${stallId}/submit-approval`, {
      method: 'POST',
    })
  },

  getQrCode(stallId: string) {
    return apiClient.request<QrCodePayload>(`/api/v1/owner/stalls/${stallId}/qr`)
  },

  createQrCode(stallId: string, payload?: { expiresInDays?: number; startsAt?: string; expiresAt?: string }) {
    return apiClient.request<QrCodePayload>(`/api/v1/owner/stalls/${stallId}/qr`, {
      method: 'POST',
      body: {
        expiresInDays: payload?.expiresInDays ?? 30,
        startsAt: payload?.startsAt ?? null,
        expiresAt: payload?.expiresAt ?? null,
      },
    })
  },

  getAnalytics(stallId: string) {
    return apiClient.request<AnalyticsDto>(`/api/v1/owner/stalls/${stallId}/analytics`)
  },
}
