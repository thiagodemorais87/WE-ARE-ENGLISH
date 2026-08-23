import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ActivityPlayer,
  ChoiceList,
  FeedbackBanner,
} from '@/components/activities/ActivityPlayer'
import type { Activity } from '@/types/activity'
import type { ActivityCompletePayload } from './types'

export type QuizQuestion = {
  id?: string
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
  passage?: string
}

type Props = {
  activity: Activity
  questions: QuizQuestion[]
  header?: React.ReactNode
  onComplete?: (payload: ActivityCompletePayload) => void
  onBack?: () => void
}

export function MultiQuestionQuiz({
  activity,
  questions,
  header,
  onComplete,
  onBack,
}: Props) {
  const navigate = useNavigate()
  const list = questions.length > 0 ? questions : [{
    question: activity.title,
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 0,
  }]
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [answers, setAnswers] = useState<number[]>([])

  const q = list[step]
  const correct = selected === q.correctIndex
  const goBack = onBack ?? (() => navigate(-1))

  const check = () => {
    if (selected === null) return
    setChecked(true)
    const point = selected === q.correctIndex ? 100 : 0
    const nextScores = [...scores, point]
    const nextAnswers = [...answers, selected]
    setScores(nextScores)
    setAnswers(nextAnswers)

    if (step >= list.length - 1) {
      const avg = Math.round(nextScores.reduce((a, b) => a + b, 0) / nextScores.length)
      onComplete?.({
        answer: { answers: nextAnswers, scores: nextScores },
        score: avg,
        feedback: { totalQuestions: list.length },
      })
    }
  }

  const next = () => {
    if (step < list.length - 1) {
      setStep((s) => s + 1)
      setSelected(null)
      setChecked(false)
    }
  }

  const done = checked && step >= list.length - 1
  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null

  return (
    <ActivityPlayer
      activity={activity}
      step={step + 1}
      totalSteps={list.length}
      onBack={goBack}
      onNext={checked && !done ? next : undefined}
      nextLabel={step < list.length - 1 ? 'Next question' : 'Done'}
      nextDisabled={!checked}
    >
      {header}
      {q.passage ? (
        <p className="mb-4 whitespace-pre-wrap rounded-xl bg-panel p-4 text-sm text-fg/80">
          {q.passage}
        </p>
      ) : null}
      <p className="font-medium text-fg">{q.question}</p>
      <ChoiceList
        options={q.options}
        value={selected}
        onChange={setSelected}
        disabled={checked}
      />
      {!checked ? (
        <button
          type="button"
          onClick={check}
          disabled={selected === null}
          className="mt-5 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          Check
        </button>
      ) : (
        <FeedbackBanner
          correct={correct}
          message={
            q.explanation ??
            (correct
              ? 'Correct!'
              : `Answer: ${q.options[q.correctIndex] ?? '—'}`)
          }
        />
      )}
      {done && avg != null ? (
        <p className="mt-4 text-sm text-soft-pink">
          Quiz complete · score {avg}% ({scores.filter((s) => s === 100).length}/
          {list.length} correct)
        </p>
      ) : null}
    </ActivityPlayer>
  )
}

/** Known dead / non-embeddable IDs previously used in seeds (includes live streams) */
const BROKEN_YOUTUBE_IDS = new Set(['yCQOj2LQ1to', '0VsyckzBTfE', 'rfscVS0vtbw', 'jfKfPfyJRdk'])

const SAFE_YOUTUBE_FALLBACK = 'https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?rel=0&modestbranding=1'

export function youtubeEmbedUrl(
  url?: string | null,
  fallback: string = SAFE_YOUTUBE_FALLBACK,
): string {
  const normalize = (id: string) =>
    `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`

  if (!url?.trim()) return fallback
  const raw = url.trim()

  const embedId =
    raw.match(/youtube(?:-nocookie)?\.com\/embed\/([^?&/#]+)/)?.[1] ??
    raw.match(/[?&]v=([^&]+)/)?.[1] ??
    raw.match(/youtu\.be\/([^?&/#]+)/)?.[1] ??
    (/^[\w-]{11}$/.test(raw) ? raw : null)

  if (!embedId || BROKEN_YOUTUBE_IDS.has(embedId)) {
    // Prefer caller fallback (music vs video), else safe default
    const fbId =
      fallback.match(/embed\/([^?&/#]+)/)?.[1] ??
      (/^[\w-]{11}$/.test(fallback) ? fallback : null)
    if (fbId && !BROKEN_YOUTUBE_IDS.has(fbId)) return normalize(fbId)
    return SAFE_YOUTUBE_FALLBACK
  }

  return normalize(embedId)
}
