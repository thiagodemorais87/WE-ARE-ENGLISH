import { activities as mockCatalog } from '@/data/activities'
import { systemSeedActivities } from '@/data/seed-activities'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { Activity, ActivityType, CefrLevel, Difficulty } from '@/types/activity'
import { mapActivityToInsert, mapRowToActivity, normalizeDifficultyFilter } from './activity.mapper'
import type { Database, Json } from '@/lib/supabase/database.types'

type ActivityUpdate = Database['public']['Tables']['activities']['Update']


export type ActivityFilters = {
  query?: string
  skill?: ActivityType | 'all'
  level?: CefrLevel | 'all'
  difficulty?: Difficulty | 'all'
  duration?: 'all' | '5' | '10' | '15'
  includeUnpublished?: boolean
  createdBy?: string
}

function catalogKey(a: Activity): string {
  return `${a.type}:${a.title.trim().toLowerCase()}`
}

/** Prefer system seeds (sys-*) when type+title collide; skip hollow mock entries. */
function localCatalog(): Activity[] {
  const byKey = new Map<string, Activity>()
  const mocks = mockCatalog.filter((a) => {
    if (a.type === 'listening' || a.type === 'reading') {
      const c = a.content as Record<string, unknown> | undefined
      return Boolean(c && (c.audioText || c.transcript || c.passage || c.text || c.questions))
    }
    return true
  })
  for (const a of [...mocks, ...systemSeedActivities]) {
    const key = catalogKey(a)
    const existing = byKey.get(key)
    if (!existing || a.id.startsWith('sys-')) {
      byKey.set(key, a)
    }
  }
  return [...byKey.values()]
}

function filterLocal(list: Activity[], filters: ActivityFilters): Activity[] {
  let result = [...list]
  if (!filters.includeUnpublished) {
    result = result.filter((a) => a.isPublished !== false)
  }
  if (filters.skill && filters.skill !== 'all') {
    result = result.filter((a) => a.type === filters.skill)
  }
  if (filters.level && filters.level !== 'all') {
    result = result.filter((a) => a.level === filters.level)
  }
  if (filters.difficulty && filters.difficulty !== 'all') {
    const want = normalizeDifficultyFilter(filters.difficulty)
    result = result.filter((a) => normalizeDifficultyFilter(a.difficulty) === want)
  }
  if (filters.duration && filters.duration !== 'all') {
    const max = Number(filters.duration)
    if (filters.duration === '15') {
      result = result.filter((a) => a.duration >= 15)
    } else {
      result = result.filter((a) => a.duration <= max)
    }
  }
  if (filters.createdBy) {
    result = result.filter((a) => a.createdBy === filters.createdBy)
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase()
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.type.includes(q),
    )
  }
  return result
}

/**
 * Prefer DB rows, but always fill gaps from local system seeds.
 * Protects the UI when remote seed failed (e.g. type CHECK rejected music/video/game
 * and aborted the whole INSERT after deleting system rows).
 */
function mergeWithLocalSeeds(fromDb: Activity[], filters: ActivityFilters): Activity[] {
  const local = filterLocal(localCatalog(), filters)
  if (!fromDb.length) return local

  const byKey = new Map<string, Activity>()
  for (const a of fromDb) {
    byKey.set(catalogKey(a), a)
    byKey.set(a.id, a)
  }
  for (const a of local) {
    const key = catalogKey(a)
    if (!byKey.has(key) && !byKey.has(a.id)) {
      byKey.set(key, a)
    }
  }

  const merged = [...byKey.values()].filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)

  if (filters.skill && filters.skill !== 'all') {
    const forSkill = merged.filter((a) => a.type === filters.skill)
    return forSkill.length ? forSkill : local
  }
  return merged
}

export async function listActivitiesFromDb(filters: ActivityFilters = {}): Promise<Activity[]> {
  const local = filterLocal(localCatalog(), filters)
  if (!supabase || !isSupabaseConfigured) {
    return local
  }

  try {
    let query = supabase.from('activities').select('*')

    if (!filters.includeUnpublished) {
      query = query.eq('is_published', true)
    }
    if (filters.skill && filters.skill !== 'all') {
      query = query.eq('type', filters.skill)
    }
    if (filters.level && filters.level !== 'all') {
      query = query.eq('level', filters.level)
    }
    const diff = normalizeDifficultyFilter(filters.difficulty)
    if (diff) query = query.eq('difficulty', diff)
    if (filters.createdBy) query = query.eq('created_by', filters.createdBy)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) {
      console.warn('[activities] DB list failed, using local seeds:', error.message)
      return local
    }

    let list = (data ?? []).map(mapRowToActivity)
    if (filters.duration && filters.duration !== 'all') {
      list = filterLocal(list, { duration: filters.duration, includeUnpublished: true })
    }
    if (filters.query?.trim()) {
      list = filterLocal(list, { query: filters.query, includeUnpublished: true })
    }

    return mergeWithLocalSeeds(list, filters)
  } catch (err) {
    console.warn('[activities] DB list threw, using local seeds:', err)
    return local
  }
}

export async function getActivityFromDb(id: string): Promise<Activity | null> {
  if (!supabase || !isSupabaseConfigured) {
    return localCatalog().find((a) => a.id === id) ?? null
  }
  const { data, error } = await supabase.from('activities').select('*').eq('id', id).maybeSingle()
  if (error || !data) {
    return localCatalog().find((a) => a.id === id) ?? null
  }
  return mapRowToActivity(data)
}

export async function createActivity(
  input: Partial<Activity> & Pick<Activity, 'title' | 'type' | 'level' | 'difficulty'>,
  userId: string,
): Promise<Activity> {
  if (!supabase || !isSupabaseConfigured) {
    const local: Activity = {
      id: `local-${crypto.randomUUID()}`,
      title: input.title,
      description: input.description ?? '',
      type: input.type,
      level: input.level,
      difficulty: input.difficulty,
      duration: input.duration ?? 10,
      thumbnail: input.thumbnail ?? input.imageUrl ?? '',
      instructions: input.instructions,
      content: input.content,
      points: input.points ?? 10,
      isPublished: input.isPublished ?? false,
      isSystem: false,
      createdBy: userId,
    }
    return local
  }
  const payload = mapActivityToInsert(input, { createdBy: userId, isSystem: false })
  const { data, error } = await supabase.from('activities').insert(payload).select('*').single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to create activity')
  return mapRowToActivity(data)
}

export async function updateActivity(id: string, patch: Partial<Activity>): Promise<Activity> {
  if (!supabase || !isSupabaseConfigured) {
    const existing = await getActivityFromDb(id)
    if (!existing) throw new Error('Activity not found')
    return { ...existing, ...patch }
  }

  const row: ActivityUpdate = {}
  if (patch.title !== undefined) row.title = patch.title
  if (patch.description !== undefined) row.description = patch.description
  if (patch.type !== undefined) row.type = patch.type
  if (patch.level !== undefined) row.level = patch.level
  if (patch.difficulty !== undefined) {
    row.difficulty = normalizeDifficultyFilter(patch.difficulty)
  }
  if (patch.instructions !== undefined) row.instructions = patch.instructions
  if (patch.content !== undefined) row.content = patch.content as Json
  if (patch.audioUrl !== undefined) row.audio_url = patch.audioUrl
  if (patch.imageUrl !== undefined) row.image_url = patch.imageUrl
  if (patch.thumbnail !== undefined && patch.imageUrl === undefined) row.image_url = patch.thumbnail
  if (patch.duration !== undefined) row.duration = patch.duration
  if (patch.points !== undefined) row.points = patch.points
  if (patch.isPublished !== undefined) row.is_published = patch.isPublished
  if (patch.audioVoiceId !== undefined) row.audio_voice_id = patch.audioVoiceId
  if (patch.audioModelId !== undefined) row.audio_model_id = patch.audioModelId
  if (patch.voiceName !== undefined) row.voice_name = patch.voiceName
  if (patch.accent !== undefined) row.accent = patch.accent
  if (patch.speed !== undefined) row.speed = patch.speed

  const { data, error } = await supabase
    .from('activities')
    .update(row)
    .eq('id', id)
    .select('*')
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to update activity')
  return mapRowToActivity(data)
}

export async function deleteActivity(id: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return
  const { error } = await supabase.from('activities').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function duplicateActivity(
  id: string,
  userId: string,
  opts?: { reuseAudio?: boolean },
): Promise<Activity> {
  const source = await getActivityFromDb(id)
  if (!source) throw new Error('Activity not found')

  const copy: Partial<Activity> & Pick<Activity, 'title' | 'type' | 'level' | 'difficulty'> = {
    ...source,
    title: `${source.title} (Copy)`,
    isPublished: false,
    isSystem: false,
    createdBy: userId,
    audioUrl: opts?.reuseAudio === false ? null : source.audioUrl,
  }
  delete (copy as { id?: string }).id

  return createActivity(copy, userId)
}

export async function setPublished(id: string, isPublished: boolean): Promise<Activity> {
  if (!supabase || !isSupabaseConfigured) {
    const existing = await getActivityFromDb(id)
    if (!existing) throw new Error('Activity not found')
    return { ...existing, isPublished }
  }
  const { data, error } = await supabase
    .from('activities')
    .update({ is_published: isPublished })
    .eq('id', id)
    .select('*')
    .single()
  if (error || !data) throw new Error(error?.message ?? 'Failed to publish')
  return mapRowToActivity(data)
}
