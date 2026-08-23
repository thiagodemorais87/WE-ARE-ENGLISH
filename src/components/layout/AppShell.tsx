import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { SiteFooter } from './SiteFooter'
import { useTheme } from '@/contexts/ThemeContext'

export function AppShell() {
  const { isLight } = useTheme()

  return (
    <div className="flex min-h-dvh flex-col bg-surface text-fg">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter variant={isLight ? 'light' : 'dark'} />
    </div>
  )
}
