import { create } from 'zustand'

import { metadataService } from '@/services/metadataService'
import type { MetadataState } from '@/types'

export const useMetadataStore = create<MetadataState>()((set, get) => ({
  categories: [],
  languages: [],
  isLoading: false,
  loaded: false,

  fetchMetadata: async () => {
    if (get().loaded || get().isLoading) return
    set({ isLoading: true })
    try {
      const [categories, languages] = await Promise.all([metadataService.getCategories(), metadataService.getLanguages()])
      set({ categories, languages, isLoading: false, loaded: true })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  getCategoryLabel: (code) => {
    if (!code) return 'Địa điểm'
    return get().categories.find((category) => category.value === code)?.label ?? 'Địa điểm'
  },

  getLanguage: (code) => {
    if (!code) return undefined
    return get().languages.find((language) => language.code === code)
  },
}))
