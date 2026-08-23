import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ActivityPlayer, FeedbackBanner } from '@/components/activities/ActivityPlayer'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { scoreWriting } from '@/lib/integrations/speechace'
import type { EngineActivityProps } from './types'
import type { WritingContent, WritingResult } from '@/types/activity'

export function WritingActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as WritingContent
  const minWords = content.minWords ?? 40
  const maxWords = content.maxWords ?? 120
  const [text, setText] = useState('')
  const [result, setResult] = useState<WritingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)

  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text])
  const tooShort = words > 0 && words < minWords
  const tooLong = words > maxWords
  const within = words >= minWords && words <= maxWords

  const localScore = (): WritingResult => ({
    score: Math.min(100, 45 + Math.round(words / 2)),
    cefr: activity.level,
    grammar: 72,
    vocabulary: 70,
    coherence: 68,
    taskResponse: within ? 82 : 55,
    feedback: within
      ? [
          'Good length for this task.',
          'Keep organizing ideas in short paragraphs.',
          'Check spelling of common words before submitting next time.',
        ]
      : [
          tooShort
            ? `Write at least ${minWords} words (you have ${words}).`
            : `Stay under ${maxWords} words (you have ${words}).`,
        ],
    corrections: [],
  })

  const submit = async () => {
    if (!within) {
      setHint(
        tooShort
          ? `Add more — minimum ${minWords} words (currently ${words}).`
          : `Shorten your text — maximum ${maxWords} words (currently ${words}).`,
      )
      return
    }
    setHint(null)
    setLoading(true)
    setError(null)
    try {
      let scored: WritingResult
      if (isSupabaseConfigured) {
        try {
          scored = await scoreWriting({ activityId: activity.id, text })
          if (!Array.isArray(scored.feedback)) {
            scored = {
              ...scored,
              feedback: scored.feedback ? [String(scored.feedback)] : localScore().feedback,
            }
          }
        } catch {
          scored = localScore()
        }
      } else {
        scored = localScore()
      }
      setResult(scored)
      onComplete?.({
        answer: { text, words },
        score: scored.score,
        feedback: scored as unknown as Record<string, unknown>,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Scoring failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ActivityPlayer
      activity={activity}
      step={1}
      totalSteps={1}
      onBack={onBack ?? (() => navigate(-1))}
    >
      <p className="text-fg/80">{content.prompt}</p>
      <p className="mt-2 text-xs text-fg-muted">
        Target {minWords}–{maxWords} words · {words} written
        {tooShort ? ' · keep writing…' : ''}
        {tooLong ? ' · a bit long' : ''}
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setHint(null)
        }}
        rows={10}
        className="mt-4 w-full rounded-2xl border border-edge bg-ink/60 p-4 text-fg outline-none focus:border-soft-pink"
        placeholder="Write your answer here…"
      />
      {hint ? <p className="mt-2 text-sm text-amber-200">{hint}</p> : null}
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
      {!result ? (
        <button
          type="button"
          onClick={submit}
          disabled={loading || words === 0}
          className="mt-5 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          {loading ? 'Scoring…' : 'Submit'}
        </button>
      ) : (
        <div className="mt-5 space-y-2">
          <FeedbackBanner
            correct={(result.score ?? 0) >= 60}
            message={`Score: ${result.score ?? '—'} · CEFR ${result.cefr ?? '—'}`}
          />
          <ul className="list-disc space-y-1 pl-5 text-sm text-fg-muted">
            {(Array.isArray(result.feedback) ? result.feedback : []).map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      )}
    </ActivityPlayer>
  )
}
