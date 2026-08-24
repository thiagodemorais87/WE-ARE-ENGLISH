import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchActivity } from '@/services/activities/activity.service'
import { completeAttempt, getOrStartAttempt } from '@/services/activities/attempt.service'
import { useAuth } from '@/contexts/AuthContext'
import { ActivityRenderer } from '@/components/activities/engine/ActivityRenderer'
import type { Activity } from '@/types/activity'
import type { ActivityCompletePayload } from '@/components/activities/engine/types'

export function ActivityPlayPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [savedScore, setSavedScore] = useState<number | null>(null)
  const attemptIdRef = useRef<string | null>(null)
  const completedRef = useRef(false)

  useEffect(() => {
    if (!id) return
    completedRef.current = false
    attemptIdRef.current = null
    setSavedScore(null)
    fetchActivity(id).then(async (a) => {
      setActivity(a)
      if (a && user) {
        try {
          const attempt = await getOrStartAttempt(a.id, user.id)
          attemptIdRef.current = attempt.id
        } catch {
          /* local / offline */
        }
      }
    })
  }, [id, user])

  const onComplete = useCallback(async (payload: ActivityCompletePayload) => {
    if (completedRef.current) return
    completedRef.current = true
    if (attemptIdRef.current) {
      try {
        const saved = await completeAttempt(attemptIdRef.current, payload)
        setSavedScore(saved.score ?? payload.score)
      } catch {
        setSavedScore(payload.score)
      }
    } else {
      setSavedScore(payload.score)
    }
  }, [])

  const onBack = useCallback(() => {
    if (activity) navigate(`/activity/${activity.id}`)
    else navigate(-1)
  }, [activity, navigate])

  if (!activity) {
    return <div className="px-4 py-16 text-center text-fg-muted">Loading player…</div>
  }

  return (
    <div className="container-wide px-4 py-8 sm:px-6 sm:py-12">
      <Link to={`/activity/${activity.id}`} className="text-sm text-fg-muted hover:text-fg">
        ← Activity details
      </Link>
      {savedScore != null ? (
        <p className="mt-3 text-sm text-soft-pink">Attempt saved · score {savedScore}</p>
      ) : null}
      <div className="mt-6">
        <ActivityRenderer activity={activity} onComplete={onComplete} onBack={onBack} />
      </div>
    </div>
  )
}
