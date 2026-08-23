import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer, FeedbackBanner } from '@/components/activities/ActivityPlayer'
import type { EngineActivityProps } from './types'
import type { WordOrderContent } from '@/types/activity'

export function WordOrderActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as WordOrderContent
  const [pool, setPool] = useState(() => [...(content.words ?? [])].sort(() => Math.random() - 0.5))
  const [ordered, setOrdered] = useState<string[]>([])
  const [checked, setChecked] = useState(false)

  const pick = (word: string, fromPool: boolean) => {
    if (checked) return
    if (fromPool) {
      setPool((p) => {
        const i = p.indexOf(word)
        if (i < 0) return p
        const next = [...p]
        next.splice(i, 1)
        return next
      })
      setOrdered((o) => [...o, word])
    } else {
      setOrdered((o) => {
        const i = o.indexOf(word)
        if (i < 0) return o
        const next = [...o]
        next.splice(i, 1)
        return next
      })
      setPool((p) => [...p, word])
    }
  }

  const correct =
    ordered.length === (content.correctOrder?.length ?? 0) &&
    ordered.every((w, i) => w === content.correctOrder[i])

  const check = () => {
    setChecked(true)
    onComplete?.({
      answer: { ordered },
      score: correct ? 100 : 0,
      feedback: { explanation: content.explanation, expected: content.correctOrder },
    })
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={1}
      totalSteps={1}
      onBack={onBack ?? (() => navigate(-1))}
    >
      <p className="font-medium text-fg">{content.prompt}</p>
      <div className="mt-4 flex min-h-14 flex-wrap gap-2 rounded-xl border border-dashed border-white/20 p-3">
        {ordered.map((w, i) => (
          <button key={`o-${i}-${w}`} type="button" onClick={() => pick(w, false)} className="rounded-lg bg-cherry/80 px-3 py-1.5 text-sm text-white">
            {w}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {pool.map((w, i) => (
          <button key={`p-${i}-${w}`} type="button" onClick={() => pick(w, true)} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-fg/80">
            {w}
          </button>
        ))}
      </div>
      {!checked ? (
        <button
          type="button"
          onClick={check}
          disabled={ordered.length !== (content.correctOrder?.length ?? 0)}
          className="mt-5 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <FeedbackBanner correct={correct} message={content.explanation ?? (correct ? 'Nice order!' : `Expected: ${content.correctOrder?.join(' ')}`)} />
      )}
    </ActivityPlayer>
  )
}
