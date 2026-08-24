/**
 * Read-only probe of system activities in Supabase.
 * Usage: node --experimental-strip-types scripts/probe-system-activities.mjs
 */
import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
if (!url || !anon) {
  console.error('Missing Supabase URL/anon key')
  process.exit(1)
}

const supabase = createClient(url, anon)

const { data, error } = await supabase
  .from('activities')
  .select('id, title, type, level, difficulty, duration, points, audio_url, content, is_system, is_published')
  .eq('is_system', true)

if (error) {
  console.error(error.message)
  process.exit(1)
}

const rows = data ?? []
const byType = {}
for (const r of rows) {
  byType[r.type] = (byType[r.type] ?? 0) + 1
}

const listening = rows.filter((r) => r.type === 'listening')
const listeningWithAudio = listening.filter((r) => Boolean(r.audio_url))

console.log('system total', rows.length)
console.log('by type', byType)
console.log('listening', listening.length, 'with audio', listeningWithAudio.length)

const stamp = new Date().toISOString().slice(0, 10)
const dir = resolve(process.cwd(), 'scripts/backups')
mkdirSync(dir, { recursive: true })
const out = resolve(dir, `activities-system-${stamp}.json`)
writeFileSync(out, JSON.stringify(rows, null, 2))
console.log('backup written', out)
