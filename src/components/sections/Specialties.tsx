import { specialties } from '@/data/testimonials'
import { SpotlightCard } from '@/components/motion/SpotlightCard'
import { FadeContent } from '@/components/motion/FadeContent'
import { Section } from '@/components/ui/Section'

const tones = {
  cobalt: 'bg-cobalt text-white',
  softPink: 'bg-soft-pink text-ink',
  cherry: 'bg-cherry text-white',
} as const

export function Specialties() {
  return (
    <Section
      title="NOSSO FOCO"
      eyebrow="Especialidades"
      subtitle="Pronúncia. Fluência. Confiança."
    >
      <div className="grid md:grid-cols-3 gap-5">
        {specialties.map((item, i) => (
          <FadeContent key={item.id} delay={i * 0.08}>
            <SpotlightCard
              className={`${tones[item.tone]} min-h-[280px] p-7 md:p-8 shadow-[var(--shadow-lift)]`}
            >
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase opacity-70">
                Especialidade 0{i + 1}
              </p>
              <h3 className="display mt-6 text-4xl md:text-5xl">{item.title}</h3>
              <ul className="mt-8 space-y-2 text-base md:text-lg opacity-90">
                {item.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </SpotlightCard>
          </FadeContent>
        ))}
      </div>
    </Section>
  )
}
