import { getActivityById, getActivitiesByType } from '@/data/activities'
import { systemSeedActivities } from '@/data/seed-activities'
import {
  listActivitiesFromDb,
  getActivityFromDb,
  type ActivityFilters,
} from '@/services/activities/activity.repository'
import { listAttemptsForUser } from '@/services/activities/attempt.service'
import type { Activity, ActivityType, CefrLevel, Difficulty } from '@/types/activity'

export type { ActivityFilters }

function delay<T>(data: T, ms = 200): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

export async function listActivities(filters: ActivityFilters = {}): Promise<Activity[]> {
  return listActivitiesFromDb(filters)
}

export async function fetchActivity(id: string): Promise<Activity | null> {
  return getActivityFromDb(id)
}

export async function fetchByCategory(categoryId: string): Promise<Activity[]> {
  try {
    if (categoryId === 'trending') {
      const all = await listActivitiesFromDb({})
      return all.slice(0, 12)
    }

    // Map carousel ids → activity types (videos → video, games → game)
    const skill: ActivityType =
      categoryId === 'videos'
        ? 'video'
        : categoryId === 'games'
          ? 'game'
          : (categoryId as ActivityType)

    const fromDb = await listActivitiesFromDb({ skill })
    if (fromDb.length) return fromDb

    // Local fallbacks for legacy catalog + system seeds
    if (skill === 'video' || skill === 'game' || skill === 'music') {
      const mock = getActivitiesByType(skill)
      if (mock.length) return delay(mock)
    }
    return systemSeedActivities.filter((a) => a.type === skill)
  } catch (err) {
    console.warn(`[fetchByCategory] ${categoryId} failed:`, err)
    const skill =
      categoryId === 'videos' ? 'video' : categoryId === 'games' ? 'game' : categoryId
    return systemSeedActivities.filter((a) => a.type === skill)
  }
}

export async function fetchContinueLearning(userId?: string): Promise<Activity[]> {
  if (!userId) return delay([])
  const attempts = await listAttemptsForUser(userId)
  const incomplete = attempts.filter((a) => !a.completedAt)
  const ids = [...new Set(incomplete.map((a) => a.activityId))].slice(0, 8)
  const result: Activity[] = []
  for (const id of ids) {
    const a = await getActivityFromDb(id)
    if (a) result.push(a)
  }
  return result
}

export type GenerateChallengeInput = {
  skill: ActivityType
  level: CefrLevel
  topic: string
  difficulty: Difficulty
  duration: number
}

export async function generateChallenge(input: GenerateChallengeInput): Promise<Activity> {
  const catalog = await listActivitiesFromDb({ skill: input.skill, level: input.level })
  const match =
    catalog.find((a) => a.difficulty === input.difficulty) ??
    catalog[0] ??
    systemSeedActivities[0]

  return delay({
    ...match,
    id: `generated-${Date.now()}`,
    title: `${input.topic} Challenge`,
    description: `A custom ${input.skill} session about ${input.topic} at ${input.level}.`,
    duration: input.duration,
    difficulty: input.difficulty,
    level: input.level,
    type: input.skill,
    progress: 0,
  })
}

export { getActivityById }
