import type { ActivityContent } from '@/types/activity'

/** Remove answer keys from activity content for student-facing payloads. */
export function stripAnswerKeys(content: ActivityContent | Record<string, unknown> | null | undefined): ActivityContent {
  if (!content || typeof content !== 'object') return {} as ActivityContent
  const c = { ...(content as Record<string, unknown>) }

  delete c.correctIndex
  delete c.correctOrder
  delete c.answer
  delete c.answers

  if (Array.isArray(c.questions)) {
    c.questions = c.questions.map((q) => {
      if (!q || typeof q !== 'object') return q
      const item = { ...(q as Record<string, unknown>) }
      delete item.correctIndex
      delete item.answer
      delete item.correctOrder
      if (Array.isArray(item.blanks)) {
        item.blanks = item.blanks.map((b) => {
          if (!b || typeof b !== 'object') return b
          const blank = { ...(b as Record<string, unknown>) }
          delete blank.answer
          delete blank.alternatives
          return blank
        })
      }
      return item
    })
  }

  if (Array.isArray(c.items)) {
    c.items = c.items.map((it) => {
      if (!it || typeof it !== 'object') return it
      const item = { ...(it as Record<string, unknown>) }
      delete item.answer
      delete item.alternatives
      delete item.correctIndex
      return item
    })
  }

  if (Array.isArray(c.blanks)) {
    c.blanks = c.blanks.map((b) => {
      if (!b || typeof b !== 'object') return b
      const blank = { ...(b as Record<string, unknown>) }
      delete blank.answer
      delete blank.alternatives
      return blank
    })
  }

  if (c.gap && typeof c.gap === 'object') {
    const gap = { ...(c.gap as Record<string, unknown>) }
    delete gap.answer
    delete gap.correctIndex
    c.gap = gap
  }

  return c as ActivityContent
}
