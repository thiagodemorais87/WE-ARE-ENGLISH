import type { LearningPack, UserProgress } from '@/types/activity'

/** Default empty progress — real stats come from activity_attempts */
export const emptyProgress: UserProgress = {
  overall: 0,
  bySkill: {
    Listening: 0,
    Writing: 0,
    Vocabulary: 0,
    Grammar: 0,
    Reading: 0,
    Music: 0,
    Videos: 0,
    Games: 0,
  },
  activitiesCompleted: 0,
  streakDays: 0,
  timePracticedMinutes: 0,
}

/** @deprecated use emptyProgress / live attempts */
export const mockProgress = emptyProgress

export const learningPacks: LearningPack[] = [
  {
    id: 'listening-starter',
    title: 'Listening Starter Pack',
    activityCount: 10,
    description: 'Build confidence with everyday conversations.',
    priceLabel: 'Free',
  },
  {
    id: 'vocab-b1',
    title: 'Vocabulary B1 Pack',
    activityCount: 15,
    description: 'Expand your intermediate word bank.',
    priceLabel: 'Free',
  },
  {
    id: 'music-challenge',
    title: 'Music Challenge Pack',
    activityCount: 8,
    description: 'Learn through songs and lyrics.',
    priceLabel: 'Free',
  },
]

/** Start with no favorites — user picks them */
export const favoriteActivityIds: string[] = []
