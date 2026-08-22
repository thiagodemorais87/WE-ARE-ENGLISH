import { type FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { brand } from '@/data/brand'
import { FadeContent } from '@/components/motion/FadeContent'
import { BlurText } from '@/components/motion/BlurText'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(email, password)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-4 py-12">
      <FadeContent className="w-full max-w-md">
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-soft"
        >
          <div>
            <p className="display text-3xl text-sand">{brand.name}</p>
            <BlurText
              text="Welcome back."
              className="mt-2 text-xl font-semibold text-cherry"
              as="h1"
              delay={0.1}
            />
          </div>

          <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
            />
          </label>

          <label className="block space-y-1.5 text-xs font-semibold uppercase tracking-wider text-white/50">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
            />
          </label>

          {error && <p className="text-sm text-cherry">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-cherry py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="text-center text-sm text-white/45">
            <button type="button" className="hover:text-sand">
              Forgot password?
            </button>
          </p>
          <p className="text-center text-sm text-white/45">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-cherry hover:underline">
              Create account
            </Link>
          </p>
        </form>
      </FadeContent>
    </div>
  )
}
