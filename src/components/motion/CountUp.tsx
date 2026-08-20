import type { Ref } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useInView } from '@/hooks/useInView'

type Props = {
  to: number
  duration?: number
  className?: string
  prefix?: string
  suffix?: string
}

export function CountUp({
  to,
  duration = 1.4,
  className = '',
  prefix = '',
  suffix = '',
}: Props) {
  const reduce = useReducedMotion()
  const { ref, inView } = useInView()
  const [value, setValue] = useState(reduce ? to : 0)
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true

    if (reduce) {
      setValue(to)
      return
    }

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000))
      const eased = 1 - (1 - t) ** 3
      setValue(Math.round(to * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [duration, inView, reduce, to])

  return (
    <span ref={ref as Ref<HTMLSpanElement>} className={className}>
      {prefix}
      {value}
      {suffix}
    </span>
  )
}
