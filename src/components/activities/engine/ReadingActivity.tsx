import { useNavigate } from 'react-router-dom'
import { MultiQuestionQuiz, type QuizQuestion } from './MultiQuestionQuiz'
import type { EngineActivityProps } from './types'
import type { ReadingContent, VocabularyContent } from '@/types/activity'

export function ReadingActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as ReadingContent
  const questions: QuizQuestion[] = content.questions?.length
    ? content.questions
    : [
        {
          question: content.question,
          options: content.options,
          correctIndex: content.correctIndex,
          explanation: content.explanation,
          passage: content.passage,
        },
      ]

  return (
    <MultiQuestionQuiz
      activity={activity}
      questions={questions.map((q) => ({
        ...q,
        passage: q.passage ?? content.passage,
      }))}
      onComplete={onComplete}
      onBack={onBack ?? (() => navigate(-1))}
    />
  )
}

export function VocabularyActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as VocabularyContent
  const questions: QuizQuestion[] = content.questions?.length
    ? content.questions
    : [
        {
          question: content.question ?? `Meaning of “${content.word}”?`,
          options: content.options,
          correctIndex: content.correctIndex,
          explanation: content.explanation ?? content.definition,
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
