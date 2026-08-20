import { learningPaths } from '@/data/lessons'
import { FadeContent } from '@/components/motion/FadeContent'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

export function LearningPaths() {
  return (
    <Section
      id="lessons"
      title="ENCONTRE SEU CAMINHO NO INGLÊS"
      eyebrow="Trilhas"
      subtitle="Catálogo demonstrativo das modalidades de aula — sem checkout nesta versão."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {learningPaths.map((path, i) => (
          <FadeContent key={path.id} delay={i * 0.04}>
            <article className="flex h-full flex-col rounded-[1.5rem] border border-ink/8 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cobalt/30">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-cobalt">
                Trilha 0{i + 1}
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-wide">{path.title}</h3>
              <p className="mt-3 flex-1 text-muted text-pretty">{path.description}</p>
              <Button variant="ghost" className="mt-6 !px-0 !justify-start !rounded-none w-fit group">
                <span className="relative">
                  EXPLORAR
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-100 bg-cobalt transition-transform group-hover:scale-x-110" />
                </span>
              </Button>
            </article>
          </FadeContent>
        ))}
      </div>
    </Section>
  )
}
