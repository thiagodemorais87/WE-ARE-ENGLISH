import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ActivityPlayer,
  ChoiceList,
  FeedbackBanner,
} from '@/components/activities/ActivityPlayer'
import type { Activity } from '@/types/activity'
import type { ActivityCompletePayload } from './types'
import { checkQuizAnswer } from '@/services/activities/attempt.service'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export type QuizQuestion = {
  id?: string
  question: string
  options: string[]
  /** Present only offline / staff; students get feedback via RPC. */
  correctIndex?: number
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
  const list =
    questions.length > 0
      ? questions
      : [
          {
            question: activity.title,
            options: ['A', 'B', 'C', 'D'],
            correctIndex: 0,
          },
        ]
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [checking, setChecking] = useState(false)
  const [scores, setScores] = useState<number[]>([])
  const [answers, setAnswers] = useState<number[]>([])
  const [lastResult, setLastResult] = useState<{
    correct: boolean
    correctIndex: number
    explanation: string
    correctOption: string
  } | null>(null)

  const q = list[step]
  const goBack = onBack ?? (() => navigate(-1))

  const check = async () => {
    if (selected === null || checking) return
    setChecking(true)
    try {
      let result: {
        correct: boolean
        correctIndex: number
        explanation: string
        correctOption: string
      }

      if (isSupabaseConfigured && typeof q.correctIndex !== 'number') {
        result = await checkQuizAnswer(activity.id, step, selected)
      } else {
        const correctIndex = q.correctIndex ?? 0
        const correct = selected === correctIndex
        result = {
          correct,
          correctIndex,
          explanation: q.explanation ?? '',
          correctOption: q.options[correctIndex] ?? '',
        }
      }

      setLastResult(result)
      setChecked(true)
      const point = result.correct ? 100 : 0
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
    } catch {
      setLastResult({
        correct: false,
        correctIndex: -1,
        explanation: 'Could not verify answer. Try again.',
        correctOption: '',
      })
      setChecked(true)
    } finally {
      setChecking(false)
    }
  }

  const next = () => {
    if (step < list.length - 1) {
      setStep((s) => s + 1)
      setSelected(null)
      setChecked(false)
      setLastResult(null)
    }
  }

  const done = checked && step >= list.length - 1
  const avg =
    scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const correct = lastResult?.correct ?? false

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
        disabled={checked || checking}
      />
      {!checked ? (
        <button
          type="button"
          onClick={() => void check()}
          disabled={selected === null || checking}
          className="mt-5 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          {checking ? 'Checking…' : 'Check'}
        </button>
      ) : (
        <FeedbackBanner
          correct={correct}
          message={
            lastResult?.explanation ||
            (correct
              ? 'Correct!'
              : `Answer: ${lastResult?.correctOption || q.options[lastResult?.correctIndex ?? 0] || '—'}`)
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
const BROKEN_YOUTUBE_IDS = new Set([
  'yCQOj2LQ1to',
  '0VsyckzBTfE',
  'rfscVS0vtbw',
  'jfKfPfyJRdk',
  '0gu3MSatfo4',
])

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
    const fbId =
      fallback.match(/embed\/([^?&/#]+)/)?.[1] ??
      (/^[\w-]{11}$/.test(fallback) ? fallback : null)
    if (fbId && !BROKEN_YOUTUBE_IDS.has(fbId)) return normalize(fbId)
    return SAFE_YOUTUBE_FALLBACK
  }

  return normalize(embedId)
}
