import { Link } from 'react-router-dom'
import type { Activity } from '@/types/activity'
import { typeLabels } from '@/data/categories'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { difficultyLabel } from '@/lib/labels'
import { thumbnailStyle } from '@/lib/thumbnail'

type Props = {
  activities: Activity[]
}

export function ContinueLearning({ activities }: Props) {
  if (!activities.length) return null

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Continue Learning</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {activities.map((activity) => (
          <article
            key={activity.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.04] p-4 sm:flex-row sm:items-center"
          >
            <div
              className="h-20 w-full shrink-0 rounded-xl sm:h-24 sm:w-36"
              style={thumbnailStyle(activity.thumbnail)}
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <h3 className="truncate font-semibold text-white">{activity.title}</h3>
                <p className="text-sm text-white/50">
                  {typeLabels[activity.type]} · {activity.level} ·{' '}
                  {difficultyLabel(activity.difficulty)}
                </p>
              </div>
              <ProgressBar value={activity.progress ?? 0} />
              <p className="text-xs text-white/45">{activity.progress ?? 0}% complete</p>
            </div>
            <Link
              to={`/activity/${activity.id}/play`}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-cherry px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
            >
              Continue
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
