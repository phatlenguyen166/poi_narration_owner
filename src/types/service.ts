export interface CreateStallPayload {
  name: string
  address: string
  latitude: number
  longitude: number
  triggerRadiusMeters: number
  imageUrl?: string
  isActive: boolean
}

export interface GenerateNarrationPayload {
  title?: string
  sourceText: string
  sourceLanguageCode?: string
  targetLanguageCodes?: string[]
  active?: boolean
  approvalStatus?: string
}

export interface SaveDraftNarrationPayload {
  languageCode: string
  title?: string
  scriptText: string
  active?: boolean
  approvalStatus?: string
}
