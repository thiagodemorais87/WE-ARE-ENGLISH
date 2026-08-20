import type { ReactNode, MouseEvent } from 'react'
import { useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

type Props = {
  children: ReactNode
  className?: string
}

export function GlareHover({ children, className = '' }: Props) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0, show: false })

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      show: true,
    })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos((p) => ({ ...p, show: false }))}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {!reduce && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            opacity: pos.show ? 1 : 0,
            background: `radial-gradient(180px circle at ${pos.x}px ${pos.y}px, rgb(255 255 255 / 0.35), transparent 55%)`,
          }}
        />
      )}
    </div>
  )
}
