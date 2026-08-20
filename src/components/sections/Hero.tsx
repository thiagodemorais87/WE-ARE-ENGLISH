import { brand } from '@/data/brand'
import { progress } from '@/data/progress'
import { Button } from '@/components/ui/Button'
import { SplitText } from '@/components/motion/SplitText'
import { FadeContent } from '@/components/motion/FadeContent'
import { JourneyPreview } from '@/components/cards/JourneyPreview'

export function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[100dvh] overflow-hidden bg-sand pt-28 pb-16 md:pt-32"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-soft-pink/50 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-10 h-56 w-56 rounded-full bg-cobalt/10 blur-3xl"
      />

      <div className="container-wide px-5 md:px-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-center">
        <div>
          <FadeContent>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center rounded-full bg-cherry px-3 py-1 text-[10px] font-bold tracking-[0.18em] uppercase text-white">
                {brand.authoritySeal}
              </span>
              <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-ink/55">
                {brand.location}
              </span>
            </div>
          </FadeContent>

          <h1 className="sr-only">{brand.heroTitle.join(' ')}</h1>
          <div className="space-y-1" aria-hidden>
            {brand.heroTitle.map((line, i) => (
              <SplitText
                key={line}
                text={line}
                as="p"
                delay={0.08 * i}
                className="display text-[clamp(2.6rem,7.2vw,6.4rem)] text-cobalt"
              />
            ))}
          </div>

          <FadeContent delay={0.25}>
            <p className="mt-6 max-w-xl text-base md:text-lg text-muted text-pretty">
              {brand.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button href="#cta">COMECE SUA JORNADA</Button>
              <Button href={brand.studentArea.href} variant="outline">
                {brand.studentArea.label}
              </Button>
            </div>
          </FadeContent>
        </div>

        <FadeContent delay={0.2}>
          <JourneyPreview
            metrics={progress.heroJourney}
            nextLesson="Hoje · 19:00"
            focus={progress.nextLesson.focus}
          />
        </FadeContent>
      </div>
    </section>
  )
}
