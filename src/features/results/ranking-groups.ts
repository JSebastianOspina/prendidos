import type { Player, RankingEntry } from '@/features/game';

/** Players that finished on the same position (a tie) with their shared score. */
export type RankingGroup = {
  position: number;
  score: number;
  players: Player[];
};

/** Groups consecutive entries that share a position; the engine already ranked them. */
export function groupRankingByPosition(ranking: RankingEntry[]): RankingGroup[] {
  const groups: RankingGroup[] = [];
  for (const entry of ranking) {
    const lastGroup = groups.at(-1);
    if (lastGroup?.position === entry.position) {
      lastGroup.players.push(entry.player);
    } else {
      groups.push({ position: entry.position, score: entry.score, players: [entry.player] });
    }
  }
  return groups;
}
