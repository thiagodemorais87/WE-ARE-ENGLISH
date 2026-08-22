import type { ActivityFilters } from '@/services/activities/activity.service'
import type { ActivityType, CefrLevel, Difficulty } from '@/types/activity'

const skills: Array<ActivityType | 'all'> = [
  'all',
  'listening',
  'writing',
  'reading',
  'grammar',
  'vocabulary',
  'music',
  'video',
  'game',
]

const levels: Array<CefrLevel | 'all'> = ['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const difficulties: Array<Difficulty | 'all'> = ['all', 'basic', 'intermediate', 'advanced']
const durations: Array<ActivityFilters['duration']> = ['all', '5', '10', '15']

type Props = {
  value: ActivityFilters
  onChange: (next: ActivityFilters) => void
}

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onSelect,
  format = (v: string) => v,
}: {
  label: string
  options: T[]
  selected: T
  onSelect: (v: T) => void
  format?: (v: string) => string
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/45">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected === opt
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={[
                'rounded-full px-3 py-1.5 text-xs font-medium capitalize transition',
                active
                  ? 'bg-cherry text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10',
              ].join(' ')}
            >
              {opt === 'all' ? 'All' : format(opt)}
              {opt === '15' ? '+' : ''}
              {label === 'Duration' && opt !== 'all' ? ' min' : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ActivityFilter({ value, onChange }: Props) {
  return (
    <div className="space-y-5 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
      <ChipGroup
        label="Skill"
        options={skills}
        selected={(value.skill ?? 'all') as ActivityType | 'all'}
        onSelect={(skill) => onChange({ ...value, skill })}
      />
      <ChipGroup
        label="Level"
        options={levels}
        selected={(value.level ?? 'all') as CefrLevel | 'all'}
        onSelect={(level) => onChange({ ...value, level })}
      />
      <ChipGroup
        label="Difficulty"
        options={difficulties}
        selected={(value.difficulty ?? 'all') as Difficulty | 'all'}
        onSelect={(difficulty) => onChange({ ...value, difficulty })}
      />
      <ChipGroup
        label="Duration"
        options={durations as string[]}
        selected={(value.duration ?? 'all') as string}
        onSelect={(duration) =>
          onChange({ ...value, duration: duration as ActivityFilters['duration'] })
        }
        format={(v) => v}
      />
    </div>
  )
}
