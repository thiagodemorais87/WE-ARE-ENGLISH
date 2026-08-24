/**
 * Purge all Auth users except the official admin, then ensure that admin exists
 * with role=admin. Requires service role (never VITE_*).
 *
 * Usage:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/create-admin-user.mjs
 *
 * Reads `.env.local`:
 *   VITE_SUPABASE_URL or SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ADMIN_EMAIL / ADMIN_PASSWORD (required — no defaults)
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DEFAULT_NAME = 'Admin'

function loadEnvLocal() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const path = join(root, '.env.local')
  if (!existsSync(path)) return {}
  return Object.fromEntries(
    readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=')
        if (i < 0) return null
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
      })
      .filter(Boolean),
  )
}

const env = { ...loadEnvLocal(), ...process.env }
const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
const email = (env.ADMIN_EMAIL || '').toLowerCase().trim()
const password = env.ADMIN_PASSWORD || ''

if (!url || !serviceKey) {
  console.error(`
Missing Supabase admin credentials in .env.local:
  VITE_SUPABASE_URL (or SUPABASE_URL)
  SUPABASE_SERVICE_ROLE_KEY
`)
  process.exit(1)
}

if (!email || !password || password.length < 10) {
  console.error(`
ADMIN_EMAIL and ADMIN_PASSWORD are required (password min 10 chars).
Set them in .env.local — no defaults are shipped for security.
`)
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function listAllUsers() {
  const users = []
  let page = 1
  const perPage = 200
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    users.push(...(data.users ?? []))
    if (!data.users?.length || data.users.length < perPage) break
    page += 1
  }
  return users
}

const users = await listAllUsers()
console.log(`Found ${users.length} auth user(s).`)

let deleted = 0
for (const u of users) {
  const uEmail = (u.email || '').toLowerCase()
  if (uEmail === email) continue
  const { error } = await admin.auth.admin.deleteUser(u.id)
  if (error) {
    console.error(`Failed to delete ${uEmail || u.id}:`, error.message)
    process.exit(1)
  }
  console.log(`Deleted: ${uEmail || u.id}`)
  deleted += 1
}
console.log(`Purged ${deleted} user(s).`)

let adminUser = users.find((u) => (u.email || '').toLowerCase() === email)

if (!adminUser) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: DEFAULT_NAME },
  })
  if (error) {
    console.error('createUser error:', error.message)
    process.exit(1)
  }
  adminUser = data.user
  console.log(`Created admin: ${adminUser.id} ${adminUser.email}`)
} else {
  const { error } = await admin.auth.admin.updateUserById(adminUser.id, {
    password,
    email_confirm: true,
    user_metadata: { full_name: DEFAULT_NAME },
  })
  if (error) {
    console.error('updateUser error:', error.message)
    process.exit(1)
  }
  console.log(`Updated password / confirm for existing admin: ${adminUser.id}`)
}

const { data: profile, error: profileError } = await admin
  .from('profiles')
  .upsert(
    { id: adminUser.id, full_name: DEFAULT_NAME, role: 'admin' },
    { onConflict: 'id' },
  )
  .select('id, full_name, role')
  .single()

if (profileError) {
  console.error('profiles upsert error:', profileError.message)
  console.log(`
If role lock blocks upsert, run in SQL Editor:
select set_config('app.allow_role_change', 'on', true);
update public.profiles set role = 'admin', full_name = 'Admin' where id = '${adminUser.id}';
`)
  process.exit(1)
}

const remaining = await listAllUsers()
console.log('\nDone.')
console.log('Admin profile:', profile)
console.log(
  `Auth users remaining (${remaining.length}):`,
  remaining.map((u) => u.email).join(', ') || '(none)',
)
