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
import type { ActivityType, CefrLevel } from '@/types/activity'

function parseSkill(raw: string | null): ActivityFilters['skill'] {
  if (!raw || raw === 'all') return 'all'
  return raw as ActivityType
}

function parseLevel(raw: string | null): ActivityFilters['level'] {
  if (!raw || raw === 'all') return 'all'
  return raw as CefrLevel
}

export function ActivitiesPage() {
  const [params] = useSearchParams()
  const [filters, setFilters] = useState<ActivityFilters>({
    query: params.get('q') ?? '',
    skill: parseSkill(params.get('skill')),
    level: parseLevel(params.get('level')),
    difficulty: 'all',
    duration: 'all',
  })
  const [items, setItems] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setFilters((f) => ({
      ...f,
      query: params.get('q') ?? '',
      skill: params.has('skill') ? parseSkill(params.get('skill')) : f.skill,
      level: params.has('level') ? parseLevel(params.get('level')) : f.level,
    }))
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
        <h1 className="display text-4xl text-fg sm:text-5xl">Explore Activities</h1>
        <SearchActivities
          value={filters.query ?? ''}
          onChange={(query) => setFilters((f) => ({ ...f, query }))}
          className="max-w-xl"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <ActivityFilter value={filters} onChange={setFilters} />
        <div>
          <p className="mb-4 text-sm text-fg-muted">{loading ? 'Loading…' : countLabel}</p>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-panel" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {items.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} className="w-full sm:w-[240px]" />
              ))}
              {!items.length && (
                <p className="text-fg-muted">No activities match these filters.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
