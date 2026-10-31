import type { EndCondition } from './game-types';

/** Whether the game ends once `completedRound` is over. Open games only end on request. */
export function isGameOverAfterRound(
  endCondition: EndCondition,
  completedRound: number,
  scores: Readonly<Record<string, number>>,
): boolean {
  switch (endCondition.type) {
    case 'rounds':
      return completedRound >= endCondition.rounds;
    case 'points':
      return Object.values(scores).some((score) => score >= endCondition.target);
    case 'open':
      return false;
  }
}
