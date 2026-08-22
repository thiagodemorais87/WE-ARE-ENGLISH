import { useState } from 'react'
import type { Activity } from '@/types/activity'
import { ProgressBar } from '@/components/ui/ProgressBar'

type Props = {
  activity: Activity
  step: number
  totalSteps: number
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
}

export function ActivityPlayer({
  activity,
  step,
  totalSteps,
  children,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled,
}: Props) {
  const progress = Math.round((step / totalSteps) * 100)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-soft-pink">
          {activity.type} · {activity.level}
        </p>
        <h1 className="text-2xl font-semibold text-white sm:text-3xl">{activity.title}</h1>
        <ProgressBar value={progress} />
        <p className="text-xs text-white/40">
          Step {step} of {totalSteps}
        </p>
      </header>

      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
        {children}
      </div>

      <nav className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 hover:bg-white/5"
        >
          Back
        </button>
        {onNext && (
          <button
            type="button"
            disabled={nextDisabled}
            onClick={onNext}
            className="rounded-full bg-cherry px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-40"
          >
            {nextLabel}
          </button>
        )}
      </nav>
    </div>
  )
}

export function FeedbackBanner({
  correct,
  message,
}: {
  correct: boolean | null
  message: string
}) {
  if (correct === null) return null
  return (
    <div
      className={[
        'mt-4 rounded-2xl border p-4 text-sm',
        correct
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
          : 'border-amber-400/30 bg-amber-400/10 text-amber-100',
      ].join(' ')}
    >
      {correct ? '✓ Correct!' : 'Not quite.'}
      <p className="mt-1 text-white/70">{message}</p>
    </div>
  )
}

export function ChoiceList({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[]
  value: number | null
  onChange: (index: number) => void
  disabled?: boolean
}) {
  return (
    <div className="mt-4 space-y-2">
      {options.map((opt, index) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onChange(index)}
          className={[
            'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition',
            value === index
              ? 'border-cobalt bg-cobalt/20 text-white'
              : 'border-white/10 bg-white/[0.02] text-white/75 hover:border-white/25',
          ].join(' ')}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs">
            {String.fromCharCode(65 + index)}
          </span>
          {opt}
        </button>
      ))}
    </div>
  )
}

export function useQuiz(correctIndex: number) {
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = checked ? selected === correctIndex : null

  const check = () => {
    if (selected === null) return
    setChecked(true)
  }

  const reset = () => {
    setSelected(null)
    setChecked(false)
  }

  return { selected, setSelected, checked, check, correct, reset }
}
