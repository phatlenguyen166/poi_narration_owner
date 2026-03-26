export interface Shop {
  id: string
  ownerId: string
  name: string
  description: string
  category?: string
  thumbnail: string
  imageUrl?: string
  isActive: boolean
  approvalStatus?: string
  qrResolvedUrl?: string
  address: string
  latitude?: number
  longitude?: number
  triggerRadiusMeters?: number
  poiCount: number
  audioGuideCount: number
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
  approvalStatus?: string
  contents: POIContent[]
  createdAt: string
}

export interface POIContent {
  id: string
  poiId: string
  language: string
  script: string
  audioUrl?: string
  audioFile?: File
  audioAssetId?: string
  status: 'draft' | 'published'
}

export interface PlayLog {
  id: string
  poiId: string
  language: string
  duration: number
  playedAt: string
}

export interface NarrationGuide {
  id: string
  stallId: string
  languageCode: string
  languageName: string
  title?: string
  scriptText: string
  audioUrl?: string
  audioDurationSeconds?: number
  active: boolean
  approvalStatus?: string
  createdAt: string
}

export interface UploadedAsset {
  id: string
  url: string
  fileName?: string
}

export interface QrCodePayload {
  code?: string
  targetType?: string
  targetId?: string
  resolvedUrl: string
}
