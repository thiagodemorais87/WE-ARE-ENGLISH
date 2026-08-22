import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer, FeedbackBanner } from '@/components/activities/ActivityPlayer'
import type { EngineActivityProps } from './types'
import type { FillBlankContent } from '@/types/activity'

export function FillBlankActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as FillBlankContent
  const blanks = content.blanks ?? []
  const [values, setValues] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const parts = useMemo(() => content.text?.split('_____') ?? [''], [content.text])

  const allCorrect =
    blanks.length > 0 &&
    blanks.every((b) => (values[b.id] ?? '').trim().toLowerCase() === b.answer.trim().toLowerCase())

  const check = () => {
    setChecked(true)
    const score = blanks.length
      ? Math.round(
          (blanks.filter(
            (b) => (values[b.id] ?? '').trim().toLowerCase() === b.answer.trim().toLowerCase(),
          ).length /
            blanks.length) *
            100,
        )
      : 0
    onComplete?.({ answer: { values }, score, feedback: { explanation: content.explanation } })
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={1}
      totalSteps={1}
      onBack={onBack ?? (() => navigate(-1))}
    >
      <div className="flex flex-wrap items-center gap-2 text-lg text-white">
        {parts.map((part, i) => (
          <span key={i} className="contents">
            <span>{part}</span>
            {i < blanks.length ? (
              <input
                value={values[blanks[i].id] ?? ''}
                disabled={checked}
                onChange={(e) => setValues((v) => ({ ...v, [blanks[i].id]: e.target.value }))}
                className="w-28 rounded-lg border border-white/20 bg-ink px-2 py-1 text-center text-base text-white"
              />
            ) : null}
          </span>
        ))}
      </div>
      {!checked ? (
        <button type="button" onClick={check} className="mt-5 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white">
          Check
        </button>
      ) : (
        <FeedbackBanner correct={allCorrect} message={content.explanation ?? (allCorrect ? 'Perfect!' : 'Review the gaps.')} />
      )}
    </ActivityPlayer>
  )
}
