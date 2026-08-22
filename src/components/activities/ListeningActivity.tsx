import { useState } from 'react'
import type { Activity } from '@/types/activity'
import {
  ActivityPlayer,
  ChoiceList,
  FeedbackBanner,
  useQuiz,
} from './ActivityPlayer'

export function ListeningActivity({ activity }: { activity: Activity }) {
  const quiz = useQuiz(1)
  const [playing, setPlaying] = useState(false)

  return (
    <ActivityPlayer activity={activity} step={1} totalSteps={1}>
      <p className="text-lg font-medium text-white">🎧 Listen carefully</p>
      <div className="mt-4 flex items-center gap-4 rounded-2xl bg-ink/50 p-4">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-cherry text-white"
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <div className="flex-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full bg-soft-pink ${playing ? 'w-2/5' : 'w-[14%]'}`} />
          </div>
          <p className="mt-2 text-xs text-white/45">00:14 ━━━━━━━━━━━━━ 01:02</p>
        </div>
      </div>

      <p className="mt-6 font-medium text-white">What did you hear?</p>
      <ChoiceList
        options={[
          'They are booking a hotel room',
          'They are checking in for a flight',
          'They are ordering food',
          'They are renting a car',
        ]}
        value={quiz.selected}
        onChange={quiz.setSelected}
        disabled={quiz.checked}
      />

      {!quiz.checked ? (
        <button
          type="button"
          onClick={quiz.check}
          disabled={quiz.selected === null}
          className="mt-5 rounded-full bg-cobalt px-5 py-2.5 text-sm font-bold uppercase text-white disabled:opacity-40"
        >
          Check Answer
        </button>
      ) : (
        <FeedbackBanner
          correct={quiz.correct}
          message={
            quiz.correct
              ? 'Great job. You understood the main idea.'
              : 'Listen again and try one more time.'
          }
        />
      )}
    </ActivityPlayer>
  )
}
