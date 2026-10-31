import type { Difficulty } from '@/features/content/card-types';
import { allDifficulties, type EndCondition } from '@/features/game';

export type ProgressSegment = {
  difficulty: Difficulty;
  /** 0 (empty) to 1 (full). */
  fill: number;
};

export type TurnProgressInput = {
  selectedDifficulties: readonly Difficulty[];
  endCondition: EndCondition;
  currentRound: number;
  scores: Readonly<Record<string, number>>;
  /** Level of the card on screen; the bar never disagrees with it. */
  currentDifficulty: Difficulty;
};

/** Share of the game already played, or `undefined` when the game has no end (open). */
function playedShare(
  endCondition: EndCondition,
  currentRound: number,
  scores: Readonly<Record<string, number>>,
): number | undefined {
  switch (endCondition.type) {
    case 'rounds':
      return (currentRound - 1) / endCondition.rounds;
    case 'points':
      return Math.max(0, ...Object.values(scores)) / endCondition.target;
    case 'open':
      return undefined;
  }
}

function clampToUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/**
 * Top-bar progress: one segment per level in play. Levels before the current one are full,
 * later ones empty, and the current one shows the progress inside its share of the game.
 */
export function turnProgress({
  selectedDifficulties,
  endCondition,
  currentRound,
  scores,
  currentDifficulty,
}: TurnProgressInput): ProgressSegment[] {
  const selected = allDifficulties.filter((level) => selectedDifficulties.includes(level));
  const levels = selected.length > 0 ? selected : [...allDifficulties];
  const currentIndex = Math.max(0, levels.indexOf(currentDifficulty));
  const share = playedShare(endCondition, currentRound, scores);

  return levels.map((difficulty, index) => {
    if (index < currentIndex) return { difficulty, fill: 1 };
    if (index > currentIndex) return { difficulty, fill: 0 };
    const fill = share === undefined ? 1 : clampToUnit(share * levels.length - index);
    return { difficulty, fill };
  });
}
