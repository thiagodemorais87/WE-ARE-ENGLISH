import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  continuePathHref,
  fetchJourneyProgress,
  type JourneyProgress,
} from '@/services/activities/journey.service'

type Props = {
  userId: string
}

export function LearningPath({ userId }: Props) {
  const [progress, setProgress] = useState<JourneyProgress | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchJourneyProgress(userId).then((p) => {
      if (!cancelled) setProgress(p)
    })
    return () => {
      cancelled = true
    }
  }, [userId])

  if (!progress) {
    return <div className="h-48 animate-pulse rounded-3xl border border-edge bg-panel" />
  }

  const continueHref = continuePathHref(progress.current)

  return (
    <section className="rounded-3xl border border-edge bg-panel p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-cherry">
            Your English Journey
          </p>
          <h2 className="mt-1 display text-3xl text-fg sm:text-4xl">Learning path</h2>
          <p className="mt-2 text-sm text-fg-muted">
            See where you are, what you&apos;ve done, and what comes next.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-fg">
            {progress.completedCount}
            <span className="text-fg-muted">/{progress.totalCount}</span>
          </p>
          <p className="text-xs uppercase tracking-wider text-fg-muted">steps done</p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {progress.levels.map((block) => (
          <div key={block.level}>
            <h3 className="text-sm font-bold uppercase tracking-wider text-cobalt">
              {block.label}
            </h3>
            <ul className="mt-3 space-y-2">
              {block.nodes.map((node) => {
                const done = node.status === 'done'
                const current = node.status === 'current'
                return (
                  <li
                    key={node.id}
                    className={[
                      'flex items-start gap-3 rounded-2xl border px-4 py-3',
                      current
                        ? 'border-cherry/40 bg-cherry/5'
                        : done
                          ? 'border-edge bg-surface'
                          : 'border-transparent bg-transparent',
                    ].join(' ')}
                  >
                    <span
                      className={[
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        done
                          ? 'bg-cobalt text-white'
                          : current
                            ? 'border-2 border-cherry text-cherry'
                            : 'border border-edge text-fg-muted',
                      ].join(' ')}
                      aria-hidden
                    >
                      {done ? '✓' : '○'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={[
                            'font-semibold',
                            done || current ? 'text-fg' : 'text-fg-muted',
                          ].join(' ')}
                        >
                          {node.title}
                        </p>
                        {current ? (
                          <span className="rounded-full bg-cherry px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                            You are here
                          </span>
                        ) : null}
                      </div>
                      {node.description ? (
                        <p className="mt-0.5 text-sm text-fg-muted">{node.description}</p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <Link
        to={continueHref}
        className="mt-8 inline-flex rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-cherry/90"
      >
        Continue path
      </Link>
    </section>
  )
}
