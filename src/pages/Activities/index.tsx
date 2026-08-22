import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { ActivityFilter } from '@/components/activities/ActivityFilter'
import { SearchActivities } from '@/components/activities/SearchActivities'
import {
  listActivities,
  type ActivityFilters,
} from '@/services/activities/activity.service'
import type { Activity } from '@/types/activity'

export function ActivitiesPage() {
  const [params] = useSearchParams()
  const [filters, setFilters] = useState<ActivityFilters>({
    query: params.get('q') ?? '',
    skill: 'all',
    level: 'all',
    difficulty: 'all',
    duration: 'all',
  })
  const [items, setItems] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = params.get('q')
    if (q) setFilters((f) => ({ ...f, query: q }))
  }, [params])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    listActivities(filters).then((data) => {
      if (!cancelled) {
        setItems(data)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [filters])

  const countLabel = useMemo(
    () => `${items.length} activit${items.length === 1 ? 'y' : 'ies'}`,
    [items.length],
  )

  return (
    <div className="container-wide space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-4">
        <h1 className="display text-4xl text-white sm:text-5xl">Explore Activities</h1>
        <SearchActivities
          value={filters.query ?? ''}
          onChange={(query) => setFilters((f) => ({ ...f, query }))}
          className="max-w-xl"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ActivityFilter value={filters} onChange={setFilters} />
        <div>
          <p className="mb-4 text-sm text-white/45">{loading ? 'Loading…' : countLabel}</p>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/5" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {items.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} className="w-full sm:w-[240px]" />
              ))}
              {!items.length && (
                <p className="text-white/50">No activities match these filters.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
