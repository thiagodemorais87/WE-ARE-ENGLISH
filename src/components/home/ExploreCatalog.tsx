import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActivityCarousel } from '@/components/activities/ActivityCarousel'
import { carouselCategories } from '@/data/categories'
import { fetchByCategory } from '@/services/activities/activity.service'
import { systemSeedActivities } from '@/data/seed-activities'
import { activities as mockCatalog } from '@/data/activities'
import type { Activity, ActivityType } from '@/types/activity'
import { useAuth } from '@/contexts/AuthContext'
import { games } from '@/data/games'
import { GameCard } from '@/components/activities/GameCard'
import { FadeContent } from '@/components/motion/FadeContent'
import { BlurText } from '@/components/motion/BlurText'

function localByCategory(categoryId: string): Activity[] {
  const all = [...systemSeedActivities, ...mockCatalog]
  if (categoryId === 'trending') return all.slice(0, 12)
  const skill: ActivityType =
    categoryId === 'videos' ? 'video' : categoryId === 'games' ? 'game' : (categoryId as ActivityType)
  return all.filter((a) => a.type === skill)
}

function initialRows(): Record<string, Activity[]> {
  return Object.fromEntries(carouselCategories.map((cat) => [cat.id, localByCategory(cat.id)]))
}

export function ExploreCatalog() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState<Record<string, Activity[]>>(initialRows)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const settled = await Promise.allSettled(
        carouselCategories.map(async (cat) => {
          const remote = await fetchByCategory(cat.id)
          // Keep local seeds if remote is empty (common when DB seed failed)
          const local = localByCategory(cat.id)
          return [cat.id, remote.length ? remote : local] as const
        }),
      )
      if (cancelled) return
      const next: Record<string, Activity[]> = { ...initialRows() }
      for (let i = 0; i < settled.length; i++) {
        const id = carouselCategories[i]!.id
        const result = settled[i]!
        if (result.status === 'fulfilled') {
          next[id] = result.value[1]
        }
      }
      setRows(next)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="explore" className="bg-ink text-sand">
      <div className="container-wide space-y-10 px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <BlurText
              text="Explore our activities"
              className="display text-3xl text-white sm:text-4xl"
              as="h2"
            />
            <p className="mt-2 text-white/55">
              {isAuthenticated
                ? 'Pick a category and start practicing.'
                : 'Preview the catalog — create an account to unlock activities.'}
            </p>
          </div>
          {isAuthenticated && (
            <Link to="/activities" className="text-sm font-semibold text-soft-pink hover:underline">
              See all →
            </Link>
          )}
        </div>

        {carouselCategories.map((cat, index) => (
          <FadeContent key={cat.id} delay={0.04 * index}>
            <ActivityCarousel title={cat.label} activities={rows[cat.id] ?? []} />
          </FadeContent>
        ))}

        <FadeContent className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-white">Interactive Games</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login')
                    return
                  }
                  const target = game.activityId ?? game.id
                  navigate(`/activity/${target}/play`)
                }}
              />
            ))}
          </div>
        </FadeContent>
      </div>
    </section>
  )
}
