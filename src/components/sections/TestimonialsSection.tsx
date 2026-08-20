import { testimonials } from '@/data/testimonials'
import { FadeContent } from '@/components/motion/FadeContent'
import { Section } from '@/components/ui/Section'

export function TestimonialsSection() {
  return (
    <Section
      title="O QUE OS ALUNOS DIZEM"
      eyebrow="Depoimentos"
      subtitle="Citações demonstrativas até que os depoimentos reais sejam fornecidos."
    >
      <div className="grid md:grid-cols-3 gap-5">
        {testimonials.map((item, i) => (
          <FadeContent key={item.id} delay={i * 0.06}>
            <figure className="h-full rounded-[1.5rem] bg-white border border-ink/8 p-6 md:p-7 shadow-[var(--shadow-soft)]">
              <blockquote className="display text-2xl md:text-3xl text-cobalt text-pretty leading-snug">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-8 text-[11px] font-semibold tracking-[0.16em] uppercase text-muted">
                — {item.author}
                {item.demonstrative ? (
                  <span className="ml-2 normal-case tracking-normal text-[10px] opacity-70">
                    (demonstrativo)
                  </span>
                ) : null}
              </figcaption>
            </figure>
          </FadeContent>
        ))}
      </div>
    </Section>
  )
}
