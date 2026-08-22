import type { Difficulty } from '@/types/activity'
import { difficultyMeta } from '@/lib/labels'

type Props = {
  value: Difficulty
  onChange: (value: Difficulty) => void
}

const order: Difficulty[] = ['basic', 'intermediate', 'advanced']

export function DifficultySelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {order.map((key) => {
        const meta = difficultyMeta[key]
        const active = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={[
              'rounded-2xl border p-4 text-left transition',
              active
                ? 'border-cherry bg-cherry/15 shadow-lift'
                : 'border-white/10 bg-white/[0.03] hover:border-white/25',
            ].join(' ')}
          >
            <p className="font-semibold text-white">{meta.label}</p>
            <p className="mt-1 text-sm text-white/50">{meta.subtitle}</p>
          </button>
        )
      })}
    </div>
  )
}
