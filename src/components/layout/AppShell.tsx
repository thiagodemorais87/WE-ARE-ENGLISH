import { Outlet, useLocation } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { SiteFooter } from './SiteFooter'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Ink chrome for the authenticated app (and login/signup).
 * Sand stays only on the marketing guest home so signed-in users
 * never get white greeting text on a sand page.
 */
export function AppShell() {
  const { pathname } = useLocation()
  const { isAuthenticated } = useAuth()
  const lightChrome = pathname === '/' && !isAuthenticated

  return (
    <div
      className={[
        'flex min-h-dvh flex-col',
        lightChrome ? 'bg-sand text-ink' : 'bg-ink text-sand',
      ].join(' ')}
    >
      <AppHeader light={lightChrome} />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter variant={lightChrome ? 'light' : 'dark'} />
    </div>
  )
}
