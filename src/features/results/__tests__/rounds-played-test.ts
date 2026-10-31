import { roundsPlayed } from '../rounds-played';

describe('roundsPlayed', () => {
  it('counts the current round while some player has taken a turn in it', () => {
    expect(roundsPlayed({ currentRound: 10, currentPlayerIndex: 2 })).toBe(10);
    expect(roundsPlayed({ currentRound: 2, currentPlayerIndex: 1 })).toBe(2);
  });

  it('does not count a round that started but where nobody has played', () => {
    expect(roundsPlayed({ currentRound: 2, currentPlayerIndex: 0 })).toBe(1);
  });

  it('never reports fewer than one round', () => {
    expect(roundsPlayed({ currentRound: 1, currentPlayerIndex: 0 })).toBe(1);
  });
});
