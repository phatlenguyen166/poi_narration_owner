import { create } from 'zustand'
import type { Shop, POI } from '@/types'
import { mockShops, mockPOIs } from '@/data/mock'

interface ShopState {
  shops: Shop[]
  pois: POI[]
  addShop: (shop: Shop) => void
  updateShop: (id: string, data: Partial<Shop>) => void
  deleteShop: (id: string) => void
  toggleShopActive: (id: string) => void
  addPOI: (poi: POI) => void
  updatePOI: (id: string, data: Partial<POI>) => void
  deletePOI: (id: string) => void
  getPOIsByShop: (shopId: string) => POI[]
}

export const useShopStore = create<ShopState>()((set, get) => ({
  shops: mockShops,
  pois: mockPOIs,

  addShop: (shop) => set((s) => ({ shops: [...s.shops, shop] })),
  updateShop: (id, data) =>
    set((s) => ({ shops: s.shops.map((sh) => (sh.id === id ? { ...sh, ...data } : sh)) })),
  deleteShop: (id) =>
    set((s) => ({
      shops: s.shops.filter((sh) => sh.id !== id),
      pois: s.pois.filter((p) => p.shopId !== id),
    })),
  toggleShopActive: (id) =>
    set((s) => ({
      shops: s.shops.map((sh) => (sh.id === id ? { ...sh, isActive: !sh.isActive } : sh)),
    })),

  addPOI: (poi) => set((s) => ({ pois: [...s.pois, poi] })),
  updatePOI: (id, data) =>
    set((s) => ({ pois: s.pois.map((p) => (p.id === id ? { ...p, ...data } : p)) })),
  deletePOI: (id) => set((s) => ({ pois: s.pois.filter((p) => p.id !== id) })),
  getPOIsByShop: (shopId) => get().pois.filter((p) => p.shopId === shopId),
}))
