import { requireSupabase } from '@/lib/supabase/client'

export async function generateActivityAudio(activityId: string, regenerate = false) {
  const client = requireSupabase()
  const { data, error } = await client.functions.invoke('generate-audio', {
    body: { activityId, regenerate },
  })
  if (error) throw new Error(error.message)
  return data as { audioUrl: string }
}
