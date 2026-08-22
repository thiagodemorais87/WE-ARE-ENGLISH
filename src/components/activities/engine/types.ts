import type { Activity } from '@/types/activity'

export type ActivityCompletePayload = {
  answer: Record<string, unknown>
  score: number | null
  feedback?: Record<string, unknown> | null
}

export type EngineActivityProps = {
  activity: Activity
  onComplete?: (payload: ActivityCompletePayload) => void
  onBack?: () => void
}
