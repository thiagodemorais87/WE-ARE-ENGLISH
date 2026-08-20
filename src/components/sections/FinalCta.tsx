import { Button } from '@/components/ui/Button'
import { FadeContent } from '@/components/motion/FadeContent'
import { GlareHover } from '@/components/motion/GlareHover'
import { SplitText } from '@/components/motion/SplitText'

export function FinalCta() {
  return (
    <section id="cta" className="section-pad bg-sand">
      <GlareHover className="container-brand rounded-[2rem] bg-cherry text-white overflow-hidden">
        <div className="relative px-6 py-14 md:px-12 md:py-20">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-soft-pink/25 blur-2xl"
          />
          <SplitText
            text="PRONTA PARA DOMINAR SEU INGLÊS?"
            as="h2"
            className="display text-[clamp(2.4rem,6vw,5rem)] max-w-4xl relative"
          />
          <FadeContent delay={0.1}>
            <p className="mt-6 max-w-xl text-base md:text-lg text-white/85 text-pretty relative">
              Sua voz merece confiança. Vamos construir seu inglês em torno dos seus objetivos, da
              sua rotina e da sua vida.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 relative">
              <Button
                href="#home"
                className="!bg-white !text-cherry hover:!brightness-100 shadow-none"
              >
                COMECE SUA JORNADA
              </Button>
              <Button
                href="mailto:hello@weareenglish.com"
                variant="outline"
                className="!border-white/40 !text-white hover:!border-white hover:!text-white"
              >
                FALE COMIGO
              </Button>
            </div>
          </FadeContent>
        </div>
      </GlareHover>
    </section>
  )
}
