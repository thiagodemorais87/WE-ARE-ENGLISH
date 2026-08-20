import { pricing } from '@/data/pricing'
import { FadeContent } from '@/components/motion/FadeContent'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

export function PricingSection() {
  return (
    <Section
      title="AULAS PARTICULARES"
      eyebrow="Planos"
      subtitle="Escolha o formato que combina com a sua rotina."
      tone="pink"
    >
      <div className="grid md:grid-cols-3 gap-5">
        {pricing.map((plan, i) => (
          <FadeContent key={plan.id} delay={i * 0.06}>
            <article
              className={`flex h-full flex-col rounded-[1.75rem] p-7 border border-ink/8 transition-transform duration-300 hover:-translate-y-1 ${
                i === 1
                  ? 'bg-cobalt text-white border-transparent shadow-[var(--shadow-lift)]'
                  : 'bg-white'
              }`}
            >
              <h3 className="text-sm font-semibold tracking-[0.18em] uppercase">{plan.title}</h3>
              <p className={`mt-4 display text-5xl ${i === 1 ? 'text-soft-pink' : 'text-cherry'}`}>
                {plan.price}
              </p>
              <p className={`mt-4 text-pretty ${i === 1 ? 'text-white/80' : 'text-muted'}`}>
                {plan.description}
              </p>
              <p className={`mt-2 text-[11px] ${i === 1 ? 'text-white/55' : 'text-muted'}`}>
                {plan.note}
              </p>
              <Button
                variant={i === 1 ? 'primary' : 'outline'}
                className={`mt-8 ${i === 1 ? '!bg-white !text-cobalt hover:!brightness-100' : ''}`}
              >
                SAIBA MAIS
              </Button>
            </article>
          </FadeContent>
        ))}
      </div>
    </Section>
  )
}
