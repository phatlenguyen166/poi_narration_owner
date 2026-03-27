import type { Owner, OwnerProfileDto } from '@/types'

export type OwnerProfileResponseDto = OwnerProfileDto

export type OwnerProfileUpdateRequest = {
  name: string
  email: string
  phoneNumber?: string
}

// Mapped model used by UI/store.
export type OwnerProfileResponse = Owner

