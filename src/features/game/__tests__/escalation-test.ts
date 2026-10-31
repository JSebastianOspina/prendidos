import { currentDifficultyFor, orderedDifficulties } from '../escalation';
import type { EndCondition } from '../game-types';

const allLevels = ['easy', 'medium', 'hard'] as const;

describe('orderedDifficulties', () => {
  it('orders the selected levels from easy to hard and drops duplicates', () => {
    expect(orderedDifficulties(['hard', 'easy', 'hard'])).toEqual(['easy', 'hard']);
  });
});

describe('currentDifficultyFor', () => {
  const rounds10: EndCondition = { type: 'rounds', rounds: 10 };

  it.each([
    [1, 'easy'],
    [4, 'easy'],
    [5, 'medium'],
    [7, 'medium'],
    [8, 'hard'],
    [10, 'hard'],
  ])('in a 10-round game, round %i is %s', (round, expected) => {
    expect(currentDifficultyFor([...allLevels], rounds10, round, {})).toBe(expected);
  });

  it('walks only the selected levels, in order', () => {
    expect(currentDifficultyFor(['hard', 'medium'], rounds10, 1, {})).toBe('medium');
    expect(currentDifficultyFor(['hard', 'medium'], rounds10, 6, {})).toBe('hard');
    expect(currentDifficultyFor(['medium'], rounds10, 10, {})).toBe('medium');
  });

  it('measures thirds against the points goal using the best score', () => {
    const goal: EndCondition = { type: 'points', target: 300 };
    expect(currentDifficultyFor([...allLevels], goal, 9, { a: 99, b: -20 })).toBe('easy');
    expect(currentDifficultyFor([...allLevels], goal, 9, { a: 100 })).toBe('medium');
    expect(currentDifficultyFor([...allLevels], goal, 9, { a: 200 })).toBe('hard');
    expect(currentDifficultyFor([...allLevels], goal, 9, { a: 450 })).toBe('hard');
    expect(currentDifficultyFor([...allLevels], goal, 1, { a: -5 })).toBe('easy');
    expect(currentDifficultyFor([...allLevels], goal, 1, {})).toBe('easy');
  });

  it('steps up every five rounds in an open game', () => {
    const open: EndCondition = { type: 'open' };
    expect(currentDifficultyFor([...allLevels], open, 5, {})).toBe('easy');
    expect(currentDifficultyFor([...allLevels], open, 6, {})).toBe('medium');
    expect(currentDifficultyFor([...allLevels], open, 11, {})).toBe('hard');
    expect(currentDifficultyFor([...allLevels], open, 40, {})).toBe('hard');
  });

  it('falls back to every level when none is selected', () => {
    expect(currentDifficultyFor([], rounds10, 1, {})).toBe('easy');
  });
});
