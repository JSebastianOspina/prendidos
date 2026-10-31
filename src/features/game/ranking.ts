import type { Player, RankingEntry } from './game-types';

/** Orders players by score; tied players share the position (1, 1, 3). */
export function rankPlayers(
  players: readonly Player[],
  scores: Readonly<Record<string, number>>,
): RankingEntry[] {
  const sorted = players
    .map((player) => ({ player, score: scores[player.id] ?? 0 }))
    .sort((first, second) => second.score - first.score);

  return sorted.map((entry) => {
    const firstWithSameScore = sorted.findIndex((other) => other.score === entry.score);
    return { ...entry, position: firstWithSameScore + 1 };
  });
}
