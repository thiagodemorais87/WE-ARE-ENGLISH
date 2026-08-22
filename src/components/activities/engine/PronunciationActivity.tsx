import { SpeakingActivity } from './SpeakingActivity'
import type { EngineActivityProps } from './types'
import type { PronunciationContent } from '@/types/activity'

export function PronunciationActivity({ activity, onComplete, onBack }: EngineActivityProps) {
  const content = (activity.content ?? {}) as PronunciationContent
  return (
    <div className="space-y-3">
      {content.tips ? <p className="text-sm text-soft-pink">{content.tips}</p> : null}
      <SpeakingActivity
        activity={{
          ...activity,
          content: {
            prompt: `Read aloud clearly: ${content.text ?? activity.title}`,
            expectedDuration: 20,
            mode: 'read_aloud',
            referenceText: content.text,
            evaluation: {
              pronunciation: true,
              fluency: true,
              grammar: false,
              vocabulary: false,
              coherence: false,
            },
          },
        }}
        onComplete={onComplete}
        onBack={onBack}
      />
    </div>
  )
}
