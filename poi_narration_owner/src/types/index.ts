export interface Shop {
  id: string
  ownerId: string
  name: string
  description: string
  category: string
  thumbnail: string
  isActive: boolean
  address: string
  poiCount: number
  createdAt: string
}

export interface POI {
  id: string
  shopId: string
  name: string
  lat: number
  lng: number
  radius: number
  priority: 1 | 2 | 3 | 4 | 5
  isActive: boolean
  contents: POIContent[]
  createdAt: string
}

export interface POIContent {
  id: string
  poiId: string
  language: string
  script: string
  audioUrl?: string
  status: 'draft' | 'published'
}

export interface PlayLog {
  id: string
  poiId: string
  language: string
  duration: number
  playedAt: string
}

export interface Owner {
  id: string
  name: string
  email: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
}

export interface Notification {
  id: string
  type: 'info' | 'warning' | 'success'
  message: string
  createdAt: string
  read: boolean
}

export interface DailyStats {
  date: string
  plays: number
}

export interface HourlyHeatmap {
  day: number
  hour: number
  plays: number
}
