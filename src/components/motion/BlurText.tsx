import type { ElementType, Ref } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { useInView } from '@/hooks/useInView'

type Props = {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote' | 'span'
  delay?: number
}

export function BlurText({ text, className = '', as: Tag = 'p', delay = 0 }: Props) {
  const reduce = useReducedMotion()
  const { ref, inView } = useInView()
  const Component = Tag as ElementType

  if (reduce) {
    return (
      <Component ref={ref as Ref<HTMLElement>} className={className}>
        {text}
      </Component>
    )
  }

  return (
    <Component ref={ref as Ref<HTMLElement>} className={className}>
      <motion.span
        className="inline-block"
        initial={{ opacity: 0, filter: 'blur(10px)', y: 12 }}
        animate={inView ? { opacity: 1, filter: 'blur(0px)', y: 0 } : undefined}
        transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.span>
    </Component>
  )
}
