import { useState } from 'react'
import type { GameItem } from '@/types/activity'
import { resolveThumbnailUrl } from '@/lib/thumbnail'

type Props = {
  game: GameItem
  onClick?: () => void
}

export function GameCard({ game, onClick }: Props) {
  const [src, setSrc] = useState(() => resolveThumbnailUrl(game.thumbnail, 'game'))

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-2xl border border-white/10 bg-graphite text-left transition hover:border-cobalt/50 hover:shadow-lift"
    >
      <div className="aspect-[16/9] w-full overflow-hidden bg-graphite">
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={() => setSrc(resolveThumbnailUrl('', 'game'))}
        />
      </div>
      <div className="space-y-1 bg-graphite p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-soft-pink">
          {game.provider ?? 'game'}
        </p>
        <h3 className="text-base font-semibold text-white group-hover:text-soft-pink">
          {game.title}
        </h3>
        <p className="text-sm text-white/70">{game.description}</p>
        {game.players ? (
          <p className="pt-1 text-xs text-white/55">{game.players} players</p>
        ) : null}
      </div>
    </button>
  )
}
