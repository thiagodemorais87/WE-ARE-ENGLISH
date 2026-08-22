import type { Activity, ActivityType } from '@/types/activity'

/** Unsplash photos cropped for activity cards (topic-matched). */
const photos = {
  airport:
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80&auto=format&fit=crop',
  writing:
    'https://images.unsplash.com/photo-1455390582262-044cdead168a?w=800&q=80&auto=format&fit=crop',
  city:
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&auto=format&fit=crop',
  grammar:
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&auto=format&fit=crop',
  travel:
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&auto=format&fit=crop',
  music:
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80&auto=format&fit=crop',
  office:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&auto=format&fit=crop',
  game:
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80&auto=format&fit=crop',
  cafe:
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop',
  remote:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&auto=format&fit=crop',
  news:
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80&auto=format&fit=crop',
  chalkboard:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&auto=format&fit=crop',
  dictionary:
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&auto=format&fit=crop',
  concert:
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80&auto=format&fit=crop',
  interview:
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80&auto=format&fit=crop',
  duel:
    'https://images.unsplash.com/photo-1553481187-be93c21490a9?w=800&q=80&auto=format&fit=crop',
} as const

export const activities: Activity[] = [
  {
    id: 'airport-listening',
    title: 'At the Airport',
    description:
      'Practice listening through a real-life airport conversation and travel vocabulary.',
    type: 'listening',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 10,
    thumbnail: photos.airport,
    skills: ['Listening', 'Vocabulary', 'Comprehension'],
    practicePoints: [
      'Travel vocabulary',
      'Airport expressions',
      'Listening comprehension',
      'Real-life English',
    ],
    categoryTags: ['trending', 'listening'],
  },
  {
    id: 'weekend-email',
    title: 'Weekend Email',
    description: 'Write a short email to a friend about your weekend plans.',
    type: 'writing',
    level: 'A2',
    difficulty: 'basic',
    duration: 15,
    thumbnail: photos.writing,
    skills: ['Writing', 'Grammar'],
    practicePoints: ['Email structure', 'Past tense', 'Friendly tone'],
    categoryTags: ['trending', 'writing'],
  },
  {
    id: 'city-guide-reading',
    title: 'City Guide',
    description: 'Read a short city guide and answer comprehension questions.',
    type: 'reading',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 12,
    thumbnail: photos.city,
    skills: ['Reading', 'Vocabulary'],
    practicePoints: ['Skimming', 'Detail questions', 'Context clues'],
    categoryTags: ['reading'],
  },
  {
    id: 'present-perfect-lab',
    title: 'Present Perfect Lab',
    description: 'Interactive challenges to master the present perfect tense.',
    type: 'grammar',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 10,
    thumbnail: photos.grammar,
    skills: ['Grammar'],
    practicePoints: ['Have/has + past participle', 'Time expressions', 'Common mistakes'],
    categoryTags: ['grammar', 'trending'],
  },
  {
    id: 'travel-words',
    title: 'Travel Words Boost',
    description: 'Learn and practice essential travel vocabulary with quick drills.',
    type: 'vocabulary',
    level: 'A2',
    difficulty: 'basic',
    duration: 8,
    thumbnail: photos.travel,
    skills: ['Vocabulary'],
    practicePoints: ['Airport words', 'Hotel phrases', 'Directions'],
    categoryTags: ['vocabulary', 'trending'],
  },
  {
    id: 'feel-the-lyrics',
    title: 'Feel the Lyrics',
    description: 'Complete song lyrics and learn expressions through music.',
    type: 'music',
    level: 'B2',
    difficulty: 'advanced',
    duration: 15,
    thumbnail: photos.music,
    skills: ['Listening', 'Vocabulary'],
    practicePoints: ['Lyrics cloze', 'Idioms', 'Pronunciation awareness'],
    categoryTags: ['music', 'trending'],
  },
  {
    id: 'workday-vlog',
    title: 'Workday Vlog',
    description: 'Watch a short vlog and answer questions about the speaker.',
    type: 'video',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 12,
    thumbnail: photos.office,
    skills: ['Listening', 'Comprehension'],
    practicePoints: ['Main idea', 'Details', 'Everyday speech'],
    categoryTags: ['videos', 'trending'],
  },
  {
    id: 'quick-quiz-arena',
    title: 'Quick Quiz Arena',
    description: 'Fast-paced English trivia across vocabulary and grammar.',
    type: 'game',
    level: 'A2',
    difficulty: 'basic',
    duration: 5,
    thumbnail: photos.game,
    skills: ['Vocabulary', 'Grammar'],
    practicePoints: ['Speed recall', 'Common errors', 'Fun competition'],
    categoryTags: ['games', 'trending'],
  },
  {
    id: 'cafe-order',
    title: 'Ordering at a Café',
    description: 'Listen to a café order and choose what the customer asked for.',
    type: 'listening',
    level: 'A1',
    difficulty: 'basic',
    duration: 5,
    thumbnail: photos.cafe,
    skills: ['Listening'],
    practicePoints: ['Food vocabulary', 'Polite requests'],
    categoryTags: ['listening'],
  },
  {
    id: 'opinion-paragraph',
    title: 'Share Your Opinion',
    description: 'Write a short paragraph giving your opinion on remote work.',
    type: 'writing',
    level: 'B2',
    difficulty: 'advanced',
    duration: 20,
    thumbnail: photos.remote,
    skills: ['Writing', 'Structure'],
    practicePoints: ['Opinion phrases', 'Linking words', 'Paragraph unity'],
    categoryTags: ['writing'],
  },
  {
    id: 'news-snippet',
    title: 'News Snippet',
    description: 'Read a short news excerpt and identify key facts.',
    type: 'reading',
    level: 'B2',
    difficulty: 'advanced',
    duration: 10,
    thumbnail: photos.news,
    skills: ['Reading'],
    practicePoints: ['Fact vs opinion', 'Headline meaning'],
    categoryTags: ['reading'],
  },
  {
    id: 'conditionals-challenge',
    title: 'Conditionals Challenge',
    description: 'Choose the correct conditional forms in everyday situations.',
    type: 'grammar',
    level: 'B2',
    difficulty: 'advanced',
    duration: 12,
    thumbnail: photos.chalkboard,
    skills: ['Grammar'],
    practicePoints: ['Zero/first/second conditional'],
    categoryTags: ['grammar'],
  },
  {
    id: 'phrasal-verbs-pack',
    title: 'Phrasal Verbs Pack',
    description: 'Match phrasal verbs with meanings in context.',
    type: 'vocabulary',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 10,
    thumbnail: photos.dictionary,
    skills: ['Vocabulary'],
    practicePoints: ['Common phrasal verbs', 'Context usage'],
    categoryTags: ['vocabulary'],
  },
  {
    id: 'chorus-fill',
    title: 'Chorus Fill-In',
    description: 'Fill in missing words from a popular chorus.',
    type: 'music',
    level: 'A2',
    difficulty: 'basic',
    duration: 8,
    thumbnail: photos.concert,
    skills: ['Listening', 'Vocabulary'],
    practicePoints: ['Rhymes', 'Common verbs'],
    categoryTags: ['music'],
  },
  {
    id: 'interview-clip',
    title: 'Interview Clip',
    description: 'Watch an interview excerpt and answer follow-up questions.',
    type: 'video',
    level: 'C1',
    difficulty: 'advanced',
    duration: 15,
    thumbnail: photos.interview,
    skills: ['Listening', 'Vocabulary'],
    practicePoints: ['Nuance', 'Paraphrase'],
    categoryTags: ['videos'],
  },
  {
    id: 'grammar-duel',
    title: 'Grammar Duel',
    description: 'Compete in a timed grammar challenge.',
    type: 'game',
    level: 'B1',
    difficulty: 'intermediate',
    duration: 8,
    thumbnail: photos.duel,
    skills: ['Grammar'],
    practicePoints: ['Accuracy under pressure'],
    categoryTags: ['games'],
  },
]

export function getActivityById(id: string): Activity | undefined {
  return activities.find((a) => a.id === id)
}

export function getActivitiesByType(type: ActivityType): Activity[] {
  return activities.filter((a) => a.type === type)
}

export function getTrendingActivities(): Activity[] {
  return activities.filter((a) => a.categoryTags?.includes('trending'))
}
