import type { ReactNode, MouseEvent } from 'react'
import { useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

type Props = {
  children: ReactNode
  className?: string
}

export function SpotlightCard({ children, className = '' }: Props) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [spot, setSpot] = useState({ x: 50, y: 50, active: false })

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setSpot({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      active: true,
    })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={`relative overflow-hidden rounded-3xl transition-transform duration-300 hover:-translate-y-1 ${className}`}
      style={{
        backgroundImage: spot.active
          ? `radial-gradient(520px circle at ${spot.x}% ${spot.y}%, rgb(255 255 255 / 0.28), transparent 42%)`
          : undefined,
      }}
    >
      {children}
    </div>
  )
}
