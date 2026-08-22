import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

/** Requires authentication. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="px-4 py-16 text-center text-white/50">Loading…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

/** Requires teacher or admin role. */
export function TeacherRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isTeacher, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="px-4 py-16 text-center text-white/50">Loading…</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isTeacher) {
    return <Navigate to="/activities" replace />
  }

  return children
}
