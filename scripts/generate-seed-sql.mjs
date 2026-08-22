import { writeFileSync } from 'node:fs'
import { systemSeedActivities } from '../src/data/seed-activities.ts'
import { toEngineDifficulty } from '../src/types/activity.ts'

function esc(s) {
  return String(s ?? '').replace(/'/g, "''")
}

function rowSql(a) {
  const diff = toEngineDifficulty(a.difficulty)
  const content = JSON.stringify(a.content ?? {}).replace(/'/g, "''")
  const image = esc(a.thumbnail || a.imageUrl || '')
  return `(
  gen_random_uuid(),
  '${esc(a.title)}',
  '${esc(a.description)}',
  '${esc(a.type)}',
  '${esc(a.level)}',
  '${diff}',
  '${esc(a.instructions ?? '')}',
  '${content}'::jsonb,
  null,
  ${image ? `'${image}'` : 'null'},
  ${a.duration ?? 10},
  ${a.points ?? 10},
  true,
  true,
  null
)`
}

const MEDIA = new Set(['music', 'video', 'game'])
const core = systemSeedActivities.filter((a) => !MEDIA.has(a.type))
const media = systemSeedActivities.filter((a) => MEDIA.has(a.type))

const insertCols = `insert into public.activities (
  id, title, description, type, level, difficulty, instructions, content,
  audio_url, image_url, duration, points, is_published, is_system, created_by
) values
`

const sql = `-- System activity seed (generated from src/data/seed-activities.ts)
-- Regenerate: npm run seed:sql
-- Core engine types are inserted first so Listening/Writing/etc. still load even if
-- media types (music/video/game) are rejected by an older CHECK constraint.

delete from public.activities where is_system = true;

-- Core skills (listening, speaking, writing, reading, grammar, vocabulary, …)
${insertCols}${core.map(rowSql).join(',\n')};

-- Media catalog (requires migration 20260822150000_allow_media_activity_types.sql)
${insertCols}${media.map(rowSql).join(',\n')};
`

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql)
console.log(
  `Wrote ${core.length} core + ${media.length} media activities to supabase/seed.sql`,
)
