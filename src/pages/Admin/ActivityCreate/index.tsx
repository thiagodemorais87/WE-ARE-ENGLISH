import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { createActivity } from '@/services/activities/activity.repository'
import { ActivityForm, formToActivityInput } from '@/pages/Admin/ActivityForm'

export function ActivityCreatePage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="container-wide px-4 py-8 sm:px-6 sm:py-12">
      <Link to="/admin/activities" className="text-sm text-white/50 hover:text-white">
        ← Back
      </Link>
      <h1 className="mt-4 font-display text-3xl text-white">Create activity</h1>
      <div className="mt-8">
        <ActivityForm
          submitLabel="Create"
          onSubmit={async (values) => {
            if (!user) throw new Error('Not authenticated')
            const created = await createActivity(formToActivityInput(values), user.id)
            navigate(`/admin/activities/${created.id}/edit`)
          }}
        />
      </div>
    </div>
  )
}
