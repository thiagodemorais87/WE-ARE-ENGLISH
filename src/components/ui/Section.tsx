import type { ReactNode } from 'react'
import { FadeContent } from '@/components/motion/FadeContent'

type Props = {
  id?: string
  eyebrow?: string
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  tone?: 'sand' | 'pink' | 'white' | 'cobalt' | 'cherry'
  wide?: boolean
}

const tones: Record<NonNullable<Props['tone']>, string> = {
  sand: 'bg-sand text-ink',
  pink: 'bg-soft-pink text-ink',
  white: 'bg-white text-ink',
  cobalt: 'bg-cobalt text-white',
  cherry: 'bg-cherry text-white',
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = '',
  tone = 'sand',
  wide = false,
}: Props) {
  return (
    <section id={id} className={`section-pad ${tones[tone]} ${className}`}>
      <div className={wide ? 'container-wide' : 'container-brand'}>
        {(eyebrow || title || subtitle) && (
          <FadeContent className="mb-10 md:mb-14 max-w-3xl">
            {eyebrow ? (
              <p className="mb-3 text-xs font-semibold tracking-[0.22em] uppercase text-cobalt">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="display text-[clamp(2.4rem,6vw,5rem)] text-balance">
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className="mt-4 text-base md:text-lg text-muted text-pretty max-w-2xl">
                {subtitle}
              </p>
            ) : null}
          </FadeContent>
        )}
        {children}
      </div>
    </section>
  )
}
