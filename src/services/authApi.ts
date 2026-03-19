import { apiClient } from '@/lib/api-client'
import type { Owner, SessionPayload } from '@/types'

interface AuthRequest {
  email: string
  password: string
}

interface OwnerRegisterRequest extends AuthRequest {
  name: string
  phoneNumber?: string
}

interface OwnerProfileDto {
  id: number | string
  name: string
  email: string
  phoneNumber?: string
  role?: string
}

interface AuthTokensDto {
  accessToken: string
  refreshToken: string
  user: OwnerProfileDto
}

const mapOwner = (owner: OwnerProfileDto): Owner => ({
  id: String(owner.id),
  name: owner.name,
  email: owner.email,
  phoneNumber: owner.phoneNumber,
  plan: owner.role?.toUpperCase() === 'ADMIN' ? 'enterprise' : 'pro',
})

export const authApi = {
  async login(payload: AuthRequest) {
    const session = await apiClient.request<AuthTokensDto>('/api/v1/auth/login', {
      method: 'POST',
      body: payload,
      auth: false,
    })
    return { ...session, user: mapOwner(session.user) } satisfies SessionPayload
  },
  async register(payload: OwnerRegisterRequest) {
    const session = await apiClient.request<AuthTokensDto>('/api/v1/auth/owner/register', {
      method: 'POST',
      body: payload,
      auth: false,
    })
    return { ...session, user: mapOwner(session.user) } satisfies SessionPayload
  },
  refresh(refreshToken: string) {
    return apiClient.request<Pick<SessionPayload, 'accessToken' | 'refreshToken'>>('/api/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    })
  },
  async me() {
    const owner = await apiClient.request<OwnerProfileDto>('/api/v1/auth/me')
    return mapOwner(owner)
  },
}
