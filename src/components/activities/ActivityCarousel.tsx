import type { ReactNode } from 'react'
import { ActivityCard } from './ActivityCard'
import type { Activity } from '@/types/activity'

type Props = {
  title: string
  activities: Activity[]
  action?: ReactNode
}

export function ActivityCarousel({ title, activities, action }: Props) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 px-1">
        <h2 className="text-lg font-semibold text-white sm:text-xl">{title}</h2>
        {action}
      </div>
      {activities.length ? (
        <div className="scrollbar-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-3 snap-x snap-mandatory">
          {activities.map((activity) => (
            <div key={activity.id} className="snap-start">
              <ActivityCard activity={activity} />
            </div>
          ))}
        </div>
      ) : (
        <p className="px-1 text-sm text-white/45">No activities in this category yet.</p>
      )}
    </section>
  )
}
