import type { Activity, ActivityContent, ActivityDifficulty, ActivityLevel, ActivityType, Difficulty } from '@/types/activity'
import { toLegacyDifficulty } from '@/types/activity'
import type { Database, Json } from '@/lib/supabase/database.types'

type ActivityRow = Database['public']['Tables']['activities']['Row']
type ActivityInsert = Database['public']['Tables']['activities']['Insert']

export function mapRowToActivity(row: ActivityRow): Activity {
  const engineDiff = row.difficulty as ActivityDifficulty
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type as ActivityType,
    level: row.level as ActivityLevel,
    difficulty: toLegacyDifficulty(engineDiff),
    duration: row.duration,
    thumbnail: row.image_url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80',
    instructions: row.instructions,
    content: (row.content ?? {}) as ActivityContent,
    audioUrl: row.audio_url,
    imageUrl: row.image_url,
    points: row.points,
    isPublished: row.is_published,
    isSystem: row.is_system,
    createdBy: row.created_by,
    audioVoiceId: row.audio_voice_id,
    audioModelId: row.audio_model_id,
    voiceName: row.voice_name,
    accent: row.accent,
    speed: row.speed != null ? Number(row.speed) : null,
  }
}

export function mapActivityToInsert(
  activity: Partial<Activity> & Pick<Activity, 'title' | 'type' | 'level' | 'difficulty'>,
  opts?: { createdBy?: string | null; isSystem?: boolean },
): ActivityInsert {
  const diff =
    activity.difficulty === 'basic' || activity.difficulty === 'easy'
      ? 'easy'
      : activity.difficulty === 'advanced' || activity.difficulty === 'hard'
        ? 'hard'
        : 'medium'

  return {
    title: activity.title,
    description: activity.description ?? '',
    type: activity.type,
    level: activity.level,
    difficulty: diff,
    instructions: activity.instructions ?? '',
    content: (activity.content ?? {}) as Json,
    audio_url: activity.audioUrl ?? null,
    image_url: activity.imageUrl ?? activity.thumbnail ?? null,
    duration: activity.duration ?? 10,
    points: activity.points ?? 10,
    is_published: activity.isPublished ?? false,
    is_system: opts?.isSystem ?? activity.isSystem ?? false,
    created_by: opts?.createdBy ?? activity.createdBy ?? null,
    audio_voice_id: activity.audioVoiceId ?? null,
    audio_model_id: activity.audioModelId ?? null,
    voice_name: activity.voiceName ?? null,
    accent: activity.accent ?? null,
    speed: activity.speed ?? 1,
  }
}

export function normalizeDifficultyFilter(d: Difficulty | ActivityDifficulty | 'all' | undefined) {
  if (!d || d === 'all') return undefined
  if (d === 'basic' || d === 'easy') return 'easy'
  if (d === 'advanced' || d === 'hard') return 'hard'
  return 'medium'
}
