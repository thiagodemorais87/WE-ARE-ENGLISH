import type { CSSProperties } from 'react'

/** Supports image URLs and CSS gradients stored in `thumbnail`. */
export function thumbnailStyle(thumbnail: string): CSSProperties {
  if (thumbnail.startsWith('http') || thumbnail.startsWith('/')) {
    return {
      backgroundImage: `url(${thumbnail})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return { background: thumbnail }
}
