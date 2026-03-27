export interface StallDtoResponse {
  id?: number
  name?: string
  description?: string
  address?: string
  latitude?: number
  longitude?: number
  active?: boolean
  approvalStatus?: string
  createdAt?: string
  audioGuideCount?: number
}

export interface StallDetailResponse {
  id: number
  name: string
  description?: string
  address: string
  latitude: number
  longitude: number
  active: boolean
  approvalStatus: string
  createdAt: string
  audioGuideCount: number
}

export interface StallCreateRequest {
  name: string
  description?: string
  address: string
  latitude: number
  longitude: number
  active: boolean
}

export interface StallUpdateRequest extends Partial<StallCreateRequest> {}

