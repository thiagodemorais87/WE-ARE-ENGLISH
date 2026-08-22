import type { GameItem } from '@/types/activity'

type Props = {
  game: GameItem
  onClick?: () => void
}

export function GameCard({ game, onClick }: Props) {
  const isUrl = game.thumbnail.startsWith('http')
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full overflow-hidden rounded-2xl border border-white/8 bg-graphite text-left transition hover:border-cobalt/50 hover:shadow-lift"
    >
      <div
        className="aspect-[16/9] w-full bg-cover bg-center transition duration-500 group-hover:scale-[1.03]"
        style={
          isUrl
            ? { backgroundImage: `url(${game.thumbnail})` }
            : { background: game.thumbnail }
        }
      />
      <div className="space-y-1 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-soft-pink">
          {game.provider ?? 'game'}
        </p>
        <h3 className="text-base font-semibold text-white group-hover:text-soft-pink">
          {game.title}
        </h3>
        <p className="text-sm text-white/55">{game.description}</p>
        {game.players ? (
          <p className="pt-1 text-xs text-white/40">{game.players} players</p>
        ) : null}
      </div>
    </button>
  )
}
