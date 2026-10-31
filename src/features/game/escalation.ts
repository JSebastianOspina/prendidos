import type { Difficulty } from '@/features/content/card-types';

import { allDifficulties, type EndCondition } from './game-types';

/** Rounds per level in an open game. */
export const openGameRoundsPerLevel = 5;

/** The selected levels in play order (easy → medium → hard), without duplicates. */
export function orderedDifficulties(selected: readonly Difficulty[]): Difficulty[] {
  return allDifficulties.filter((difficulty) => selected.includes(difficulty));
}

function progressLevelIndex(
  endCondition: EndCondition,
  currentRound: number,
  scores: Readonly<Record<string, number>>,
  levelCount: number,
): number {
  switch (endCondition.type) {
    case 'rounds':
      return Math.floor(((currentRound - 1) / endCondition.rounds) * levelCount);
    case 'points': {
      const bestScore = Math.max(0, ...Object.values(scores));
      return Math.floor((bestScore / endCondition.target) * levelCount);
    }
    case 'open':
      return Math.floor((currentRound - 1) / openGameRoundsPerLevel);
  }
}

/** Level for the current progress, walking only the selected levels in order. */
export function currentDifficultyFor(
  selectedDifficulties: readonly Difficulty[],
  endCondition: EndCondition,
  currentRound: number,
  scores: Readonly<Record<string, number>>,
): Difficulty {
  const ordered = orderedDifficulties(selectedDifficulties);
  const levels = ordered.length > 0 ? ordered : [...allDifficulties];
  const index = progressLevelIndex(endCondition, currentRound, scores, levels.length);
  return levels[Math.min(levels.length - 1, Math.max(0, index))];
}
