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
      <h2 className="text-xl font-semibold text-fg">Continue Learning</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {activities.map((activity) => {
          const progress = activity.progress ?? 0
          const inProgress = progress === 35
          const label = inProgress
            ? 'In progress — pick up where you left off'
            : `Last score ${progress}%`
          return (
            <article
              key={activity.id}
              className="flex flex-col gap-3 rounded-2xl border border-edge bg-panel p-4 sm:flex-row sm:items-center"
            >
              <div
                className="h-20 w-full shrink-0 rounded-xl sm:h-24 sm:w-36"
                style={thumbnailStyle(activity.thumbnail, activity.type)}
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <h3 className="truncate font-semibold text-fg">{activity.title}</h3>
                  <p className="text-sm text-fg-muted">
                    {typeLabels[activity.type]} · {activity.level} ·{' '}
                    {difficultyLabel(activity.difficulty)}
                  </p>
                </div>
                <ProgressBar value={progress} />
                <p className="text-xs text-fg-muted">{label}</p>
              </div>
              <Link
                to={
                  inProgress
                    ? `/activity/${activity.id}/play`
                    : `/activity/${activity.id}`
                }
                className="inline-flex shrink-0 items-center justify-center rounded-full bg-cherry px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white"
              >
                {inProgress ? 'Continue' : 'Review'}
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
