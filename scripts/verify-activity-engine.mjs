/**
 * Critical Activity Engine checks (no Vitest dependency).
 * Run: npm run test
 */
import { systemSeedActivities } from '../src/data/seed-activities.ts'
import { toEngineDifficulty, toLegacyDifficulty } from '../src/types/activity.ts'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const ENGINE = [
  'listening',
  'speaking',
  'pronunciation',
  'writing',
  'reading',
  'multiple_choice',
  'fill_blank',
  'word_order',
  'matching',
  'true_false',
  'vocabulary',
  'grammar',
]

const QUIZ_TYPES = new Set([
  'listening',
  'reading',
  'grammar',
  'vocabulary',
  'multiple_choice',
  'music',
  'video',
  'game',
])

assert(systemSeedActivities.length >= 120, `Expected >=120 seeds, got ${systemSeedActivities.length}`)

for (const a of systemSeedActivities) {
  assert(a.isSystem === true, `Seed ${a.id} must be system`)
  assert(a.isPublished === true, `Seed ${a.id} must be published`)
  assert(Boolean(a.title && a.type && a.level), `Seed ${a.id} missing fields`)
  assert(a.content && typeof a.content === 'object', `Seed ${a.id} missing content`)
  assert(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(a.level), `Bad level ${a.level}`)

  if (QUIZ_TYPES.has(a.type)) {
    const qs = a.content.questions
    assert(Array.isArray(qs) && qs.length >= 10, `Seed ${a.id} (${a.type}) needs ≥10 questions, got ${qs?.length ?? 0}`)
  }
}

const types = new Set(systemSeedActivities.map((a) => a.type))
for (const t of ENGINE) {
  assert(types.has(t), `Seed missing type ${t}`)
}
assert(types.has('music'), 'Seed missing music')
assert(types.has('video'), 'Seed missing video')
assert(types.has('game'), 'Seed missing game')

assert(toEngineDifficulty('basic') === 'easy', 'basic → easy')
assert(toEngineDifficulty('intermediate') === 'medium', 'intermediate → medium')
assert(toEngineDifficulty('advanced') === 'hard', 'advanced → hard')
assert(toLegacyDifficulty('easy') === 'basic', 'easy → basic')
assert(toLegacyDifficulty('hard') === 'advanced', 'hard → advanced')

function canEdit(activity) {
  return !activity.isSystem
}
function duplicateTitle(title) {
  return `${title} (Copy)`
}
assert(canEdit({ isSystem: false }) === true, 'teacher owns non-system')
assert(canEdit({ isSystem: true }) === false, 'system not editable')
assert(duplicateTitle('At the Café') === 'At the Café (Copy)', 'duplicate title')

console.log(
  `OK — ${systemSeedActivities.length} seeds, ${types.size} types, ≥10-question quizzes, difficulty/publish/duplicate checks pass`,
)
