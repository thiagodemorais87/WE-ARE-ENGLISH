import { type FormEvent, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { brand } from '@/data/brand'
import { FadeContent } from '@/components/motion/FadeContent'
import { BlurText } from '@/components/motion/BlurText'

export function SignupPage() {
  const { signup, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isAuthenticated && !success) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signup(name, email, password, confirmPassword)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSuccess(true)
    setTimeout(() => navigate('/', { replace: true }), 1200)
  }

  return (
    <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center px-4 py-12">
      <FadeContent className="w-full max-w-md">
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-3xl border border-edge bg-panel p-8 shadow-soft"
        >
          <div>
            <p className="display text-3xl text-ink">{brand.name}</p>
            <BlurText
              text="Create your account"
              className="mt-2 text-xl font-semibold text-cherry"
              as="h1"
              delay={0.1}
            />
          </div>

          {success ? (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Account created successfully! Welcome to We Are English.
            </div>
          ) : (
            <>
              {(
                [
                  ['Name', name, setName, 'text'],
                  ['Email', email, setEmail, 'email'],
                  ['Password', password, setPassword, 'password'],
                  ['Confirm Password', confirmPassword, setConfirmPassword, 'password'],
                ] as const
              ).map(([label, value, setter, type]) => (
                <label
                  key={label}
                  className="block space-y-1.5 text-xs font-semibold uppercase tracking-wider text-fg-muted"
                >
                  {label}
                  <input
                    type={type}
                    required
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="field"
                  />
                </label>
              ))}

              {error && <p className="text-sm text-cherry">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-cherry py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
              >
                {loading ? 'Creating…' : 'Create Account'}
              </button>
            </>
          )}

          <p className="text-center text-sm text-fg-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cherry hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </FadeContent>
    </div>
  )
}
