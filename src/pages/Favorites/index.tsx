import { useMemo } from 'react'
import { ActivityCard } from '@/components/activities/ActivityCard'
import { activities } from '@/data/activities'
import { usePlatform } from '@/contexts/PlatformContext'

export function FavoritesPage() {
  const { favorites } = usePlatform()
  const items = useMemo(
    () => activities.filter((a) => favorites.includes(a.id)),
    [favorites],
  )

  return (
    <div className="container-wide space-y-8 px-4 py-10 sm:px-6">
      <h1 className="display text-4xl text-white sm:text-5xl">Your Favorite Activities</h1>
      {items.length ? (
        <div className="flex flex-wrap gap-4">
          {items.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <p className="text-white/50">No favorites yet. Heart an activity from its detail page.</p>
      )}
    </div>
  )
}
