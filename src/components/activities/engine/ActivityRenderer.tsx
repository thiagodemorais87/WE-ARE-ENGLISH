import type { ComponentType } from 'react'
import type { ActivityType } from '@/types/activity'
import type { EngineActivityProps } from './types'
import { ListeningActivity } from './ListeningActivity'
import { SpeakingActivity } from './SpeakingActivity'
import { PronunciationActivity } from './PronunciationActivity'
import { WritingActivity } from './WritingActivity'
import { ReadingActivity, VocabularyActivity } from './ReadingActivity'
import { MultipleChoiceActivity, GrammarActivity } from './MultipleChoiceActivity'
import { FillBlankActivity } from './FillBlankActivity'
import { WordOrderActivity } from './WordOrderActivity'
import { MatchingActivity } from './MatchingActivity'
import { TrueFalseActivity } from './TrueFalseActivity'
import { MusicActivity } from '@/components/activities/MusicActivity'
import { VideoActivity } from '@/components/activities/VideoActivity'
import { GameActivity } from '@/components/activities/SkillActivities'

const registry: Partial<Record<ActivityType, ComponentType<EngineActivityProps>>> = {
  listening: ListeningActivity,
  speaking: SpeakingActivity,
  pronunciation: PronunciationActivity,
  writing: WritingActivity,
  reading: ReadingActivity,
  multiple_choice: MultipleChoiceActivity,
  fill_blank: FillBlankActivity,
  word_order: WordOrderActivity,
  matching: MatchingActivity,
  true_false: TrueFalseActivity,
  vocabulary: VocabularyActivity,
  grammar: GrammarActivity,
}

function LegacyMusic({ activity, onComplete, onBack }: EngineActivityProps) {
  return <MusicActivity activity={activity} onComplete={onComplete} onBack={onBack} />
}
function LegacyVideo({ activity, onComplete, onBack }: EngineActivityProps) {
  return <VideoActivity activity={activity} onComplete={onComplete} onBack={onBack} />
}
function LegacyGame({ activity, onComplete, onBack }: EngineActivityProps) {
  return <GameActivity activity={activity} onComplete={onComplete} onBack={onBack} />
}

registry.music = LegacyMusic
registry.video = LegacyVideo
registry.game = LegacyGame

export function ActivityRenderer({ activity, onComplete, onBack }: EngineActivityProps) {
  const Comp = registry[activity.type]
  if (!Comp) {
    return (
      <div className="rounded-2xl border border-white/10 p-6 text-white/70">
        Unsupported activity type: {activity.type}
      </div>
    )
  }
  return <Comp activity={activity} onComplete={onComplete} onBack={onBack} />
}

export function getRegisteredActivityTypes(): ActivityType[] {
  return Object.keys(registry) as ActivityType[]
}
