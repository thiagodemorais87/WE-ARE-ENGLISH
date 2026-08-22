import { Link, useNavigate } from 'react-router-dom'
import type { Activity } from '@/types/activity'
import { typeIcons, typeLabels } from '@/data/categories'
import { useAuth } from '@/contexts/AuthContext'
import { difficultyLabel } from '@/lib/labels'
import { thumbnailStyle } from '@/lib/thumbnail'

type Props = {
  activity: Activity
  className?: string
}

export function ActivityCard({ activity, className = '' }: Props) {
  const { isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  // Never flash the signup lock while auth is still resolving
  const showLock = !loading && !isAuthenticated

  const go = () => {
    if (loading) return
    if (showLock) {
      navigate('/login', { state: { from: `/activity/${activity.id}/play` } })
      return
    }
    navigate(`/activity/${activity.id}/play`)
  }

  return (
    <button
      type="button"
      onClick={go}
      className={[
        'group relative w-[220px] shrink-0 overflow-hidden rounded-2xl bg-graphite text-left shadow-soft',
        'transition-transform duration-300 hover:z-10 hover:scale-[1.04] focus-visible:scale-[1.04]',
        'sm:w-[240px]',
        className,
      ].join(' ')}
    >
      <div
        className="relative aspect-[16/10] w-full bg-graphite"
        style={thumbnailStyle(activity.thumbnail)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
        <span className="absolute left-3 top-3 rounded-md bg-ink/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
          {typeIcons[activity.type]} {typeLabels[activity.type]}
        </span>

        {!showLock && (
          <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cherry text-white shadow-lift">
              ▶
            </div>
            <p className="line-clamp-2 text-xs text-white/90">{activity.description}</p>
            <p className="mt-1 text-[11px] font-medium text-soft-pink">
              {activity.level} · {difficultyLabel(activity.difficulty)} · {activity.duration} min
            </p>
            <span className="mt-2 inline-flex w-fit rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
              Start Activity
            </span>
          </div>
        )}

        {showLock && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink/75 p-4 text-center opacity-100 transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100">
            <p className="text-sm font-medium text-white">🔒 Sign in to start this activity</p>
            <Link
              to="/login"
              state={{ from: `/activity/${activity.id}/play` }}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 rounded-full bg-cherry px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>

      <div className="space-y-1 p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-white">{activity.title}</h3>
        <p className="text-xs text-white/55">
          {difficultyLabel(activity.difficulty)} · {activity.duration} min
        </p>
        {typeof activity.progress === 'number' && activity.progress > 0 && isAuthenticated && (
          <div className="pt-1">
            <div className="mb-1 flex justify-between text-[10px] text-white/50">
              <span>Progress</span>
              <span>{activity.progress}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-cobalt"
                style={{ width: `${activity.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
