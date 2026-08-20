import { lessonElements } from '@/data/lessons'
import { FadeContent } from '@/components/motion/FadeContent'
import { Section } from '@/components/ui/Section'

const placements = [
  'md:translate-y-0',
  'md:translate-y-8',
  'md:-translate-y-4',
  'md:translate-y-12',
  'md:-translate-y-2',
  'md:translate-y-6',
]

const colors = [
  'bg-cobalt text-white',
  'bg-soft-pink text-ink',
  'bg-white text-ink border border-ink/10',
  'bg-cherry text-white',
  'bg-sand text-ink border border-ink/10',
  'bg-cobalt/10 text-cobalt border border-cobalt/15',
]

export function LessonExperience() {
  return (
    <Section
      title="O QUE ACONTECE EM UMA AULA?"
      eyebrow="Dentro da Aula"
      subtitle="Uma mistura dinâmica de conversação, clareza e comunicação da vida real."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {lessonElements.map((item, i) => (
          <FadeContent key={item} delay={i * 0.05} className={placements[i]}>
            <article
              className={`rounded-[1.5rem] p-6 md:p-7 min-h-[140px] flex flex-col justify-between shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-1 ${colors[i]}`}
            >
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase opacity-70">
                0{i + 1}
              </span>
              <h3 className="display text-3xl md:text-4xl mt-8">{item}</h3>
            </article>
          </FadeContent>
        ))}
      </div>
    </Section>
  )
}
