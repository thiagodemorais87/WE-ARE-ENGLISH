import { requireSupabase } from '@/lib/supabase/client'
import type { SpeakingResult, WritingResult } from '@/types/activity'

export async function scoreSpeaking(payload: {
  activityId: string
  audioBase64: string
  mimeType?: string
  referenceText?: string
}): Promise<SpeakingResult> {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke('score-speaking', {
    body: {
      activityId: payload.activityId,
      audioBase64: payload.audioBase64,
      mimeType: payload.mimeType,
      referenceText: payload.referenceText,
    },
  })
  if (error) throw new Error(error.message)
  const d = data as Record<string, unknown>
  return {
    success: Boolean(d.success ?? true),
    score: (d.score as number | null) ?? null,
    cefr: (d.cefr as string | null) ?? null,
    pronunciation: (d.pronunciation as number | null) ?? null,
    fluency: (d.fluency as number | null) ?? null,
    grammar: (d.grammar as number | null) ?? null,
    vocabulary: (d.vocabulary as number | null) ?? null,
    coherence: (d.coherence as number | null) ?? null,
    transcript: (d.transcript as string | null) ?? null,
    feedback: (d.feedback as string[]) ?? [],
    wordScores: ((d.wordScores as { word: string; score: number | null }[]) ?? []).map((w) => ({
      word: w.word,
      score: w.score,
    })),
  }
}

export async function scoreWriting(payload: {
  activityId: string
  text: string
}): Promise<WritingResult> {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke('score-writing', {
    body: payload,
  })
  if (error) throw new Error(error.message)
  const d = data as Record<string, unknown>
  return {
    score: (d.score as number | null) ?? null,
    cefr: (d.cefr as string | null) ?? null,
    grammar: (d.grammar as number | null) ?? null,
    vocabulary: (d.vocabulary as number | null) ?? null,
    coherence: (d.coherence as number | null) ?? null,
    taskResponse: (d.taskResponse as number | null) ?? null,
    feedback: (d.feedback as string[]) ?? [],
    corrections:
      (d.corrections as { original: string; corrected: string; explanation: string }[]) ?? [],
  }
}
