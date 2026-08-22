import { Link } from 'react-router-dom'
import { usePlatform } from '@/contexts/PlatformContext'

export function CartPage() {
  const { cartPacks, removeFromCart } = usePlatform()

  return (
    <div className="container-wide space-y-8 px-4 py-10 sm:px-6">
      <h1 className="display text-4xl text-white sm:text-5xl">Your Learning Cart</h1>
      <p className="text-white/55">
        Activities / Learning Packs — payment comes later. Everything is free for now.
      </p>

      <div className="space-y-3">
        {cartPacks.map((pack) => (
          <article
            key={pack.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="font-semibold text-white">{pack.title}</h2>
              <p className="text-sm text-white/50">
                {pack.activityCount} activities · {pack.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-soft-pink">{pack.priceLabel}</span>
              <button
                type="button"
                onClick={() => removeFromCart(pack.id)}
                className="text-xs text-white/40 hover:text-white"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
        {!cartPacks.length && (
          <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <p className="text-white/70">Your cart is empty.</p>
            <p className="mt-2 text-sm text-white/45">
              Plans coming soon — for now every activity is free. Browse the catalog and start
              practicing.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 p-5">
        <p className="text-lg text-white">
          Total: <span className="font-semibold text-soft-pink">Free</span>
        </p>
        <Link
          to="/activities"
          className="rounded-full bg-cherry px-6 py-3 text-sm font-bold uppercase tracking-wide text-white"
        >
          Continue Learning
        </Link>
      </div>
    </div>
  )
}
