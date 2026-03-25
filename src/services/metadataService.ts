import { metadataApi } from '@/apis/metadataApi'
import type { LanguageDto, MetadataCategory, MetadataLanguage } from '@/types'

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

export const metadataService = {
  async getLanguages() {
    const response = await metadataApi.getLanguages()
    return response.map(toLanguage)
  },

  async getCategories() {
    return [{ value: 'stall', label: 'Địa điểm' }] satisfies MetadataCategory[]
  },
}
