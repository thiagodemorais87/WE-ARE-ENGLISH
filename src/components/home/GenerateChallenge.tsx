import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateChallenge } from '@/services/activities/activity.service'
import type { ActivityType, CefrLevel, Difficulty } from '@/types/activity'

const skills: ActivityType[] = [
  'listening',
  'writing',
  'reading',
  'grammar',
  'vocabulary',
  'music',
  'video',
  'game',
]

const darkField =
  'w-full rounded-xl border border-white/20 bg-ink/40 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-cobalt/60'

export function GenerateChallenge() {
  const navigate = useNavigate()
  const [skill, setSkill] = useState<ActivityType>('listening')
  const [level, setLevel] = useState<CefrLevel>('B1')
  const [topic, setTopic] = useState('Travel')
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [duration, setDuration] = useState(10)
  const [loading, setLoading] = useState(false)

  const onGenerate = async () => {
    setLoading(true)
    try {
      await generateChallenge({ skill, level, topic, difficulty, duration })
      const bySkill: Partial<Record<ActivityType, string>> = {
        listening: 'sys-listening-b1-1',
        writing: 'sys-writing-a2-1',
        reading: 'sys-reading-b1-1',
        grammar: 'sys-grammar-b1-1',
        vocabulary: 'sys-vocabulary-a2-1',
        music: 'sys-music-feel-lyrics',
        video: 'sys-video-workday-vlog',
        game: 'sys-game-quick-quiz',
      }
      const id = bySkill[skill] ?? 'sys-listening-b1-1'
      navigate(`/activity/${id}/play`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-graphite p-6 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(210,0,1,0.32),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgb(2,18,238,0.38),transparent_50%)]"
        aria-hidden
      />
      <div className="relative">
        <p className="text-sm font-semibold text-soft-pink">Create a Practice Session</p>
        <h2 className="mt-2 display text-3xl text-white sm:text-4xl">Generate a challenge</h2>
        <p className="mt-2 max-w-xl text-sm text-white/70">
          Pick your focus and we will prepare a mock session. Real AI generation can plug in later.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Field label="Skill">
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value as ActivityType)}
              className={darkField}
            >
              {skills.map((s) => (
                <option key={s} value={s} className="bg-ink text-sand">
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Level">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as CefrLevel)}
              className={darkField}
            >
              {(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((l) => (
                <option key={l} value={l} className="bg-ink text-sand">
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Topic">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className={darkField}
              placeholder="Travel"
            />
          </Field>
          <Field label="Difficulty">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              className={darkField}
            >
              <option value="basic" className="bg-ink text-sand">
                Basic
              </option>
              <option value="intermediate" className="bg-ink text-sand">
                Intermediate
              </option>
              <option value="advanced" className="bg-ink text-sand">
                Advanced
              </option>
            </select>
          </Field>
          <Field label="Duration">
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={darkField}
            >
              <option value={5} className="bg-ink text-sand">
                5 min
              </option>
              <option value={10} className="bg-ink text-sand">
                10 min
              </option>
              <option value={15} className="bg-ink text-sand">
                15 min
              </option>
            </select>
          </Field>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={onGenerate}
          className="mt-6 rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-cherry/90 disabled:opacity-60"
        >
          {loading ? 'Generating…' : 'Generate Challenge'}
        </button>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wider text-soft-pink">
      {label}
      {children}
    </label>
  )
}
