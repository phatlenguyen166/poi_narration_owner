import { apiClient } from '@/lib/api-client'
import type { MetadataCategory, MetadataLanguage } from '@/types'

interface LanguageDto {
  id: number | string
  code: string
  name: string
}

interface CategoryDto {
  value: string
  label: string
}

const LANGUAGE_FLAGS: Record<string, string> = {
  vi: 'VN',
  en: 'EN',
  fr: 'FR',
  jp: 'JP',
  ja: 'JP',
  kr: 'KR',
  ko: 'KR',
  zh: 'CN',
}

const toLanguage = (language: LanguageDto): MetadataLanguage => ({
  id: String(language.id),
  code: language.code,
  name: language.name,
  flag: LANGUAGE_FLAGS[language.code] ?? language.code.toUpperCase(),
})

export const metadataApi = {
  async getLanguages() {
    const response = await apiClient.request<LanguageDto[]>('/api/v1/metadata/languages', { auth: false })
    return response.map(toLanguage)
  },
  async getCategories() {
    const response = await apiClient.request<CategoryDto[]>('/api/v1/metadata/categories', { auth: false })
    return response.map((category): MetadataCategory => ({ value: category.value, label: category.label }))
  },
}
