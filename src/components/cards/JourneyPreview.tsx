type Metric = { id: string; label: string; value: number }

type Props = {
  metrics: readonly Metric[]
  nextLesson: string
  focus: string
}

export function JourneyPreview({ metrics, nextLesson, focus }: Props) {
  return (
    <aside
      className="relative rounded-[2rem] border border-ink/8 bg-white p-6 md:p-7 shadow-[var(--shadow-soft)]"
      aria-label="Prévia da jornada do aluno"
    >
      <div className="absolute -top-3 right-6 rounded-full bg-cobalt px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase text-white">
        Prévia
      </div>
      <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-ink/45">
        Sua Jornada no Inglês
      </p>
      <ul className="mt-6 space-y-5">
        {metrics.map((m) => (
          <li key={m.id}>
            <div className="mb-2 flex items-end justify-between gap-3">
              <span className="text-sm font-medium">{m.label}</span>
              <span className="text-sm font-bold text-cherry tabular-nums">{m.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-cobalt transition-[width] duration-700"
                style={{ width: `${m.value}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-sand p-4">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink/45">
            Próxima Aula
          </p>
          <p className="mt-2 text-sm font-semibold">{nextLesson}</p>
        </div>
        <div className="rounded-2xl bg-soft-pink p-4">
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-ink/55">
            Foco de Hoje
          </p>
          <p className="mt-2 text-sm font-semibold">{focus}</p>
        </div>
      </div>
    </aside>
  )
}
