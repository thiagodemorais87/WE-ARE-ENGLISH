/**
 * Critical Activity Engine checks (no Vitest dependency).
 * Run: npm run test
 */
import { systemSeedActivities } from '../src/data/seed-activities.ts'
import { toEngineDifficulty, toLegacyDifficulty } from '../src/types/activity.ts'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

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

assert(
  systemSeedActivities.length >= 55 && systemSeedActivities.length <= 80,
  `Expected ~55–80 curated seeds, got ${systemSeedActivities.length}`,
)

const byType = {}
for (const a of systemSeedActivities) {
  byType[a.type] = (byType[a.type] ?? 0) + 1

  assert(a.isSystem === true, `Seed ${a.id} must be system`)
  assert(a.isPublished === true, `Seed ${a.id} must be published`)
  assert(Boolean(a.title && a.type && a.level), `Seed ${a.id} missing fields`)
  assert(a.content && typeof a.content === 'object', `Seed ${a.id} missing content`)
  assert(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(a.level), `Bad level ${a.level}`)

  if (QUIZ_TYPES.has(a.type) && a.content?.mode !== 'interactive') {
    const qs = a.content.questions
    assert(
      Array.isArray(qs) && qs.length >= 8 && qs.length <= 15,
      `Seed ${a.id} (${a.type}) needs 8–15 questions, got ${qs?.length ?? 0}`,
    )
    for (const q of qs) {
      assert(
        Array.isArray(q.options) && q.options.length >= 6,
        `Seed ${a.id} question needs ≥6 options`,
      )
      assert(
        typeof q.correctIndex === 'number' &&
          q.correctIndex >= 0 &&
          q.correctIndex < q.options.length,
        `Seed ${a.id} bad correctIndex`,
      )
    }
  }

  if (a.type === 'fill_blank') {
    const items = a.content.items
    assert(
      Array.isArray(items) && items.length >= 8 && items.length <= 15,
      `Seed ${a.id} fill_blank needs 8–15 items`,
    )
    for (const it of items) {
      assert(
        Array.isArray(it.alternatives) && it.alternatives.length >= 5,
        `Seed ${a.id} blank needs ≥5 alternatives`,
      )
    }
  }

  if (a.type === 'pronunciation') {
    const items = a.content.items
    assert(
      Array.isArray(items) && items.length >= 5 && items.length <= 8,
      `Seed ${a.id} pronunciation needs 5–8 items`,
    )
  }

  if (a.type === 'writing' || a.type === 'speaking') {
    const criteria = a.content.criteria
    assert(
      Array.isArray(criteria) && criteria.length >= 5 && criteria.length <= 8,
      `Seed ${a.id} needs 5–8 criteria`,
    )
  }
}

assert(byType.listening >= 15, `Expected ≥15 listening, got ${byType.listening}`)
assert(byType.grammar === 5, `Expected 5 grammar, got ${byType.grammar}`)
assert(byType.vocabulary === 5, `Expected 5 vocabulary, got ${byType.vocabulary}`)
assert(byType.reading === 5, `Expected 5 reading, got ${byType.reading}`)
assert(byType.writing === 5, `Expected 5 writing, got ${byType.writing}`)
assert(byType.speaking === 5, `Expected 5 speaking, got ${byType.speaking}`)
assert(byType.pronunciation === 5, `Expected 5 pronunciation, got ${byType.pronunciation}`)
assert(byType.fill_blank === 5, `Expected 5 fill_blank, got ${byType.fill_blank}`)
assert(byType.music >= 2, 'Seed missing music')
assert(byType.video >= 2, 'Seed missing video')
assert(byType.game >= 3, 'Seed missing game')

assert(toEngineDifficulty('basic') === 'easy', 'basic → easy')
assert(toEngineDifficulty('intermediate') === 'medium', 'intermediate → medium')
assert(toEngineDifficulty('advanced') === 'hard', 'advanced → hard')
assert(toLegacyDifficulty('easy') === 'basic', 'easy → basic')
assert(toLegacyDifficulty('hard') === 'advanced', 'hard → advanced')

console.log(
  `OK — ${systemSeedActivities.length} seeds, types=${Object.keys(byType).length}, listening=${byType.listening}, 8–15 quiz items / ≥6 options`,
)
