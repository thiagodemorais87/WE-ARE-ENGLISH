import type { GameItem } from '@/types/activity'

export const games: GameItem[] = [
  {
    id: 'kahoot-challenge',
    title: 'Kahoot Challenge',
    description: 'Fast quiz rounds — classic battle energy.',
    thumbnail:
      'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&q=80&auto=format&fit=crop',
    players: '1–20',
    provider: 'kahoot',
    activityId: 'sys-game-quick-quiz',
  },
  {
    id: 'vocabulary-battle',
    title: 'Vocabulary Battle',
    description: 'Head-to-head word challenges.',
    thumbnail:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&auto=format&fit=crop',
    players: '1–4',
    provider: 'internal',
    activityId: 'sys-game-vocab-battle',
  },
  {
    id: 'grammar-challenge',
    title: 'Grammar Challenge',
    description: 'Timed grammar battles.',
    thumbnail:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&auto=format&fit=crop',
    players: 'Solo',
    provider: 'internal',
    activityId: 'sys-game-grammar-duel',
  },
  {
    id: 'quick-quiz',
    title: 'Quick Quiz',
    description: 'Five-minute mixed skills quiz.',
    thumbnail:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&auto=format&fit=crop',
    players: 'Solo',
    provider: 'quizizz',
    activityId: 'quick-quiz-arena',
  },
  {
    id: 'english-trivia',
    title: 'English Trivia',
    description: 'Culture, idioms, and everyday English.',
    thumbnail:
      'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80&auto=format&fit=crop',
    players: '1–8',
    provider: 'wordwall',
    activityId: 'grammar-duel',
  },
]
