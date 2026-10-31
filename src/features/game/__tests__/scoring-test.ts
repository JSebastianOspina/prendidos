import { refusalPenaltyPoints } from '../scoring';

describe('refusalPenaltyPoints', () => {
  it.each([
    [7, 4],
    [8, 4],
    [1, 1],
    [30, 15],
  ])('subtracts half of %i rounded up (%i)', (points, expected) => {
    expect(refusalPenaltyPoints(points)).toBe(expected);
  });
});
