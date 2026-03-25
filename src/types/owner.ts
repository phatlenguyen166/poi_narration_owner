export interface Owner {
  id: string
  name: string
  email: string
  phoneNumber?: string
  avatar?: string
  plan?: 'free' | 'pro' | 'enterprise'
}

export interface OwnerNotificationSettings {
  emailPlays: boolean
  emailWeekly: boolean
  pushNew: boolean
  pushMilestone: boolean
}

export interface OwnerPlan {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: string
  period: string
  current: boolean
  popular: boolean
  ctaLabel: string
  renewalAt?: string
  features: string[]
}

export interface OwnerSettings {
  notifications: OwnerNotificationSettings
  currentPlan: 'free' | 'pro' | 'enterprise'
  renewalAt?: string
  availablePlans: OwnerPlan[]
}

export interface SessionPayload {
  user: Owner
  accessToken: string
  refreshToken: string
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success'
  message: string
  createdAt: string
  read: boolean
}
