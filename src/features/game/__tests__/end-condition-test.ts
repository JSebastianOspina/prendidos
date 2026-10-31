import { isGameOverAfterRound } from '../end-condition';

describe('isGameOverAfterRound', () => {
  it('ends a game by rounds after the last round', () => {
    expect(isGameOverAfterRound({ type: 'rounds', rounds: 5 }, 4, {})).toBe(false);
    expect(isGameOverAfterRound({ type: 'rounds', rounds: 5 }, 5, {})).toBe(true);
  });

  it('ends a game by points when a completed round has someone at the goal', () => {
    expect(isGameOverAfterRound({ type: 'points', target: 100 }, 3, { a: 99 })).toBe(false);
    expect(isGameOverAfterRound({ type: 'points', target: 100 }, 3, { a: 100 })).toBe(true);
  });

  it('never ends an open game on its own', () => {
    expect(isGameOverAfterRound({ type: 'open' }, 99, { a: 1000 })).toBe(false);
  });
});
