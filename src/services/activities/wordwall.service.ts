import { games } from '@/data/games'
import type { GameItem } from '@/types/activity'

/** Stub for future official Wordwall integrations. Returns mocks only. */
export async function listWordwallGames(): Promise<GameItem[]> {
  return games.filter((g) => g.provider === 'wordwall' || g.provider === 'internal')
}
