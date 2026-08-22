import { useEffect, useState } from 'react'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuth } from '@/contexts/AuthContext'
import { listAttemptsForUser } from '@/services/activities/attempt.service'
import { emptyProgress } from '@/data/mock-progress'
import type { UserProgress } from '@/types/activity'

export function ProgressPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserProgress>(emptyProgress)

  useEffect(() => {
    if (!user) {
      setStats(emptyProgress)
      return
    }
    listAttemptsForUser(user.id).then((attempts) => {
      const completed = attempts.filter((a) => a.completedAt)
      const scores = completed
        .map((a) => a.score)
        .filter((s): s is number => typeof s === 'number')
      const overall =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0
      // Rough practice time: ~8 min per completed attempt if unknown
      const minutes = completed.length * 8
      setStats({
        overall,
        bySkill: { ...emptyProgress.bySkill },
        activitiesCompleted: completed.length,
        streakDays: completed.length > 0 ? 1 : 0,
        timePracticedMinutes: minutes,
      })
    })
  }, [user])

  const hours = Math.floor(stats.timePracticedMinutes / 60)
  const mins = stats.timePracticedMinutes % 60

  return (
    <div className="container-wide space-y-10 px-4 py-10 sm:px-6">
      <div>
        <h1 className="display text-4xl text-white sm:text-5xl">Your Progress</h1>
        <p className="mt-2 text-white/50">
          Based on activities you actually complete — no fake stats.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-cobalt/20 to-cherry/10 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-wider text-white/50">Overall score</p>
        <p className="mt-2 display text-6xl text-white">{stats.overall}%</p>
        <ProgressBar value={stats.overall} className="mt-4" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Activities completed', String(stats.activitiesCompleted)],
          ['Current streak', `${stats.streakDays} days`],
          ['Time practiced', `${hours}h ${mins}m`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5">
            <p className="text-xs uppercase tracking-wider text-white/40">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      {stats.activitiesCompleted === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-6 text-center text-white/55">
          You haven’t completed an activity yet. Open Activities and finish one to see your stats
          here.
        </p>
      ) : (
        <div className="space-y-4">
          {Object.entries(stats.bySkill).map(([skill, value]) => (
            <div key={skill} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white">{skill}</span>
                <span className="text-white/50">{value}%</span>
              </div>
              <ProgressBar value={value} barClassName="bg-cobalt" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
