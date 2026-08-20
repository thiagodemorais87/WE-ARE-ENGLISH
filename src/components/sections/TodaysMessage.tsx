import { BlurText } from '@/components/motion/BlurText'
import { FadeContent } from '@/components/motion/FadeContent'

export function TodaysMessage() {
  return (
    <section className="relative overflow-hidden bg-cherry text-white section-pad">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-soft-pink/15"
      />
      <div className="container-brand relative">
        <FadeContent>
          <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-soft-pink">
            Mensagem do Dia
          </p>
        </FadeContent>
        <BlurText
          as="blockquote"
          text={`"Don't be afraid of your accent. Be confident in your voice."`}
          className="display mt-6 text-[clamp(2rem,5.5vw,4.4rem)] max-w-4xl text-balance"
        />
        <FadeContent delay={0.15}>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-white/85 text-pretty">
            Passos pequenos, prática consistente e a orientação certa podem mudar a forma como você
            se comunica.
          </p>
          <p className="mt-8 text-[11px] font-semibold tracking-[0.22em] uppercase text-soft-pink">
            WE ARE ENGLISH · NOTA DO DIA
          </p>
        </FadeContent>
      </div>
    </section>
  )
}
