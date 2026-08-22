import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { DifficultySelector } from '@/components/activities/DifficultySelector'
import { typeIcons, typeLabels } from '@/data/categories'
import { fetchActivity } from '@/services/activities/activity.service'
import type { Activity, Difficulty } from '@/types/activity'
import { toLegacyDifficulty } from '@/types/activity'
import { usePlatform } from '@/contexts/PlatformContext'
import { thumbnailStyle } from '@/lib/thumbnail'

function asLegacyDifficulty(d: Activity['difficulty'] | undefined): Difficulty {
  if (!d) return 'intermediate'
  if (d === 'easy' || d === 'medium' || d === 'hard') return toLegacyDifficulty(d)
  return d
}

export function ActivityDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const generated = (location.state as { generated?: Activity } | null)?.generated
  const [activity, setActivity] = useState<Activity | null>(generated ?? null)
  const [difficulty, setDifficulty] = useState<Difficulty>(
    asLegacyDifficulty(generated?.difficulty),
  )
  const { toggleFavorite, isFavorite } = usePlatform()

  useEffect(() => {
    if (!id || generated) return
    fetchActivity(id).then((data) => {
      setActivity(data)
      if (data) setDifficulty(asLegacyDifficulty(data.difficulty))
    })
  }, [id, generated])

  if (!activity) {
    return (
      <div className="container-wide px-4 py-16 text-white/60">
        Loading activity…
      </div>
    )
  }

  return (
    <div className="container-wide px-4 py-8 sm:px-6 sm:py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="text-sm text-white/50 hover:text-white"
      >
        ← Back
      </button>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-soft-pink">
            {typeIcons[activity.type]} {typeLabels[activity.type]}
          </p>
          <h1 className="mt-2 display text-4xl text-white sm:text-5xl">{activity.title}</h1>
          {generated && (
            <p className="mt-2 text-sm text-cobalt">Custom session: {generated.title}</p>
          )}
          <p className="mt-4 max-w-2xl text-lg text-white/60">{activity.description}</p>

          <div className="mt-8 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/45">
              Level
            </h2>
            <DifficultySelector value={difficulty} onChange={setDifficulty} />
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/40">Duration</dt>
              <dd className="mt-1 text-white">{activity.duration} minutes</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-white/40">CEFR</dt>
              <dd className="mt-1 text-white">{activity.level}</dd>
            </div>
          </dl>

          {activity.skills && (
            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-wider text-white/40">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {activity.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-white/5 px-3 py-1 text-sm text-white/80"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activity.practicePoints && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-white">What you&apos;ll practice</h3>
              <ul className="mt-3 space-y-2 text-white/65">
                {activity.practicePoints.map((point) => (
                  <li key={point}>• {point}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to={`/activity/${activity.id}/play?difficulty=${difficulty}`}
              className="rounded-full bg-cherry px-8 py-3 text-sm font-bold uppercase tracking-wide text-white"
            >
              Start Activity
            </Link>
            <button
              type="button"
              onClick={() => toggleFavorite(activity.id)}
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
            >
              {isFavorite(activity.id) ? '★ Favorited' : '☆ Favorite'}
            </button>
          </div>
        </div>

        <div
          className="min-h-[280px] rounded-3xl border border-white/10 shadow-lift"
          style={thumbnailStyle(activity.thumbnail)}
        />
      </div>
    </div>
  )
}
