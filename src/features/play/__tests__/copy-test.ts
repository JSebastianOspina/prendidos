import {
  continueWithLabel,
  drinksLabel,
  interludeLabel,
  levelUpLine,
  penaltyLine,
  pointsLabel,
  roundLabel,
  signedPointsLabel,
  swapLabel,
} from '../copy';

describe('play copy', () => {
  it('reads the round per end condition', () => {
    expect(roundLabel(3, { type: 'rounds', rounds: 10 })).toBe('Ronda 3 de 10');
    expect(roundLabel(3, { type: 'points', target: 200 })).toBe('Ronda 3 · Meta 200 pts');
    expect(roundLabel(7, { type: 'open' })).toBe('Ronda 7');
  });

  it('marks the group interlude in the round label', () => {
    expect(interludeLabel(4, { type: 'rounds', rounds: 10 })).toBe('Ronda 4 de 10 · Interludio');
    expect(interludeLabel(2, { type: 'open' })).toBe('Ronda 2 · Interludio');
  });

  it('counts the swaps left', () => {
    expect(swapLabel(true)).toBe('Cambiar (1)');
    expect(swapLabel(false)).toBe('Cambiar (0)');
  });

  it('names who is due after the interlude', () => {
    expect(continueWithLabel('Juanpa')).toBe('Seguir: le toca a Juanpa');
  });

  it('describes the new level with its points range', () => {
    expect(levelUpLine('hard')).toBe('Subimos a nivel Prendido: cartas de 21 a 30 puntos.');
    expect(levelUpLine('medium')).toBe('Subimos a nivel Picante: cartas de 11 a 20 puntos.');
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
