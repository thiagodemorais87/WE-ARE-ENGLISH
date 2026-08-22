import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { learningPacks } from '@/data/mock-progress'
import type { LearningPack } from '@/types/activity'

const FAV_KEY = 'wae_favorites_v2'
const CART_KEY = 'wae_cart_v2'

type PlatformContextValue = {
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  cartPackIds: string[]
  addToCart: (packId: string) => void
  removeFromCart: (packId: string) => void
  cartPacks: LearningPack[]
}

const PlatformContext = createContext<PlatformContextValue | null>(null)

function readList(key: string, fallback: string[]): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as string[]
  } catch {
    return fallback
  }
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(() => readList(FAV_KEY, []))
  const [cartPackIds, setCartPackIds] = useState<string[]>(() => readList(CART_KEY, []))

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem(FAV_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  const addToCart = useCallback((packId: string) => {
    setCartPackIds((prev) => {
      if (prev.includes(packId)) return prev
      const next = [...prev, packId]
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeFromCart = useCallback((packId: string) => {
    setCartPackIds((prev) => {
      const next = prev.filter((id) => id !== packId)
      localStorage.setItem(CART_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const cartPacks = useMemo(
    () => learningPacks.filter((p) => cartPackIds.includes(p.id)),
    [cartPackIds],
  )

  const value = useMemo(
    () => ({
      favorites,
      toggleFavorite,
      isFavorite,
      cartPackIds,
      addToCart,
      removeFromCart,
      cartPacks,
    }),
    [favorites, toggleFavorite, isFavorite, cartPackIds, addToCart, removeFromCart, cartPacks],
  )

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
}

export function usePlatform() {
  const ctx = useContext(PlatformContext)
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider')
  return ctx
}
