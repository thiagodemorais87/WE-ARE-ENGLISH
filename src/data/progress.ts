export const progress = {
  studentName: '[NOME DO ALUNO]',
  currentLevel: 'B2 · Intermediário Superior',
  levelShort: 'B2',
  overallProgress: 82,
  studyStreak: 12,
  nextLesson: {
    when: 'Quinta · 19:00',
    focus: 'Pronúncia Americana',
  },
  metrics: [
    { id: 'pronunciation', label: 'Pronúncia', value: 92 },
    { id: 'fluency', label: 'Fluência', value: 86 },
    { id: 'vocabulary', label: 'Vocabulário', value: 88 },
    { id: 'speaking', label: 'Conversação', value: 84 },
  ],
  heroJourney: [
    { id: 'pronunciation', label: 'Pronúncia', value: 92 },
    { id: 'fluency', label: 'Fluência', value: 86 },
    { id: 'confidence', label: 'Confiança ao Falar', value: 89 },
  ],
  chart: [
    { month: 'Jan', pronunciation: 68, fluency: 62, speaking: 60, vocabulary: 65 },
    { month: 'Fev', pronunciation: 72, fluency: 66, speaking: 64, vocabulary: 69 },
    { month: 'Mar', pronunciation: 78, fluency: 71, speaking: 70, vocabulary: 74 },
    { month: 'Abr', pronunciation: 82, fluency: 76, speaking: 74, vocabulary: 78 },
    { month: 'Mai', pronunciation: 88, fluency: 81, speaking: 79, vocabulary: 83 },
    { month: 'Jun', pronunciation: 92, fluency: 86, speaking: 84, vocabulary: 88 },
  ],
} as const
