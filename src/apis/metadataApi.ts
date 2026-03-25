import { apiClient } from '@/lib/api-client'
import type { LanguageDto } from '@/types'

export const metadataApi = {
  getLanguages() {
    return apiClient.request<LanguageDto[]>('/api/v1/languages', { auth: false })
  },
}
