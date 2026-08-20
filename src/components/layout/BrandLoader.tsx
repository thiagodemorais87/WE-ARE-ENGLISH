import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { brand } from '@/data/brand'

type Props = {
  onDone: () => void
}

export function BrandLoader({ onDone }: Props) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduce) {
      const t = window.setTimeout(onDone, 200)
      return () => window.clearTimeout(t)
    }

    const timers = [
      window.setTimeout(() => setStep(1), 420),
      window.setTimeout(() => setStep(2), 860),
      window.setTimeout(onDone, 1550),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone, reduce])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-sand"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-label="Carregando WE ARE ENGLISH"
    >
      <div className="px-6 text-center">
        <motion.p
          className="display text-[clamp(2.5rem,8vw,5.5rem)] text-cobalt"
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55 }}
        >
          {brand.loadingLines[0]}
        </motion.p>
        <motion.p
          className="mt-3 text-xs md:text-sm font-semibold tracking-[0.28em] uppercase text-cherry"
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {brand.loadingLines[1]}
        </motion.p>
        <motion.p
          className="mt-6 text-sm md:text-base tracking-[0.18em] uppercase text-ink/70"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 8 }}
          transition={{ duration: 0.4 }}
        >
          {brand.loadingLines[2]}
        </motion.p>
      </div>
    </motion.div>
  )
}
