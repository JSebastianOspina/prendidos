import { turnProgress } from '../turn-progress';

const allLevels = ['easy', 'medium', 'hard'] as const;

describe('turnProgress', () => {
  it('has one segment per level in play, in play order', () => {
    const segments = turnProgress({
      selectedDifficulties: ['hard', 'easy'],
      endCondition: { type: 'rounds', rounds: 10 },
      currentRound: 1,
      scores: {},
      currentDifficulty: 'easy',
    });
    expect(segments.map((segment) => segment.difficulty)).toEqual(['easy', 'hard']);
  });

  it('falls back to every level when none is selected', () => {
    const segments = turnProgress({
      selectedDifficulties: [],
      endCondition: { type: 'open' },
      currentRound: 1,
      scores: {},
      currentDifficulty: 'easy',
    });
    expect(segments.map((segment) => segment.difficulty)).toEqual(allLevels);
  });

  it('fills the rounds already played, within the current level', () => {
    const segments = turnProgress({
      selectedDifficulties: [...allLevels],
      endCondition: { type: 'rounds', rounds: 10 },
      currentRound: 5,
      scores: {},
      currentDifficulty: 'medium',
    });
    expect(segments.map((segment) => segment.fill)).toEqual([1, expect.closeTo(0.2), 0]);
  });

  it('starts empty in the first round', () => {
    const segments = turnProgress({
      selectedDifficulties: [...allLevels],
      endCondition: { type: 'rounds', rounds: 5 },
      currentRound: 1,
      scores: {},
      currentDifficulty: 'easy',
    });
    expect(segments.map((segment) => segment.fill)).toEqual([0, 0, 0]);
  });

  it('follows the best score in points games', () => {
    const segments = turnProgress({
      selectedDifficulties: [...allLevels],
      endCondition: { type: 'points', target: 300 },
      currentRound: 3,
      scores: { ana: 150, beto: -4 },
      currentDifficulty: 'medium',
    });
    expect(segments.map((segment) => segment.fill)).toEqual([1, 0.5, 0]);
  });

  it('never fills the current level past its share or below zero', () => {
    const ahead = turnProgress({
      selectedDifficulties: [...allLevels],
      endCondition: { type: 'points', target: 100 },
      currentRound: 3,
      scores: { ana: 250 },
      currentDifficulty: 'hard',
    });
    expect(ahead.map((segment) => segment.fill)).toEqual([1, 1, 1]);

    const levelKept = turnProgress({
      selectedDifficulties: [...allLevels],
      endCondition: { type: 'points', target: 300 },
      currentRound: 3,
      scores: { ana: 20 },
      currentDifficulty: 'medium',
    });
    expect(levelKept.map((segment) => segment.fill)).toEqual([1, 0, 0]);
  });

  it('fills up to the current level in open games', () => {
    const segments = turnProgress({
      selectedDifficulties: [...allLevels],
      endCondition: { type: 'open' },
      currentRound: 7,
      scores: {},
      currentDifficulty: 'medium',
    });
    expect(segments.map((segment) => segment.fill)).toEqual([1, 1, 0]);
  });
});
