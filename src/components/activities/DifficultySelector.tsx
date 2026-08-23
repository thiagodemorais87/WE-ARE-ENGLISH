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
                : 'border-edge bg-panel hover:border-white/25',
            ].join(' ')}
          >
            <p className="font-semibold text-fg">{meta.label}</p>
            <p className="mt-1 text-sm text-fg-muted">{meta.subtitle}</p>
          </button>
        )
      })}
    </div>
  )
}
