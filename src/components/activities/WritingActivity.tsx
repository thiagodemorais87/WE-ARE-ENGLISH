import { useMemo, useState } from 'react'
import type { Activity } from '@/types/activity'
import { ActivityPlayer } from './ActivityPlayer'
import { scoreWriting } from '@/services/activities/ai.service'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function WritingActivity({ activity }: { activity: Activity }) {
  const [text, setText] = useState('')
  const [scores, setScores] = useState<Awaited<ReturnType<typeof scoreWriting>> | null>(null)
  const [loading, setLoading] = useState(false)
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean).length, [text])

  const submit = async () => {
    setLoading(true)
    const result = await scoreWriting(text)
    setScores(result)
    setLoading(false)
  }

  return (
    <ActivityPlayer activity={activity} step={1} totalSteps={1}>
      <p className="text-lg font-medium text-white">✍️ Writing Challenge</p>
      <p className="mt-2 text-white/60">
        Write a short email to your friend about your weekend.
      </p>
      <p className="mt-1 text-sm text-white/40">Minimum: 50 words</p>

      {!scores ? (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="field mt-4 resize-y"
            placeholder="Hi Sam, this weekend I..."
          />
          <p className="mt-2 text-xs text-white/45">
            {words} / 50 words
          </p>
          <button
            type="button"
            disabled={words < 50 || loading}
            onClick={submit}
            className="mt-4 rounded-full bg-cherry px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
          >
            {loading ? 'Submitting…' : 'Submit'}
          </button>
        </>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-white">Your answer has been submitted.</p>
          {(
            [
              ['Grammar', scores.grammar],
              ['Vocabulary', scores.vocabulary],
              ['Structure', scores.structure],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <ProgressBar value={value} barClassName="bg-cobalt" />
            </div>
          ))}
          <p className="text-sm text-white/55">{scores.feedback}</p>
        </div>
      )}
    </ActivityPlayer>
  )
}
