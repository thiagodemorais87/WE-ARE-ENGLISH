import type { CefrLevel } from '@/types/activity'

const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

type Props = {
  value: CefrLevel
  onChange: (value: CefrLevel) => void
}

export function LevelSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((level) => {
        const active = value === level
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={[
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              active ? 'bg-cobalt text-white' : 'bg-white/5 text-white/70 hover:bg-white/10',
            ].join(' ')}
          >
            {level}
          </button>
        )
      })}
    </div>
  )
}
