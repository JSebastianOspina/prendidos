import { drinksLabel, penaltyLine, pointsLabel, roundLabel, signedPointsLabel } from '../copy';

describe('play copy', () => {
  it('shows the round with the total only for games that end by rounds', () => {
    expect(roundLabel(3, { type: 'rounds', rounds: 10 })).toBe('Ronda 3 de 10');
    expect(roundLabel(3, { type: 'points', target: 200 })).toBe('Ronda 3');
    expect(roundLabel(7, { type: 'open' })).toBe('Ronda 7');
  });

  it('agrees drinks in number', () => {
    expect(drinksLabel(1)).toBe('Toma 1 trago');
    expect(drinksLabel(2)).toBe('Toma 2 tragos');
    expect(drinksLabel(3)).toBe('Toma 3 tragos');
  });

  it('appends the quip to the drinks when there is one', () => {
    expect(penaltyLine(2, 'por aguafiestas')).toBe('Toma 2 tragos — por aguafiestas');
    expect(penaltyLine(1)).toBe('Toma 1 trago');
  });

  it('formats points', () => {
    expect(pointsLabel(15)).toBe('15 pts');
    expect(pointsLabel(1)).toBe('1 pt');
    expect(signedPointsLabel(-3)).toBe('−3 pts');
    expect(signedPointsLabel(5)).toBe('+5 pts');
  });
});
