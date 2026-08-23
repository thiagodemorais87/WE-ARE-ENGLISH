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

function localDayKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function hashDay(key: string): number {
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0
  }
  return h
}

/**
 * Stable daily pick from short listening / fill_blank activities.
 * Same calendar day → same activity for everyone.
 */
export async function getDailyChallenge(date = new Date()): Promise<Activity | null> {
  const day = localDayKey(date)
  const all = await listActivitiesFromDb({})
  const pool = all.filter(
    (a) =>
      (a.type === 'listening' || a.type === 'fill_blank') &&
      a.isPublished !== false &&
      a.duration <= 10,
  )
  const fallback = all.filter(
    (a) => (a.type === 'listening' || a.type === 'fill_blank') && a.isPublished !== false,
  )
  const list = pool.length ? pool : fallback.length ? fallback : all
  if (!list.length) return null
  const index = hashDay(day) % list.length
  return list[index] ?? null
}

export async function isDailyChallengeCompletedToday(
  userId: string,
  activityId: string,
  date = new Date(),
): Promise<boolean> {
  const day = localDayKey(date)
  const attempts = await listAttemptsForUser(userId)
  return attempts.some((a) => {
    if (a.activityId !== activityId || !a.completedAt) return false
    const completedDay = localDayKey(new Date(a.completedAt))
    return completedDay === day
  })
}

export async function fetchContinueLearning(userId?: string): Promise<Activity[]> {
  if (!userId) return delay([])
  const attempts = await listAttemptsForUser(userId)
  const incomplete = attempts.filter((a) => !a.completedAt)
  // Prefer most recently started incomplete attempts; one card per activity
  const seen = new Set<string>()
  const ordered: typeof incomplete = []
  for (const a of incomplete) {
    if (seen.has(a.activityId)) continue
    seen.add(a.activityId)
    ordered.push(a)
  }
  const slice = ordered.slice(0, 8)
  const result: Activity[] = []
  for (const attempt of slice) {
    const a = await getActivityFromDb(attempt.activityId)
    if (a) {
      result.push({
        ...a,
        // In-progress sessions show mid progress until completed
        progress: 35,
      })
    }
  }
  // If nothing in progress, show recently completed so the home still has history
  if (!result.length) {
    const done = attempts.filter((a) => a.completedAt).slice(0, 6)
    for (const attempt of done) {
      if (seen.has(attempt.activityId)) continue
      seen.add(attempt.activityId)
      const a = await getActivityFromDb(attempt.activityId)
      if (a) {
        result.push({
          ...a,
          progress: typeof attempt.score === 'number' ? attempt.score : 100,
        })
      }
    }
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
