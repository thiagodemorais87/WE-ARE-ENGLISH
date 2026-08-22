/**
 * One-off: create xafullt@gmail.com and print SQL to promote to admin.
 * Usage: node --experimental-strip-types scripts/create-admin-user.mjs
 * Does not commit secrets. Reads .env.local.
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i), l.slice(i + 1)]
    }),
)

const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const email = 'xafullt@gmail.com'
const password = 'WeAreEnglish2026!'
const supabase = createClient(url, key)

const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: { data: { full_name: 'Rogerio' } },
})

if (error) {
  console.error('signUp error:', error.message)
  // User may already exist — continue with promote SQL guidance
} else {
  console.log('User created:', data.user?.id, data.user?.email)
  console.log('Session returned:', Boolean(data.session))
  if (!data.session) {
    console.log(
      'No session — confirm email in Dashboard (Authentication → Users) or disable Confirm email.',
    )
  }
}

console.log(`
--- Run this in Supabase SQL Editor to grant admin ---
update public.profiles
set role = 'admin',
    full_name = coalesce(nullif(full_name, ''), 'Rogerio')
where id = (select id from auth.users where email = '${email}');

select id, full_name, role from public.profiles
where id = (select id from auth.users where email = '${email}');
`)
