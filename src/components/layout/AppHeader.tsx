import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { usePlatform } from '@/contexts/PlatformContext'
import { brand } from '@/data/brand'
import { SearchActivities } from '@/components/activities/SearchActivities'

const guestLinks = [
  { to: '/', label: 'Home' },
  { to: '/#explore', label: 'Explore' },
]

const authLinks = [
  { to: '/', label: 'Home' },
  { to: '/activities', label: 'Activities' },
  { to: '/progress', label: 'Progress' },
  { to: '/favorites', label: 'Favorites' },
]

type Props = {
  light?: boolean
}

export function AppHeader({ light = false }: Props) {
  const { isAuthenticated, user } = useAuth()
  const { cartPacks } = usePlatform()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const links = isAuthenticated ? authLinks : guestLinks

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const onSearch = (value: string) => {
    setQuery(value)
    if (isAuthenticated && value.trim().length > 1) {
      navigate(`/activities?q=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b backdrop-blur-xl',
        light
          ? 'border-ink/8 bg-sand/90 text-ink'
          : 'border-white/8 bg-ink/90 text-sand',
      ].join(' ')}
    >
      <div className="container-wide flex items-center gap-4 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className={['display shrink-0 text-xl sm:text-2xl', light ? 'text-ink' : 'text-white'].join(
            ' ',
          )}
        >
          {brand.name}
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                [
                  'rounded-full px-3 py-1.5 text-sm font-medium transition',
                  isActive && link.to !== '/#explore'
                    ? light
                      ? 'bg-ink/8 text-ink'
                      : 'bg-white/10 text-white'
                    : light
                      ? 'text-muted hover:text-ink'
                      : 'text-white/60 hover:text-white',
                ].join(' ')
              }
              end={link.to === '/'}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <SearchActivities
            value={query}
            onChange={onSearch}
            className="hidden w-44 xl:block xl:w-56"
          />

          <Link
            to={isAuthenticated ? '/cart' : '/signup'}
            className={[
              'relative rounded-full p-2 text-lg hover:bg-black/5',
              light ? 'text-ink/80' : 'text-white/80 hover:bg-white/10',
            ].join(' ')}
            aria-label="Cart"
          >
            🛒
            {isAuthenticated && cartPacks.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-cherry px-1 text-[10px] font-bold text-white">
                {cartPacks.length}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="hidden rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15 sm:inline-flex"
            >
              {user?.name?.split(' ')[0] ?? 'Profile'}
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className={[
                  'rounded-full px-3 py-1.5 text-sm font-medium',
                  light ? 'text-muted hover:text-ink' : 'text-white/70 hover:text-white',
                ].join(' ')}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-cherry px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
              >
                Create Account
              </Link>
            </div>
          )}

          <button
            type="button"
            className={['rounded-full p-2 lg:hidden', light ? 'text-ink' : 'text-white'].join(' ')}
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/70"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            className={[
              'absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col gap-2 p-5 shadow-lift',
              light ? 'bg-sand text-ink' : 'bg-graphite text-white',
            ].join(' ')}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className={['display text-xl', light ? 'text-ink' : 'text-white'].join(' ')}>
                {brand.name}
              </span>
              <button
                type="button"
                className={light ? 'text-ink' : 'text-white'}
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            <SearchActivities value={query} onChange={onSearch} className="mb-2" />
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={[
                  'rounded-xl px-3 py-3',
                  light ? 'hover:bg-ink/5' : 'hover:bg-white/5',
                ].join(' ')}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 hover:bg-white/5"
                >
                  Profile
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 hover:bg-white/5"
                >
                  Cart
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={['rounded-xl px-3 py-3', light ? 'hover:bg-ink/5' : 'hover:bg-white/5'].join(
                    ' ',
                  )}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-full bg-cherry px-4 py-3 text-center text-sm font-bold uppercase text-white"
                >
                  Create Free Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
