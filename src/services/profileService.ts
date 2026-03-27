import { profileApi } from '@/apis/profileApi'
import type { OwnerProfileResponse, OwnerProfileResponseDto, OwnerProfileUpdateRequest } from '@/types'

const normalizePlan = (plan?: string | null): OwnerProfileResponse['plan'] => {
  const value = (plan ?? '').trim().toLowerCase()
  if (!value) return undefined
  if (value === 'free' || value === 'pro' || value === 'enterprise') {
    return value as OwnerProfileResponse['plan']
  }
  return undefined
}

const mapProfile = (owner: OwnerProfileResponseDto): OwnerProfileResponse => ({
  id: String(owner.id),
  name: owner.name,
  email: owner.email,
  phoneNumber: owner.phoneNumber,
  plan: normalizePlan(owner.plan),
})

export const profileService = {
  async getProfile(): Promise<OwnerProfileResponse> {
    const dto = await profileApi.getProfile()
    return mapProfile(dto)
  },

  async updateProfile(payload: OwnerProfileUpdateRequest): Promise<OwnerProfileResponse> {
    const dto = await profileApi.updateProfile(payload)
    return mapProfile(dto)
  },
}

