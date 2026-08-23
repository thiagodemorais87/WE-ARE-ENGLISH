import { Link } from 'react-router-dom'
import type { Activity } from '@/types/activity'
import { typeIcons, typeLabels } from '@/data/categories'
import { useAuth } from '@/contexts/AuthContext'

type Props = {
  activity: Activity | null
  completedToday?: boolean
  loading?: boolean
}

export function DailyChallenge({ activity, completedToday = false, loading }: Props) {
  const { isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div className="h-36 animate-pulse rounded-3xl border border-edge bg-panel" />
    )
  }

  if (!activity) return null

  const startTo = isAuthenticated
    ? `/activity/${activity.id}`
    : '/login'
  const startState = isAuthenticated
    ? { from: '/' }
    : { from: `/activity/${activity.id}` }

  const blurb =
    activity.type === 'listening'
      ? 'Listen carefully and complete the practice.'
      : activity.type === 'fill_blank'
        ? 'Complete the missing words in today’s sentences.'
        : activity.description

  return (
    <section className="relative overflow-hidden rounded-3xl border border-edge bg-graphite p-6 text-white sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(2,18,238,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgb(210,0,1,0.28),transparent_50%)]"
        aria-hidden
      />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-soft-pink">
            Today&apos;s Challenge
          </p>
          <h2 className="display text-3xl text-white sm:text-4xl">{activity.title}</h2>
          <p className="max-w-xl text-sm text-white/75">
            {typeIcons[activity.type]} {blurb}
          </p>
          <p className="text-sm font-medium text-white/60">
            {typeLabels[activity.type]} · {activity.duration} minute
            {activity.duration === 1 ? '' : 's'}
            {completedToday ? ' · Completed today ✓' : ''}
          </p>
        </div>
        <Link
          to={startTo}
          state={startState}
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lift hover:bg-cherry/90"
        >
          {completedToday ? 'Practice again' : 'Start Challenge'}
        </Link>
      </div>
    </section>
  )
}
