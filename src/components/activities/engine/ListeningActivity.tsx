import { useNavigate } from 'react-router-dom'
import { ListeningPlayer } from './ListeningPlayer'
import { MultiQuestionQuiz, type QuizQuestion } from './MultiQuestionQuiz'
import type { EngineActivityProps } from './types'
import type { ListeningContent } from '@/types/activity'

function toQuestions(content: ListeningContent, title: string): QuizQuestion[] {
  if (content.questions?.length) {
    return content.questions.map((q, i) => ({
      id: q.id ?? `q${i}`,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      passage: q.passage,
    }))
  }
  const options = content.options ?? ['Option A', 'Option B', 'Option C', 'Option D']
  let correctIndex = 0
  if (typeof content.correctAnswer === 'number') correctIndex = content.correctAnswer
  else if (typeof content.correctAnswer === 'string') {
    const idx = options.findIndex((o) => o === content.correctAnswer)
    correctIndex = idx >= 0 ? idx : 0
  }
  return [
    {
      question: content.question ?? `What is the main idea of “${title}”?`,
      options,
      correctIndex,
      explanation: content.explanation,
    },
  ]
}

export function ListeningActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as ListeningContent
  const questions = toQuestions(content, activity.title)

  return (
    <MultiQuestionQuiz
      activity={activity}
      questions={questions}
      onComplete={onComplete}
      onBack={onBack ?? (() => navigate(-1))}
      header={
        <div className="mb-6 space-y-3">
          {activity.instructions ? (
            <p className="text-sm text-fg/65">{activity.instructions}</p>
          ) : null}
          <ListeningPlayer
            src={activity.audioUrl}
            speakText={content.audioText ?? content.transcript}
            title="Listening audio"
          />
          {(content.audioText || content.transcript) && (
            <details className="rounded-xl bg-panel p-3 text-sm text-fg-muted">
              <summary className="cursor-pointer text-soft-pink">Show transcript</summary>
              <p className="mt-2 italic">{content.transcript ?? content.audioText}</p>
            </details>
          )}
        </div>
      }
    />
  )
}
