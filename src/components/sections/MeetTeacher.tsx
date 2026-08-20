import { teacher } from '@/data/teacher'
import { FadeContent } from '@/components/motion/FadeContent'
import { Section } from '@/components/ui/Section'

export function MeetTeacher() {
  return (
    <Section id="about" title="CONHEÇA SUA PROFESSORA" eyebrow="A Professora">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16 items-center">
        <FadeContent>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-soft-pink">
            {teacher.photo ? (
              <img
                src={teacher.photo}
                alt={teacher.photoAlt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 text-cobalt display text-3xl">
                  WA
                </div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-ink/55">
                  [FOTO DA PROFESSORA]
                </p>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent p-6 pt-16 text-white">
              <p className="display text-3xl">{teacher.name}</p>
              <p className="mt-1 text-xs tracking-[0.16em] uppercase text-white/85">
                {teacher.role}
              </p>
            </div>
          </div>
        </FadeContent>

        <FadeContent delay={0.1}>
          <div className="space-y-5 text-base md:text-lg text-graphite leading-relaxed">
            {teacher.bio.map((paragraph) => (
              <p key={paragraph} className="text-pretty">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {teacher.specialties.map((item) => (
              <span
                key={item}
                className="rounded-full border border-cobalt/20 bg-white px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-cobalt"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted">
            {teacher.location} · {teacher.yearsInNewYork} anos em New York
          </p>
        </FadeContent>
      </div>
    </Section>
  )
}
