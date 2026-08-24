import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser, UserRole } from '@/types/activity'
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client'

const STORAGE_KEY = 'wae_auth_user'

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  /** True when running without Supabase (local demo only). */
  isOfflineDemo: boolean
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>
  signup: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>
  logout: () => Promise<void>
  isTeacher: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function persistUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

async function loadProfile(userId: string, email: string, fallbackName: string): Promise<AuthUser> {
  if (!supabase) {
    return { id: userId, email, name: fallbackName, role: 'student' }
  }
  const { data } = await supabase.from('profiles').select('full_name, role').eq('id', userId).maybeSingle()
  return {
    id: userId,
    email,
    name: data?.full_name || fallbackName,
    role: (data?.role as UserRole | undefined) ?? 'student',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const offlineDemo = !isSupabaseConfigured || !supabase
  const [user, setUser] = useState<AuthUser | null>(() =>
    offlineDemo ? readStoredUser() : null,
  )
  const [hasSession, setHasSession] = useState(false)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      const session = data.session
      if (session?.user) {
        const profile = await loadProfile(
          session.user.id,
          session.user.email ?? '',
          (session.user.user_metadata?.full_name as string) ||
            session.user.email?.split('@')[0] ||
            'Learner',
        )
        if (!mounted) return
        setUser(profile)
        persistUser(profile)
        setHasSession(true)
      } else {
        setUser(null)
        persistUser(null)
        setHasSession(false)
      }
      if (mounted) setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await loadProfile(
          session.user.id,
          session.user.email ?? '',
          (session.user.user_metadata?.full_name as string) ||
            session.user.email?.split('@')[0] ||
            'Learner',
        )
        setUser(profile)
        persistUser(profile)
        setHasSession(true)
        return
      }
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
        if (!session) {
          setUser(null)
          persistUser(null)
          setHasSession(false)
        }
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { ok: false as const, error: 'Email and password are required.' }
    }

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) return { ok: false as const, error: error.message }
      if (data.user && data.session) {
        const profile = await loadProfile(
          data.user.id,
          data.user.email ?? email,
          (data.user.user_metadata?.full_name as string) || email.split('@')[0] || 'Learner',
        )
        setUser(profile)
        persistUser(profile)
        setHasSession(true)
      }
      return { ok: true as const }
    }

    // Offline demo only (no Supabase env)
    await new Promise((r) => setTimeout(r, 400))
    const next: AuthUser = {
      id: crypto.randomUUID(),
      name: email.split('@')[0] || 'Learner',
      email: email.trim().toLowerCase(),
      role: 'student',
    }
    persistUser(next)
    setUser(next)
    setHasSession(true)
    return { ok: true as const }
  }, [])

  const signup = useCallback(
    async (name: string, email: string, password: string, confirmPassword: string) => {
      if (!name.trim() || !email.trim() || !password) {
        return { ok: false as const, error: 'Please fill in all fields.' }
      }
      if (password.length < 6) {
        return { ok: false as const, error: 'Password must be at least 6 characters.' }
      }
      if (password !== confirmPassword) {
        return { ok: false as const, error: 'Passwords do not match.' }
      }

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { full_name: name.trim() } },
        })
        if (error) return { ok: false as const, error: error.message }
        if (data.session?.user) {
          const profile = await loadProfile(data.user!.id, data.user!.email ?? email, name.trim())
          setUser(profile)
          persistUser(profile)
          setHasSession(true)
        } else {
          // Email confirmation pending — not authenticated until session exists
          setUser(null)
          persistUser(null)
          setHasSession(false)
        }
        return { ok: true as const }
      }

      await new Promise((r) => setTimeout(r, 500))
      const next: AuthUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'student',
      }
      persistUser(next)
      setUser(next)
      setHasSession(true)
      return { ok: true as const }
    },
    [],
  )

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    persistUser(null)
    setUser(null)
    setHasSession(false)
  }, [])

  const isAuthenticated = offlineDemo ? Boolean(user) : hasSession && Boolean(user)

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      isOfflineDemo: offlineDemo,
      login,
      signup,
      logout,
      isTeacher: isAuthenticated && (user?.role === 'teacher' || user?.role === 'admin'),
      isAdmin: isAuthenticated && user?.role === 'admin',
    }),
    [user, isAuthenticated, loading, offlineDemo, login, signup, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
