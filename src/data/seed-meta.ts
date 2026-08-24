import type { ActivityLevel, Difficulty } from '@/types/activity'

export type Diff = Difficulty

/** Target exercise count by CEFR (approved plan). */
export function targetExerciseCount(level: ActivityLevel): number {
  if (level === 'A1' || level === 'A2') return 9
  if (level === 'B1') return 11
  return 13 // B2–C2
}

export function difficultyFromLevel(level: ActivityLevel): Diff {
  if (level === 'A1' || level === 'A2') return 'basic'
  if (level === 'B1') return 'intermediate'
  return 'advanced'
}

type MetaKind =
  | 'listening'
  | 'reading'
  | 'grammar'
  | 'vocabulary'
  | 'fill_blank'
  | 'game'
  | 'music'
  | 'video'
  | 'writing'
  | 'speaking'
  | 'pronunciation'

/**
 * Duration (min) + points from exercise count and difficulty.
 * Caps: duration ≤ 25; points by difficulty band.
 */
export function metaFromExercises(
  kind: MetaKind,
  diff: Diff,
  exercises: number,
  writingMinWords?: number,
): { duration: number; points: number } {
  const n = Math.max(1, exercises)
  let perItem = 0.8
  let overhead = 1
  if (kind === 'listening' || kind === 'reading') {
    perItem = 1.1
    overhead = 2
  } else if (kind === 'grammar' || kind === 'vocabulary' || kind === 'fill_blank' || kind === 'game') {
    perItem = 0.8
    overhead = 1
  } else if (kind === 'music' || kind === 'video') {
    perItem = 0.7
    overhead = 3
  } else if (kind === 'writing') {
    const words = writingMinWords ?? 80
    return {
      duration: Math.min(25, Math.max(12, Math.ceil(words / 10))),
      points: clampPoints(diff, Math.floor(words / 8)),
    }
  } else if (kind === 'speaking' || kind === 'pronunciation') {
    perItem = 1.2
    overhead = 2
  }

  const duration = Math.min(25, Math.max(5, Math.ceil(n * perItem) + overhead))
  const points = clampPoints(diff, Math.floor(n * 1.5))
  return { duration, points }
}

function clampPoints(diff: Diff, bonus: number): number {
  const base = diff === 'advanced' ? 20 : diff === 'intermediate' ? 15 : 10
  const max = diff === 'advanced' ? 45 : diff === 'intermediate' ? 35 : 25
  return Math.min(max, base + bonus)
}

export function q(
  question: string,
  options: string[],
  correctIndex: number,
  explanation?: string,
) {
  if (options.length < 6) {
    throw new Error(`Quiz needs ≥6 options: "${question.slice(0, 40)}…" got ${options.length}`)
  }
  if (correctIndex < 0 || correctIndex >= options.length) {
    throw new Error(`Bad correctIndex for: ${question}`)
  }
  return { question, options, correctIndex, explanation }
}
