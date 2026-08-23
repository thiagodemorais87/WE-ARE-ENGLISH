import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer, FeedbackBanner } from '@/components/activities/ActivityPlayer'
import type { EngineActivityProps } from './types'
import type { MatchingContent } from '@/types/activity'

export function MatchingActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as MatchingContent
  const pairs = content.pairs ?? []
  const rights = useMemo(() => [...pairs.map((p) => p.right)].sort(() => Math.random() - 0.5), [pairs])
  const [map, setMap] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const score =
    pairs.length === 0
      ? 0
      : Math.round((pairs.filter((p) => map[p.left] === p.right).length / pairs.length) * 100)
  const allCorrect = score === 100

  const check = () => {
    setChecked(true)
    onComplete?.({ answer: { map }, score, feedback: { explanation: content.explanation } })
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={1}
      totalSteps={1}
      onBack={onBack ?? (() => navigate(-1))}
    >
      <p className="font-medium text-fg">{content.prompt}</p>
      <div className="mt-4 space-y-3">
        {pairs.map((p) => (
          <div key={p.left} className="flex flex-wrap items-center gap-3">
            <span className="min-w-28 rounded-lg bg-panel-strong px-3 py-2 text-sm text-fg">{p.left}</span>
            <select
              disabled={checked}
              value={map[p.left] ?? ''}
              onChange={(e) => setMap((m) => ({ ...m, [p.left]: e.target.value }))}
              className="rounded-lg border border-white/20 bg-ink px-3 py-2 text-sm text-fg"
            >
              <option value="">Match…</option>
              {rights.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {!checked ? (
        <button
          type="button"
          onClick={check}
          disabled={Object.keys(map).length < pairs.length}
          className="mt-5 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <FeedbackBanner correct={allCorrect} message={content.explanation ?? `Score: ${score}%`} />
      )}
    </ActivityPlayer>
  )
}
