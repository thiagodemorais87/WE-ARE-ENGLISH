import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer, FeedbackBanner } from '@/components/activities/ActivityPlayer'
import type { EngineActivityProps } from './types'
import type { TrueFalseContent } from '@/types/activity'

export function TrueFalseActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as TrueFalseContent
  const [choice, setChoice] = useState<boolean | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = choice === content.correct

  const check = () => {
    if (choice === null) return
    setChecked(true)
    onComplete?.({
      answer: { choice },
      score: choice === content.correct ? 100 : 0,
      feedback: { explanation: content.explanation },
    })
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={1}
      totalSteps={1}
      onBack={onBack ?? (() => navigate(-1))}
    >
      <p className="text-lg font-medium text-white">{content.statement}</p>
      <div className="mt-5 flex gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            disabled={checked}
            onClick={() => setChoice(v)}
            className={`rounded-full px-6 py-2.5 text-sm font-bold uppercase ${
              choice === v ? 'bg-cherry text-white' : 'border border-white/20 text-white/80'
            }`}
          >
            {v ? 'True' : 'False'}
          </button>
        ))}
      </div>
      {!checked ? (
        <button
          type="button"
          onClick={check}
          disabled={choice === null}
          className="mt-5 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <FeedbackBanner correct={correct} message={content.explanation ?? (correct ? 'Correct!' : 'Incorrect.')} />
      )}
    </ActivityPlayer>
  )
}
