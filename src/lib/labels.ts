import type { ActivityDifficulty, Difficulty } from '@/types/activity'
import { toLegacyDifficulty } from '@/types/activity'

export const difficultyMeta: Record<
  Difficulty,
  { label: string; subtitle: string }
> = {
  basic: { label: 'Basic', subtitle: 'Beginner' },
  intermediate: { label: 'Intermediate', subtitle: 'Recommended' },
  advanced: { label: 'Advanced', subtitle: 'Challenge' },
}

export function difficultyLabel(d: Difficulty | ActivityDifficulty): string {
  const legacy =
    d === 'easy' || d === 'medium' || d === 'hard' ? toLegacyDifficulty(d) : d
  return difficultyMeta[legacy].label
}

export function greetingForHour(date = new Date()): string {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
