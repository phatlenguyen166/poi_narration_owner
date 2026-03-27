import { axiosClient } from '@/lib/axiosClient'
import type { OwnerProfileResponseDto, OwnerProfileUpdateRequest } from '@/types'

export const profileApi = {
  async getProfile(): Promise<OwnerProfileResponseDto> {
    const { data } = await axiosClient.get<OwnerProfileResponseDto>('/api/v1/owner/profile')
    return data
  },

  async updateProfile(payload: OwnerProfileUpdateRequest): Promise<OwnerProfileResponseDto> {
    const { data } = await axiosClient.put<OwnerProfileResponseDto>('/api/v1/owner/profile', payload)
    return data
  },
}

