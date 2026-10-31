import type { GameSession } from '@/features/game';

/**
 * Rounds the group actually played. When a round wraps the engine already moves to the next
 * one (first player, round + 1); if the game ends there, nobody played that round yet.
 */
export function roundsPlayed({
  currentRound,
  currentPlayerIndex,
}: Pick<GameSession, 'currentRound' | 'currentPlayerIndex'>): number {
  return currentPlayerIndex === 0 ? Math.max(1, currentRound - 1) : currentRound;
}
