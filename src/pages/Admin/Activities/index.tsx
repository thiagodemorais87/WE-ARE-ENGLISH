import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  listActivitiesFromDb,
  duplicateActivity,
  setPublished,
  deleteActivity,
} from '@/services/activities/activity.repository'
import type { Activity } from '@/types/activity'

export function AdminActivitiesPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<Activity[]>([])
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = async () => {
    const list = await listActivitiesFromDb({ includeUnpublished: true, query })
    setItems(list)
  }

  useEffect(() => {
    reload()
  }, [])

  const onDuplicate = async (id: string, isSystem: boolean) => {
    if (!user) return
    const reuse = isSystem
      ? window.confirm('Reuse existing audio URL if present? (Cancel = clear audio for regenerate)')
      : true
    setBusy(id)
    setError(null)
    try {
      await duplicateActivity(id, user.id, { reuseAudio: reuse })
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Duplicate failed')
    } finally {
      setBusy(null)
    }
  }

  const onTogglePublish = async (a: Activity) => {
    setBusy(a.id)
    try {
      await setPublished(a.id, !a.isPublished)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed')
    } finally {
      setBusy(null)
    }
  }

  const onDelete = async (a: Activity) => {
    if (a.isSystem) return
    if (!window.confirm(`Delete “${a.title}”?`)) return
    setBusy(a.id)
    try {
      await deleteActivity(a.id)
      await reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="container-wide px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-soft-pink">Teacher</p>
          <h1 className="font-display text-3xl text-fg sm:text-4xl">Activities</h1>
        </div>
        <Link
          to="/admin/activities/new"
          className="rounded-full bg-cherry px-5 py-2.5 text-sm font-bold uppercase text-white"
        >
          Create activity
        </Link>
      </div>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          reload()
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by title…"
          className="flex-1 rounded-full border border-edge bg-ink/50 px-4 py-2 text-fg"
        />
        <button type="submit" className="rounded-full border border-white/20 px-4 py-2 text-sm text-fg">
          Search
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm text-fg/80">
          <thead className="text-xs uppercase text-fg-muted">
            <tr>
              <th className="py-2 pr-3">Title</th>
              <th className="py-2 pr-3">Type</th>
              <th className="py-2 pr-3">Level</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-edge">
                <td className="py-3 pr-3 font-medium text-fg">
                  {a.title}
                  {a.isSystem ? (
                    <span className="ml-2 text-xs text-fg-muted">system</span>
                  ) : null}
                </td>
                <td className="py-3 pr-3">{a.type}</td>
                <td className="py-3 pr-3">{a.level}</td>
                <td className="py-3 pr-3">{a.isPublished ? 'Published' : 'Draft'}</td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-2">
                    {!a.isSystem ? (
                      <Link to={`/admin/activities/${a.id}/edit`} className="text-soft-pink hover:underline">
                        Edit
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      disabled={busy === a.id}
                      onClick={() => onDuplicate(a.id, Boolean(a.isSystem))}
                      className="text-fg-muted hover:text-fg"
                    >
                      Duplicate
                    </button>
                    {!a.isSystem ? (
                      <>
                        <button
                          type="button"
                          disabled={busy === a.id}
                          onClick={() => onTogglePublish(a)}
                          className="text-fg-muted hover:text-fg"
                        >
                          {a.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          disabled={busy === a.id}
                          onClick={() => onDelete(a)}
                          className="text-red-300/80 hover:text-red-200"
                        >
                          Delete
                        </button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
