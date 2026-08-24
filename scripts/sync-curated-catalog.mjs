/**
 * Sync curated catalog to Supabase without losing ElevenLabs listening audio.
 *
 * Prefers SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
 * Falls back to RPC public.admin_replace_system_catalog (requires migration
 * 20260824160000_admin_replace_system_catalog.sql + admin login).
 *
 * Usage:
 *   npm run catalog:sync
 *   npm run catalog:sync -- --dry-run
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  systemSeedActivities,
  listeningAudioUrlByTitle,
} from '../src/data/seed-activities.ts'
import { toEngineDifficulty } from '../src/types/activity.ts'

function loadEnvFile(fileName) {
  const path = resolve(process.cwd(), fileName)
  if (!existsSync(path)) return
  const text = readFileSync(path, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!(key in process.env) || process.env[key] === '') process.env[key] = val
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

const dryRun = process.argv.includes('--dry-run')

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!url || (!anon && !serviceKey)) {
  console.error('Missing SUPABASE_URL and a key (anon or service role).')
  process.exit(1)
}

function toRow(seed, { withAudio }) {
  return {
    title: seed.title,
    description: seed.description,
    type: seed.type,
    level: seed.level,
    difficulty: toEngineDifficulty(seed.difficulty),
    instructions: seed.instructions ?? '',
    content: seed.content,
    audio_url: withAudio ? listeningAudioUrlByTitle[seed.title] ?? null : null,
    image_url: seed.thumbnail || null,
    duration: seed.duration,
    points: seed.points,
    is_published: true,
    is_system: true,
    created_by: null,
  }
}

const listenSeeds = systemSeedActivities.filter((a) => a.type === 'listening')
const otherSeeds = systemSeedActivities.filter((a) => a.type !== 'listening')

const listeningPayload = listenSeeds.map((s) => {
  const row = toRow(s, { withAudio: true })
  return {
    title: row.title,
    description: row.description,
    level: row.level,
    difficulty: row.difficulty,
    instructions: row.instructions,
    content: row.content,
    audio_url: row.audio_url,
    image_url: row.image_url,
    duration: row.duration,
    points: row.points,
  }
})

const othersPayload = otherSeeds.map((s) => {
  const row = toRow(s, { withAudio: false })
  return {
    title: row.title,
    description: row.description,
    type: row.type,
    level: row.level,
    difficulty: row.difficulty,
    instructions: row.instructions,
    content: row.content,
    image_url: row.image_url,
    duration: row.duration,
    points: row.points,
  }
})

const supabase = serviceKey
  ? createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : createClient(url, anon)

if (!serviceKey) {
  if (!email || !password) {
    console.error(
      'Set SUPABASE_SERVICE_ROLE_KEY, or ADMIN_EMAIL + ADMIN_PASSWORD for RPC sync.',
    )
    process.exit(1)
  }
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (authErr || !auth.session) {
    console.error('Auth failed:', authErr?.message ?? 'no session')
    process.exit(1)
  }
}

const { data: existing, error: listErr } = await supabase
  .from('activities')
  .select('id, title, type, audio_url, is_system')
  .eq('is_system', true)

if (listErr) {
  console.error('List failed:', listErr.message)
  process.exit(1)
}

const rows = existing ?? []
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupDir = resolve(process.cwd(), 'scripts/backups')
mkdirSync(backupDir, { recursive: true })
const backupPath = resolve(backupDir, `activities-system-pre-sync-${stamp}.json`)
writeFileSync(backupPath, JSON.stringify(rows, null, 2))
console.log(`Backup: ${backupPath} (${rows.length} rows)`)
console.log(
  dryRun
    ? `[dry-run] would sync ${listenSeeds.length} listening + insert ${otherSeeds.length}, purge non-keep system`
    : `Mode: ${serviceKey ? 'service_role' : 'admin RPC'}`,
)

if (dryRun) {
  console.log({
    dryRun: true,
    listening: listenSeeds.length,
    others: otherSeeds.length,
    currentSystem: rows.length,
  })
  process.exit(0)
}

if (serviceKey) {
  const listenTitles = new Set(listenSeeds.map((a) => a.title))
  const byTitle = new Map(rows.filter((r) => r.type === 'listening').map((r) => [r.title, r]))

  for (const seed of listenSeeds) {
    const row = byTitle.get(seed.title)
    const payload = toRow(seed, { withAudio: true })
    if (row) {
      payload.audio_url = row.audio_url || payload.audio_url
      const { error } = await supabase.from('activities').update(payload).eq('id', row.id)
      if (error) {
        console.error('Update failed', seed.title, error.message)
        process.exit(1)
      }
    } else {
      const { error } = await supabase.from('activities').insert(payload)
      if (error) {
        console.error('Insert listen failed', seed.title, error.message)
        process.exit(1)
      }
    }
  }

  const purgeIds = rows
    .filter((r) => !(r.type === 'listening' && listenTitles.has(r.title)))
    .map((r) => r.id)
  for (let i = 0; i < purgeIds.length; i += 50) {
    const slice = purgeIds.slice(i, i + 50)
    const { error } = await supabase.from('activities').delete().in('id', slice)
    if (error) {
      console.error('Delete failed:', error.message)
      process.exit(1)
    }
  }

  for (const seed of otherSeeds) {
    const { error } = await supabase.from('activities').insert(toRow(seed, { withAudio: false }))
    if (error) {
      console.error('Insert failed', seed.title, error.message)
      process.exit(1)
    }
  }
} else {
  const { data, error } = await supabase.rpc('admin_replace_system_catalog', {
    p_listening: listeningPayload,
    p_others: othersPayload,
  })
  if (error) {
    console.error('RPC admin_replace_system_catalog failed:', error.message)
    console.error(
      'Apply migration supabase/migrations/20260824160000_admin_replace_system_catalog.sql in the Supabase SQL editor,',
      'or set SUPABASE_SERVICE_ROLE_KEY, or run supabase/seed.sql as postgres in the SQL editor.',
    )
    process.exit(1)
  }
  console.log('RPC result:', data)
}

const { data: after, error: afterErr } = await supabase
  .from('activities')
  .select('id, title, type, audio_url')
  .eq('is_system', true)

if (afterErr) {
  console.error('Post-check failed:', afterErr.message)
  process.exit(1)
}

const finalRows = after ?? []
const byType = {}
for (const r of finalRows) byType[r.type] = (byType[r.type] ?? 0) + 1
const listenAudio = finalRows.filter((r) => r.type === 'listening' && r.audio_url).length

console.log({
  finalTotal: finalRows.length,
  byType,
  listeningWithAudio: listenAudio,
})
