import type { ActivityLevel, QuizQuestionItem } from '@/types/activity'

/** Kept for any scripts that still import the old helper name. */
export function buildQuizQuestions(
  topic: string,
  level: ActivityLevel,
  count = 10,
): QuizQuestionItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `q${i + 1}`,
    question: `Which option best fits “${topic}” (${level}) — item ${i + 1}?`,
    options: [
      `Best answer for item ${i + 1}`,
      'Unrelated detail',
      'Opposite meaning',
      'Off-topic option',
    ],
    correctIndex: 0,
    explanation: `Checks understanding of “${topic}”.`,
  }))
}
