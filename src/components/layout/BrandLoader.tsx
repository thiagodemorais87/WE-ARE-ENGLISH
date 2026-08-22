import { motion, useReducedMotion } from 'motion/react'
import { brand } from '@/data/brand'
import { BlurText } from '@/components/motion/BlurText'

type Props = {
  onDone?: () => void
}

export function BrandLoader({ onDone }: Props) {
  const reduce = useReducedMotion()

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-sand text-ink"
      role="status"
      aria-live="polite"
      aria-label="Loading We Are English"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-16 top-1/4 h-56 w-56 rounded-full bg-cherry/25 blur-3xl"
          animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-10 bottom-1/4 h-64 w-64 rounded-full bg-cobalt/20 blur-3xl"
          animate={reduce ? undefined : { scale: [1.1, 1, 1.1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.p
        className="display relative text-4xl text-ink sm:text-5xl"
        initial={reduce ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {brand.name}
      </motion.p>

      <BlurText
        text={brand.tagline}
        className="relative mt-4 text-sm font-semibold uppercase tracking-[0.22em] text-cherry"
        as="p"
        delay={0.15}
      />

      <motion.div
        className="relative mt-10 h-1 w-40 overflow-hidden rounded-full bg-ink/10"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cherry via-soft-pink to-cobalt"
          initial={{ x: '-100%' }}
          animate={reduce ? { x: '0%' } : { x: ['-100%', '100%'] }}
          transition={
            reduce
              ? { duration: 0.2 }
              : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      </motion.div>

      {onDone ? (
        <button type="button" className="sr-only" onClick={onDone}>
          Skip loading
        </button>
      ) : null}
    </div>
  )
}
