import { useEffect, useRef, type ReactNode } from 'react'
import { ActivityCard } from './ActivityCard'
import type { Activity } from '@/types/activity'

type Props = {
  title: string
  activities: Activity[]
  action?: ReactNode
}

export function ActivityCarousel({ title, activities, action }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null)
  const activityKey = activities.map((a) => a.id).join('|')

  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const reset = () => {
      el.scrollLeft = 0
    }

    reset()
    const raf = requestAnimationFrame(() => {
      reset()
      requestAnimationFrame(reset)
    })

    return () => cancelAnimationFrame(raf)
  }, [activityKey])

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 px-1">
        <h2 className="text-lg font-semibold text-fg sm:text-xl">{title}</h2>
        {action}
      </div>
      {activities.length ? (
        <div
          ref={trackRef}
          dir="ltr"
          className="scrollbar-thin -mx-1 flex gap-3 overflow-x-auto px-1 pb-3 snap-x snap-proximity"
        >
          {activities.map((activity) => (
            <div key={activity.id} className="snap-start">
              <ActivityCard activity={activity} />
            </div>
          ))}
        </div>
      ) : (
        <p className="px-1 text-sm text-fg-muted">No activities in this category yet.</p>
      )}
    </section>
  )
}
