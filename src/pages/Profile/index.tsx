import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const onLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="container-wide max-w-xl space-y-8 px-4 py-10 sm:px-6">
      <h1 className="display text-4xl text-white">Profile</h1>
      <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">Name</p>
          <p className="mt-1 text-lg text-white">{user?.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-white/40">Email</p>
          <p className="mt-1 text-lg text-white">{user?.email}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:bg-white/5"
      >
        Sign out
      </button>
    </div>
  )
}
