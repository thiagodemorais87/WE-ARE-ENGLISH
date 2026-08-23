import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { brand } from '@/data/brand'
import { SearchActivities } from '@/components/activities/SearchActivities'

const guestLinks = [{ to: '/', label: 'Home' }]

const authLinks = [
  { to: '/', label: 'Home' },
  { to: '/activities', label: 'Activities' },
  { to: '/progress', label: 'Progress' },
  { to: '/favorites', label: 'Favorites' },
]

export function AppHeader() {
  const { isAuthenticated, user } = useAuth()
  const { isLight, toggleTheme } = useTheme()
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
    <header className="sticky top-0 z-50 border-b border-edge bg-header text-fg backdrop-blur-xl">
      <div className="container-wide flex items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="display shrink-0 text-xl text-fg sm:text-2xl">
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
                  isActive
                    ? 'bg-panel-strong text-fg'
                    : 'text-fg-muted hover:text-fg',
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

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-edge bg-panel px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-fg hover:bg-panel-strong"
            aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {isLight ? 'Dark' : 'Light'}
          </button>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="hidden rounded-full bg-panel-strong px-3 py-1.5 text-sm font-medium text-fg hover:bg-panel sm:inline-flex"
            >
              {user?.name?.split(' ')[0] ?? 'Profile'}
            </Link>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                to="/login"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-fg-muted hover:text-fg"
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
            className="rounded-full p-2 text-fg lg:hidden"
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
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,320px)] flex-col gap-2 bg-surface p-5 text-fg shadow-lift">
            <div className="mb-4 flex items-center justify-between">
              <span className="display text-xl text-fg">{brand.name}</span>
              <button type="button" className="text-fg" onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <SearchActivities value={query} onChange={onSearch} className="mb-2" />
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 hover:bg-panel"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => {
                toggleTheme()
                setOpen(false)
              }}
              className="rounded-xl px-3 py-3 text-left hover:bg-panel"
            >
              {isLight ? 'Dark mode' : 'Light mode'}
            </button>
            {isAuthenticated ? (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 hover:bg-panel"
              >
                Profile
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 hover:bg-panel"
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
