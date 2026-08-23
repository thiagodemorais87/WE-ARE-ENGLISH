import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getActivityFromDb, updateActivity } from '@/services/activities/activity.repository'
import { ActivityForm, formToActivityInput } from '@/pages/Admin/ActivityForm'
import type { Activity } from '@/types/activity'

export function ActivityEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState<Activity | null>(null)

  useEffect(() => {
    if (!id) return
    getActivityFromDb(id).then(setActivity)
  }, [id])

  if (!activity) {
    return <div className="px-4 py-16 text-center text-fg-muted">Loading…</div>
  }

  if (activity.isSystem) {
    return (
      <div className="container-wide px-4 py-12 text-fg">
        <p>System activities cannot be edited. Duplicate them instead.</p>
        <Link to="/admin/activities" className="mt-4 inline-block text-soft-pink">
          ← Back
        </Link>
      </div>
    )
  }

  return (
    <div className="container-wide px-4 py-8 sm:px-6 sm:py-12">
      <Link to="/admin/activities" className="text-sm text-fg-muted hover:text-fg">
        ← Back
      </Link>
      <h1 className="mt-4 font-display text-3xl text-fg">Edit activity</h1>
      <div className="mt-8">
        <ActivityForm
          initial={activity}
          activityId={activity.id}
          submitLabel="Save changes"
          onSubmit={async (values) => {
            await updateActivity(activity.id, {
              ...formToActivityInput(values),
              createdBy: activity.createdBy,
              isSystem: false,
            })
            navigate('/admin/activities')
          }}
        />
      </div>
    </div>
  )
}
