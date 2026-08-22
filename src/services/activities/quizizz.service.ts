import { games } from '@/data/games'
import type { GameItem } from '@/types/activity'

/** Stub for future official Quizizz integrations. Returns mocks only. */
export async function listQuizizzGames(): Promise<GameItem[]> {
  return games.filter((g) => g.provider === 'quizizz' || g.provider === 'internal')
}
