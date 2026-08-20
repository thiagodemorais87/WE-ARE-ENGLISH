import { statistics } from '@/data/statistics'
import { CountUp } from '@/components/motion/CountUp'
import { FadeContent } from '@/components/motion/FadeContent'
import { Section } from '@/components/ui/Section'

export function ExperienceStats() {
  return (
    <Section
      id="experience"
      title="EXPERIÊNCIA QUE FALA POR SI"
      eyebrow="Autoridade"
      className="!pt-0"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statistics.map((stat, i) => (
          <FadeContent key={stat.id} delay={i * 0.06}>
            <article className="rounded-[1.5rem] bg-white border border-ink/6 p-5 md:p-7 h-full shadow-[var(--shadow-soft)]">
              <p className="display text-[clamp(2.8rem,6vw,4.5rem)] text-cherry leading-none">
                <CountUp
                  to={stat.value}
                  prefix={'prefix' in stat ? stat.prefix : ''}
                  suffix={stat.suffix}
                />
              </p>
              <p className="mt-3 text-sm font-semibold tracking-wide uppercase text-ink">
                {stat.label}
              </p>
              <p className="mt-2 text-[11px] text-muted">{stat.note}</p>
            </article>
          </FadeContent>
        ))}
      </div>
    </Section>
  )
}
