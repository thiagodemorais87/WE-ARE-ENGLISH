import { useNavigate } from 'react-router-dom'
import { MultiQuestionQuiz } from '@/components/activities/engine/MultiQuestionQuiz'
import type { EngineActivityProps } from '@/components/activities/engine/types'
import type { MediaQuizContent } from '@/types/activity'

const GAME_QUESTIONS = [
  { question: 'Synonym of “happy”?', options: ['joyful', 'angry', 'heavy', 'silent'], correctIndex: 0 },
  { question: 'Opposite of “hot”?', options: ['cold', 'warm', 'spicy', 'loud'], correctIndex: 0 },
  { question: 'Past of “go”?', options: ['went', 'goed', 'goneing', 'goes'], correctIndex: 0 },
  { question: '“She ___ a teacher.”', options: ['is', 'are', 'am', 'be'], correctIndex: 0 },
  { question: 'Which is a fruit?', options: ['apple', 'chair', 'cloud', 'hammer'], correctIndex: 0 },
  { question: '“I have ___ finished.”', options: ['already', 'yesterday', 'neverly', 'ago'], correctIndex: 0 },
  { question: 'Plural of “child”?', options: ['children', 'childs', 'childes', 'childrens'], correctIndex: 0 },
  { question: 'A polite request starts with…', options: ['Could you…?', 'Give me now', 'You must', 'Hey you'], correctIndex: 0 },
  { question: '“Airport” relates to…', options: ['travel', 'cooking', 'gardening', 'swimming only'], correctIndex: 0 },
  { question: 'Best study habit?', options: ['Practice a little every day', 'Never review', 'Only cram once', 'Skip listening'], correctIndex: 0 },
]

export function GameActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const navigate = useNavigate()
  const content = (activity.content ?? {}) as MediaQuizContent
  const questions = content.questions?.length ? content.questions : GAME_QUESTIONS

  return (
    <div className="mx-auto max-w-4xl">
      <div
        className="mb-6 aspect-[21/9] w-full overflow-hidden rounded-3xl border border-white/10 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(120deg, rgba(210,0,1,.55), rgba(2,18,238,.45)), url(${activity.thumbnail || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80'})`,
        }}
      />
      <MultiQuestionQuiz
        activity={activity}
        questions={questions}
        onComplete={onComplete}
        onBack={onBack ?? (() => navigate(-1))}
        header={
          <p className="mb-4 text-sm text-white/60">
            Interactive battle · {questions.length} rounds
          </p>
        }
      />
    </div>
  )
}
