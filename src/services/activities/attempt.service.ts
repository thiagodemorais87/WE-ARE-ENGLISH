import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'
import type { ActivityAttempt } from '@/types/activity'
import type { Json } from '@/lib/supabase/database.types'

const LOCAL_KEY = 'wae_activity_attempts'

function readLocal(): ActivityAttempt[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as ActivityAttempt[]
  } catch {
    return []
  }
}

function writeLocal(list: ActivityAttempt[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(list))
}

function mapAttempt(row: {
  id: string
  activity_id: string
  user_id: string
  answer: Json
  score: number | null
  feedback: Json | null
  started_at: string
  completed_at: string | null
  created_at: string
}): ActivityAttempt {
  return {
    id: row.id,
    activityId: row.activity_id,
    userId: row.user_id,
    answer: (row.answer ?? {}) as Record<string, unknown>,
    score: row.score != null ? Number(row.score) : null,
    feedback: (row.feedback ?? null) as Record<string, unknown> | null,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  }
}

export async function startAttempt(activityId: string, userId: string): Promise<ActivityAttempt> {
  const startedAt = new Date().toISOString()

  if (!supabase || !isSupabaseConfigured) {
    const attempt: ActivityAttempt = {
      id: crypto.randomUUID(),
      activityId,
      userId,
      answer: {},
      score: null,
      feedback: null,
      startedAt,
      completedAt: null,
      createdAt: startedAt,
    }
    const list = readLocal()
    list.push(attempt)
    writeLocal(list)
    return attempt
  }

  const { data, error } = await supabase
    .from('activity_attempts')
    .insert({
      activity_id: activityId,
      user_id: userId,
      answer: {},
      started_at: startedAt,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to start attempt')
  return mapAttempt(data)
}

/** Reuse an open attempt for the same activity instead of creating spam rows. */
export async function getOrStartAttempt(
  activityId: string,
  userId: string,
): Promise<ActivityAttempt> {
  const existing = (await listAttemptsForUser(userId)).find(
    (a) => a.activityId === activityId && !a.completedAt,
  )
  if (existing) return existing
  return startAttempt(activityId, userId)
}

/**
 * Completes an attempt. With Supabase, score is computed server-side via RPC
 * (client-provided score is ignored). Offline demo still uses local score.
 */
export async function completeAttempt(
  attemptId: string,
  payload: {
    answer: Record<string, unknown>
    score: number | null
    feedback?: Record<string, unknown> | null
  },
): Promise<ActivityAttempt> {
  const completedAt = new Date().toISOString()

  if (!supabase || !isSupabaseConfigured) {
    const list = readLocal()
    const idx = list.findIndex((a) => a.id === attemptId)
    if (idx < 0) throw new Error('Attempt not found')
    list[idx] = {
      ...list[idx],
      answer: payload.answer,
      score: payload.score,
      feedback: payload.feedback ?? null,
      completedAt,
    }
    writeLocal(list)
    return list[idx]
  }

  const { data, error } = await supabase.rpc('complete_activity_attempt', {
    p_attempt_id: attemptId,
    p_answer: payload.answer as Json,
    p_feedback: (payload.feedback ?? null) as Json | null,
  })

  if (error || !data) throw new Error(error?.message ?? 'Failed to complete attempt')
  return mapAttempt(data as Parameters<typeof mapAttempt>[0])
}

export async function checkQuizAnswer(
  activityId: string,
  questionIndex: number,
  selectedIndex: number,
): Promise<{
  correct: boolean
  correctIndex: number
  explanation: string
  correctOption: string
}> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      correct: false,
      correctIndex: -1,
      explanation: '',
      correctOption: '',
    }
  }

  const { data, error } = await supabase.rpc('check_quiz_answer', {
    p_activity_id: activityId,
    p_question_index: questionIndex,
    p_selected_index: selectedIndex,
  })

  if (error || !data) throw new Error(error?.message ?? 'Failed to check answer')
  const d = data as Record<string, unknown>
  return {
    correct: Boolean(d.correct),
    correctIndex: Number(d.correctIndex ?? -1),
    explanation: String(d.explanation ?? ''),
    correctOption: String(d.correctOption ?? ''),
  }
}

export async function listAttemptsForUser(userId: string): Promise<ActivityAttempt[]> {
  if (!supabase || !isSupabaseConfigured) {
    return readLocal().filter((a) => a.userId === userId)
  }
  const { data, error } = await supabase
    .from('activity_attempts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data.map(mapAttempt)
}
