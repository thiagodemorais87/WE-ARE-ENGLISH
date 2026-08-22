import { games } from '@/data/games'
import type { GameItem } from '@/types/activity'

/** Stub for future official Kahoot integrations. Returns mocks only. */
export async function listKahootGames(): Promise<GameItem[]> {
  return games.filter((g) => g.provider === 'kahoot' || g.provider === 'internal')
}
