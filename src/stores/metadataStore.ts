import { create } from 'zustand'

import { metadataApi } from '@/services/metadataApi'
import type { MetadataCategory, MetadataLanguage } from '@/types'

interface MetadataState {
  categories: MetadataCategory[]
  languages: MetadataLanguage[]
  isLoading: boolean
  loaded: boolean
  fetchMetadata: () => Promise<void>
  getCategoryLabel: (code?: string) => string
  getLanguage: (code?: string) => MetadataLanguage | undefined
}

export const useMetadataStore = create<MetadataState>()((set, get) => ({
  categories: [],
  languages: [],
  isLoading: false,
  loaded: false,

  fetchMetadata: async () => {
    if (get().loaded || get().isLoading) return
    set({ isLoading: true })
    try {
      const [categories, languages] = await Promise.all([
        metadataApi.getCategories(),
        metadataApi.getLanguages(),
      ])
      set({ categories, languages, isLoading: false, loaded: true })
    } catch (error) {
      set({ isLoading: false })
      throw error
    }
  },

  getCategoryLabel: (code) => {
    if (!code) return ''
    return get().categories.find((category) => category.value === code)?.label ?? code
  },

  getLanguage: (code) => {
    if (!code) return undefined
    return get().languages.find((language) => language.code === code)
  },
}))
