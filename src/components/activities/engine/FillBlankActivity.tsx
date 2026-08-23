import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer, FeedbackBanner } from '@/components/activities/ActivityPlayer'
import type { EngineActivityProps } from './types'
import type { FillBlankContent, FillBlankItem } from '@/types/activity'

function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isCorrect(item: FillBlankItem, value: string): boolean {
  const got = normalizeAnswer(value)
  if (!got) return false
  const accepted = [item.answer, ...(item.alternatives ?? [])].map(normalizeAnswer)
  return accepted.includes(got)
}

function resolveItems(content: FillBlankContent): FillBlankItem[] {
  if (content.items?.length) return content.items
  if (content.text && content.blanks?.length) {
    const parts = content.text.split('_____')
    return content.blanks.map((b, i) => ({
      id: b.id,
      sentence: `${parts[i] ?? ''}_____${parts[i + 1] ?? ''}`.trim() || `_____`,
      answer: b.answer,
      alternatives: b.alternatives,
    }))
  }
  return []
}

export function FillBlankActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as FillBlankContent
  const items = useMemo(() => resolveItems(content), [content])
  const [values, setValues] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState(false)

  const results = useMemo(() => {
    if (!checked) return null
    return items.map((item) => ({
      id: item.id,
      ok: isCorrect(item, values[item.id] ?? ''),
      answer: item.answer,
    }))
  }, [checked, items, values])

  const score = results
    ? Math.round((results.filter((r) => r.ok).length / Math.max(items.length, 1)) * 100)
    : 0

  const check = () => {
    setChecked(true)
    const nextScore = items.length
      ? Math.round(
          (items.filter((item) => isCorrect(item, values[item.id] ?? '')).length / items.length) *
            100,
        )
      : 0
    onComplete?.({
      answer: { values },
      score: nextScore,
      feedback: {
        explanation: content.explanation,
        correctCount: items.filter((item) => isCorrect(item, values[item.id] ?? '')).length,
        total: items.length,
      },
    })
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={1}
      totalSteps={1}
      onBack={onBack ?? (() => navigate(`/activity/${activity.id}`))}
    >
      <p className="mb-4 text-sm text-fg-muted">
        Complete each sentence. You have {items.length} gaps — Cambridge-style open cloze.
      </p>
      {items.length === 0 ? (
        <p className="rounded-2xl border border-edge bg-panel p-4 text-sm text-amber-800 dark:text-amber-200">
          This activity has no blanks configured yet. Go back and try another activity.
        </p>
      ) : null}
      <ol className="space-y-4">
        {items.map((item, index) => {
          const parts = item.sentence.split('_____')
          const result = results?.find((r) => r.id === item.id)
          return (
            <li
              key={item.id}
              className={[
                'rounded-2xl border p-4',
                checked
                  ? result?.ok
                    ? 'border-cobalt/40 bg-cobalt/5'
                    : 'border-cherry/40 bg-cherry/5'
                  : 'border-edge bg-panel',
              ].join(' ')}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-muted">
                {index + 1} / {items.length}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-base text-fg sm:text-lg">
                {parts.map((part, i) => (
                  <span key={i} className="contents">
                    <span>{part}</span>
                    {i < parts.length - 1 ? (
                      <input
                        value={values[item.id] ?? ''}
                        disabled={checked}
                        onChange={(e) =>
                          setValues((v) => ({ ...v, [item.id]: e.target.value }))
                        }
                        className="min-w-[7rem] rounded-lg border border-edge bg-surface px-2 py-1 text-center text-base text-fg"
                        aria-label={`Blank ${index + 1}`}
                      />
                    ) : null}
                  </span>
                ))}
              </div>
              {checked && result && !result.ok ? (
                <p className="mt-2 text-sm text-cherry">Answer: {result.answer}</p>
              ) : null}
            </li>
          )
        })}
      </ol>
      {!checked ? (
        <button
          type="button"
          onClick={check}
          disabled={items.length === 0}
          className="mt-6 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          Check answers
        </button>
      ) : (
        <div className="mt-6 space-y-3">
          <FeedbackBanner
            correct={score === 100}
            message={
              content.explanation ??
              (score === 100
                ? 'Perfect — all gaps correct!'
                : `You scored ${score}%. Review the highlighted answers.`)
            }
          />
          <p className="text-sm text-fg-muted">
            {results?.filter((r) => r.ok).length ?? 0} of {items.length} correct
          </p>
        </div>
      )}
    </ActivityPlayer>
  )
}
