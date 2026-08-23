import type { ActivityType } from '@/types/activity'

export interface CategoryMeta {
  id: string
  label: string
  type?: ActivityType | 'trending'
  description: string
  icon: string
}

export const skillCategories: CategoryMeta[] = [
  {
    id: 'listening',
    label: 'Listening',
    type: 'listening',
    description: 'Practice understanding real spoken English.',
    icon: '🎧',
  },
  {
    id: 'pronunciation',
    label: 'Pronunciation',
    type: 'pronunciation',
    description: 'Listen, record yourself, and build clearer sounds and fluency.',
    icon: '🎤',
  },
  {
    id: 'writing',
    label: 'Writing',
    type: 'writing',
    description: 'Practice writing and improve your English.',
    icon: '✍️',
  },
  {
    id: 'reading',
    label: 'Reading',
    type: 'reading',
    description: 'Improve comprehension through texts and interactive exercises.',
    icon: '📖',
  },
  {
    id: 'vocabulary',
    label: 'Vocabulary',
    type: 'vocabulary',
    description: 'Learn and practice new words.',
    icon: '🧠',
  },
  {
    id: 'grammar',
    label: 'Grammar',
    type: 'grammar',
    description: 'Practice grammar through interactive challenges.',
    icon: '🔤',
  },
  {
    id: 'music',
    label: 'Music',
    type: 'music',
    description: 'Learn English through songs and lyrics.',
    icon: '🎵',
  },
  {
    id: 'videos',
    label: 'Videos',
    type: 'video',
    description: 'Watch real English content and complete interactive activities.',
    icon: '🎬',
  },
  {
    id: 'games',
    label: 'Games',
    type: 'game',
    description: 'Learn through quizzes, challenges and games.',
    icon: '🎮',
  },
]

export const carouselCategories: CategoryMeta[] = [
  {
    id: 'trending',
    label: 'Trending',
    type: 'trending',
    description: 'Popular right now',
    icon: '🔥',
  },
  ...skillCategories,
]

export const typeLabels: Record<ActivityType, string> = {
  listening: 'Listening',
  speaking: 'Speaking',
  pronunciation: 'Pronunciation',
  writing: 'Writing',
  reading: 'Reading',
  multiple_choice: 'Multiple choice',
  fill_blank: 'Fill in the blank',
  word_order: 'Word order',
  matching: 'Matching',
  true_false: 'True / False',
  vocabulary: 'Vocabulary',
  grammar: 'Grammar',
  music: 'Music',
  video: 'Videos',
  game: 'Games',
}

export const typeIcons: Record<ActivityType, string> = {
  listening: '🎧',
  speaking: '🗣️',
  pronunciation: '🎤',
  writing: '✍️',
  reading: '📖',
  multiple_choice: '✅',
  fill_blank: '📝',
  word_order: '🔀',
  matching: '🔗',
  true_false: '⚖️',
  vocabulary: '🧠',
  grammar: '🔤',
  music: '🎵',
  video: '🎬',
  game: '🎮',
}
