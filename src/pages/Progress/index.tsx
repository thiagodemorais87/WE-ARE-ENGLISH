import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useAuth } from '@/contexts/AuthContext'
import { listAttemptsForUser } from '@/services/activities/attempt.service'
import { getActivityFromDb } from '@/services/activities/activity.repository'
import { emptyProgress } from '@/data/mock-progress'
import { typeLabels } from '@/data/categories'
import { LearningPath } from '@/components/home/LearningPath'
import type { Activity, ActivityAttempt, ActivityType, UserProgress } from '@/types/activity'

type HistoryRow = {
  attempt: ActivityAttempt
  activity: Activity | null
}

function skillLabel(type: ActivityType | undefined): string {
  if (!type) return 'Other'
  const map: Partial<Record<ActivityType, string>> = {
    listening: 'Listening',
    writing: 'Writing',
    vocabulary: 'Vocabulary',
    grammar: 'Grammar',
    reading: 'Reading',
    music: 'Music',
    video: 'Videos',
    game: 'Games',
    speaking: 'Listening',
    pronunciation: 'Listening',
    fill_blank: 'Grammar',
    word_order: 'Grammar',
    matching: 'Vocabulary',
    true_false: 'Reading',
    multiple_choice: 'Vocabulary',
  }
  return map[type] ?? typeLabels[type] ?? 'Other'
}

function average(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}

function streakFromDates(isoDates: string[]): number {
  if (!isoDates.length) return 0
  const days = [
    ...new Set(isoDates.map((d) => new Date(d).toISOString().slice(0, 10))),
  ].sort((a, b) => (a < b ? 1 : -1))
  let streak = 1
  for (let i = 0; i < days.length - 1; i++) {
    const cur = new Date(days[i]!)
    const next = new Date(days[i + 1]!)
    const diff = (cur.getTime() - next.getTime()) / (1000 * 60 * 60 * 24)
    if (diff <= 1.5) streak += 1
    else break
  }
  return streak
}

export function ProgressPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserProgress>(emptyProgress)
  const [history, setHistory] = useState<HistoryRow[]>([])

  useEffect(() => {
    if (!user) {
      setStats(emptyProgress)
      setHistory([])
      return
    }
    ;(async () => {
      const attempts = await listAttemptsForUser(user.id)
      const completed = attempts.filter((a) => a.completedAt)
      const scores = completed
        .map((a) => a.score)
        .filter((s): s is number => typeof s === 'number')

      const bySkillBuckets: Record<string, number[]> = Object.fromEntries(
        Object.keys(emptyProgress.bySkill).map((k) => [k, []]),
      )

      const rows: HistoryRow[] = []
      for (const attempt of attempts.slice(0, 40)) {
        const activity = await getActivityFromDb(attempt.activityId)
        rows.push({ attempt, activity })
        if (attempt.completedAt && typeof attempt.score === 'number' && activity) {
          const label = skillLabel(activity.type)
          if (!bySkillBuckets[label]) bySkillBuckets[label] = []
          bySkillBuckets[label]!.push(attempt.score)
        }
      }

      const bySkill: Record<string, number> = { ...emptyProgress.bySkill }
      for (const [skill, list] of Object.entries(bySkillBuckets)) {
        bySkill[skill] = average(list)
      }

      setStats({
        overall: average(scores),
        bySkill,
        activitiesCompleted: completed.length,
        streakDays: streakFromDates(completed.map((a) => a.completedAt!).filter(Boolean)),
        timePracticedMinutes: completed.length * 8,
      })
      setHistory(rows)
    })()
  }, [user])

  const hours = Math.floor(stats.timePracticedMinutes / 60)
  const mins = stats.timePracticedMinutes % 60

  return (
    <div className="container-wide space-y-10 px-4 py-10 sm:px-6">
      <div>
        <h1 className="display text-4xl text-fg sm:text-5xl">Your Progress</h1>
        <p className="mt-2 text-fg-muted">
          Based on activities you actually complete — no fake stats.
        </p>
      </div>

      <div className="rounded-3xl border border-edge bg-gradient-to-br from-cobalt/20 to-cherry/10 p-6 sm:p-8">
        <p className="text-sm uppercase tracking-wider text-fg-muted">Overall score</p>
        <p className="mt-2 display text-6xl text-fg">{stats.overall}%</p>
        <ProgressBar value={stats.overall} className="mt-4" />
      </div>

      {user ? <LearningPath userId={user.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Activities completed', String(stats.activitiesCompleted)],
          ['Current streak', `${stats.streakDays} days`],
          ['Time practiced', `${hours}h ${mins}m`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-edge bg-panel p-5">
            <p className="text-xs uppercase tracking-wider text-fg-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-fg">{value}</p>
          </div>
        ))}
      </div>

      {stats.activitiesCompleted === 0 && history.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-edge p-6 text-center text-fg-muted">
          You haven’t completed an activity yet. Open Activities and finish one to see your stats
          here.
        </p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-fg">By skill</h2>
          {Object.entries(stats.bySkill).map(([skill, value]) => (
            <div key={skill} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-fg">{skill}</span>
                <span className="text-fg-muted">{value}%</span>
              </div>
              <ProgressBar value={value} barClassName="bg-cobalt" />
            </div>
          ))}
        </div>
      )}

      {history.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-fg">Activity history</h2>
          <ul className="divide-y divide-edge rounded-2xl border border-edge bg-panel">
            {history.map(({ attempt, activity }) => {
              const done = Boolean(attempt.completedAt)
              const when = new Date(attempt.completedAt ?? attempt.startedAt)
              return (
                <li
                  key={attempt.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-fg">
                      {activity?.title ?? 'Unknown activity'}
                    </p>
                    <p className="text-xs text-fg-muted">
                      {activity ? typeLabels[activity.type] : '—'} ·{' '}
                      {done ? 'Completed' : 'In progress'} · {when.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {done && typeof attempt.score === 'number' ? (
                      <span className="text-sm font-semibold text-cobalt">{attempt.score}%</span>
                    ) : (
                      <span className="text-xs text-fg-muted">—</span>
                    )}
                    <Link
                      to={
                        done
                          ? `/activity/${attempt.activityId}`
                          : `/activity/${attempt.activityId}/play`
                      }
                      className="rounded-full bg-cherry px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white"
                    >
                      {done ? 'Review' : 'Continue'}
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
