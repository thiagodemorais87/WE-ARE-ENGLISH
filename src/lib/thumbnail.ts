import type { CSSProperties } from 'react'
import type { ActivityType } from '@/types/activity'
import {
  FALLBACK_THUMB,
  THUMB_POOLS,
  pickThumbnail,
} from '@/data/thumbnails'

export { FALLBACK_THUMB, THUMB_POOLS, pickThumbnail }

export const THUMB_BY_TYPE: Partial<Record<ActivityType, string>> = Object.fromEntries(
  (Object.keys(THUMB_POOLS) as ActivityType[]).map((t) => [t, THUMB_POOLS[t][0]!]),
)

const BROKEN_SUBSTRINGS = ['photo-1456513086600-3a0f6d0e8f1c']

export function resolveThumbnailUrl(
  thumbnail: string | null | undefined,
  type?: ActivityType,
  fallbackIndex = 0,
): string {
  const raw = (thumbnail ?? '').trim()
  const broken = !raw || BROKEN_SUBSTRINGS.some((b) => raw.includes(b))
  if (broken) {
    return type ? pickThumbnail(type, fallbackIndex) : FALLBACK_THUMB
  }
  if (raw.startsWith('http') || raw.startsWith('/')) return raw
  return type ? pickThumbnail(type, fallbackIndex) : FALLBACK_THUMB
}

/** Next pool URL after a failed load; returns FALLBACK_THUMB when exhausted. */
export function nextThumbnailFallback(
  type: ActivityType | undefined,
  failedAttempt: number,
): string {
  if (!type) return FALLBACK_THUMB
  const pool = THUMB_POOLS[type] ?? THUMB_POOLS.grammar
  const next = failedAttempt + 1
  if (next >= pool.length) return FALLBACK_THUMB
  return pickThumbnail(type, next)
}

/** Supports image URLs and CSS gradients stored in `thumbnail`. */
export function thumbnailStyle(
  thumbnail: string,
  type?: ActivityType,
): CSSProperties {
  const resolved = resolveThumbnailUrl(thumbnail, type)
  if (resolved.startsWith('http') || resolved.startsWith('/')) {
    return {
      backgroundImage: `url(${resolved})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return { background: thumbnail || '#2a2a2a' }
}
