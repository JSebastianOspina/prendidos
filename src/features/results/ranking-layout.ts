import type { RankingEntry } from '@/features/game';

/** Players on the podium; everyone after them is a row. */
export const podiumSize = 3;

export type RankingLayout = {
  /** Everyone in first place (more than one on a tie). */
  winners: RankingEntry[];
  /** Podium steps left to right. */
  podium: RankingEntry[];
  /** Ranking order; positions stay as the engine set them, so ties share a number. */
  rows: RankingEntry[];
};

/**
 * Splits the engine's ranking into the podium and the rows. A sole winner stands in the
 * middle (2nd, 1st, 3rd); a shared first place keeps ranking order (1, 1, 3).
 */
export function layoutRanking(ranking: RankingEntry[]): RankingLayout {
  const winners = ranking.filter((entry) => entry.position === 1);
  const topEntries = ranking.slice(0, podiumSize);
  const [first, second, ...rest] = topEntries;
  const podium =
    winners.length === 1 && second !== undefined ? [second, first, ...rest] : topEntries;
  return { winners, podium, rows: ranking.slice(podiumSize) };
}
