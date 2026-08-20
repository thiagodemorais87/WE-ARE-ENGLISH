import type { ReactNode, Ref } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useInView } from '@/hooks/useInView'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
}

export function FadeContent({ children, className = '', delay = 0 }: Props) {
  const reduce = useReducedMotion()
  const { ref, inView } = useInView()

  if (reduce) {
    return (
      <div ref={ref as Ref<HTMLDivElement>} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      ref={ref as Ref<HTMLDivElement>}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
