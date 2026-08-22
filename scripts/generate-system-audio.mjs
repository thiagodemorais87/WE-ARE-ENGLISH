/**
 * Batch-generate ElevenLabs audio for system listening (and reading) activities
 * that have audioText/transcript but no audio_url.
 *
 * Requires:
 *   VITE_SUPABASE_URL (or SUPABASE_URL)
 *   VITE_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)
 *   ADMIN_EMAIL + ADMIN_PASSWORD  (teacher or admin account)
 *
 * Usage:
 *   node --experimental-strip-types scripts/generate-system-audio.mjs
 *   node --experimental-strip-types scripts/generate-system-audio.mjs --limit 5
 *   node --experimental-strip-types scripts/generate-system-audio.mjs --delay 1500
 *
 * Cost / rate-limit: ElevenLabs bills per character. This script waits between
 * calls (default 1200ms). Play still works without audio (transcript shown).
 */
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
function flag(name, fallback) {
  const i = args.indexOf(`--${name}`)
  if (i >= 0 && args[i + 1]) return args[i + 1]
  return fallback
}

const limit = Number(flag('limit', '50'))
const delayMs = Number(flag('delay', '1200'))

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!url || !anon) {
  console.error('Missing SUPABASE_URL / SUPABASE_ANON_KEY (or VITE_* equivalents).')
  process.exit(1)
}
if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (teacher or admin user).')
  process.exit(1)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

function hasSpeakableText(content) {
  if (!content || typeof content !== 'object') return false
  return Boolean(content.audioText || content.transcript || content.text || content.referenceText)
}

const supabase = createClient(url, anon)

const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
if (authErr || !auth.session) {
  console.error('Auth failed:', authErr?.message ?? 'no session')
  process.exit(1)
}

const token = auth.session.access_token

const { data: rows, error: listErr } = await supabase
  .from('activities')
  .select('id, title, type, audio_url, content, is_system')
  .eq('is_system', true)
  .in('type', ['listening', 'reading'])
  .is('audio_url', null)
  .limit(limit)

if (listErr) {
  console.error('List failed:', listErr.message)
  process.exit(1)
}

const targets = (rows ?? []).filter((r) => hasSpeakableText(r.content))
console.log(`Found ${targets.length} system activities without audio_url (limit ${limit}).`)

let ok = 0
let fail = 0

for (const row of targets) {
  process.stdout.write(`→ ${row.type} ${row.title} (${row.id}) … `)
  const res = await fetch(`${url}/functions/v1/generate-audio`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anon,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activityId: row.id }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.log(`FAIL ${res.status} ${body.error ?? ''}`)
    fail += 1
  } else {
    console.log(`OK ${body.audioUrl ? '→ url set' : ''}`)
    ok += 1
  }
  await sleep(delayMs)
}

console.log(`Done. success=${ok} fail=${fail}`)
await supabase.auth.signOut()
