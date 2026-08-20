import type { ElementType, Ref } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useInView } from '@/hooks/useInView'

type Props = {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
}

export function SplitText({ text, className = '', as: Tag = 'h1', delay = 0 }: Props) {
  const reduce = useReducedMotion()
  const { ref, inView } = useInView()
  const words = text.split(' ')
  const Component = Tag as ElementType

  if (reduce) {
    return (
      <Component ref={ref as Ref<HTMLElement>} className={className}>
        {text}
      </Component>
    )
  }

  return (
    <Component
      ref={ref as Ref<HTMLElement>}
      className={`${className} overflow-hidden`}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden mr-[0.28em] last:mr-0">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={inView ? { y: '0%', opacity: 1 } : undefined}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            aria-hidden
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  )
}
