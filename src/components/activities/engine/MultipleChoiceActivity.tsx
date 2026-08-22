import { useNavigate } from 'react-router-dom'
import { MultiQuestionQuiz, type QuizQuestion } from './MultiQuestionQuiz'
import type { EngineActivityProps } from './types'
import type { GrammarContent, MultipleChoiceContent, QuizQuestionItem } from '@/types/activity'

function fromItems(items?: QuizQuestionItem[]): QuizQuestion[] | null {
  if (!items?.length) return null
  return items.map((q, i) => ({
    id: q.id ?? `q${i}`,
    question: q.question,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    passage: q.passage,
  }))
}

export function MultipleChoiceActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as MultipleChoiceContent & {
    questions?: QuizQuestionItem[]
  }
  const multi = fromItems(content.questions)
  const questions: QuizQuestion[] =
    multi ??
    [
      {
        question: content.question ?? activity.title,
        options: content.options ?? [],
        correctIndex: content.correctIndex ?? 0,
        explanation: content.explanation,
        passage: content.passage,
      },
    ]

  return (
    <MultiQuestionQuiz
      activity={activity}
      questions={questions}
      onComplete={onComplete}
      onBack={onBack ?? (() => navigate(-1))}
    />
  )
}

export function GrammarActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as GrammarContent
  const multi = fromItems(content.questions)
  const questions: QuizQuestion[] =
    multi ??
    [
      {
        question: content.prompt ?? activity.title,
        options: content.options ?? [],
        correctIndex: content.correctIndex ?? 0,
        explanation: content.explanation,
      },
    ]

  return (
    <MultiQuestionQuiz
      activity={activity}
      questions={questions}
      onComplete={onComplete}
      onBack={onBack ?? (() => navigate(-1))}
    />
  )
}
