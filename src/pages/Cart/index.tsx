import { Link } from 'react-router-dom'
import { usePlatform } from '@/contexts/PlatformContext'

export function CartPage() {
  const { cartPacks, removeFromCart } = usePlatform()

  return (
    <div className="container-wide space-y-8 px-4 py-10 sm:px-6">
      <h1 className="display text-4xl text-fg sm:text-5xl">Your Learning Cart</h1>
      <p className="text-fg-muted">
        Activities / Learning Packs — payment comes later. Everything is free for now.
      </p>

      <div className="space-y-3">
        {cartPacks.map((pack) => (
          <article
            key={pack.id}
            className="flex flex-col gap-3 rounded-2xl border border-edge bg-panel p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="font-semibold text-fg">{pack.title}</h2>
              <p className="text-sm text-fg-muted">
                {pack.activityCount} activities · {pack.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-soft-pink">{pack.priceLabel}</span>
              <button
                type="button"
                onClick={() => removeFromCart(pack.id)}
                className="text-xs text-fg-muted hover:text-fg"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
        {!cartPacks.length && (
          <div className="rounded-2xl border border-dashed border-edge p-8 text-center">
            <p className="text-fg-muted">Your cart is empty.</p>
            <p className="mt-2 text-sm text-fg-muted">
              Plans coming soon — for now every activity is free. Browse the catalog and start
              practicing.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-edge p-5">
        <p className="text-lg text-fg">
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
