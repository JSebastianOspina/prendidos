import { CardTextSteps } from '@/constants/theme';

import { initialCardFit, nextCardFit, type CardFitState } from '../card-fit';

const smallest = CardTextSteps.length - 1;
const overflow = 0;
const tooLittleForArt = 40;
const roomForArt = 120;

describe('card body steps', () => {
  it('steps the body from 29 to 24 to 20 pt', () => {
    expect(CardTextSteps.map((step) => step.fontSize)).toEqual([29, 24, 20]);
    for (const step of CardTextSteps) expect(step.lineHeight).toBeGreaterThan(step.fontSize);
  });
});

describe('nextCardFit', () => {
  const fitting = (step: number): CardFitState => ({ phase: 'fitting', step });

  it('starts at the largest size', () => {
    expect(initialCardFit).toEqual(fitting(0));
  });

  it('steps down one size while the card overflows', () => {
    expect(nextCardFit(fitting(0), overflow, false)).toEqual(fitting(1));
    expect(nextCardFit(fitting(1), overflow, true)).toEqual(fitting(2));
  });

  it('settles at the smallest size when even that overflows, so the card scrolls', () => {
    expect(nextCardFit(fitting(smallest), overflow, false)).toEqual({ phase: 'settled', step: smallest });
  });

  it('settles a card without an illustration as soon as it fits', () => {
    expect(nextCardFit(fitting(0), tooLittleForArt, false)).toEqual({ phase: 'settled', step: 0 });
  });

  it('settles an illustrated card that already has room for its art', () => {
    expect(nextCardFit(fitting(0), roomForArt, true)).toEqual({ phase: 'settled', step: 0 });
  });

  it('tries one smaller size for an illustrated card that fits without room for its art', () => {
    expect(nextCardFit(fitting(0), tooLittleForArt, true)).toEqual({
      phase: 'artTrial',
      step: 1,
      fitStep: 0,
    });
  });

  it('keeps the smaller size when the art then gets at least 72 pt', () => {
    const trial: CardFitState = { phase: 'artTrial', step: 1, fitStep: 0 };
    expect(nextCardFit(trial, roomForArt, true)).toEqual({ phase: 'settled', step: 1 });
  });

  it('returns to the size that fit when the art still has no room', () => {
    const trial: CardFitState = { phase: 'artTrial', step: 2, fitStep: 1 };
    expect(nextCardFit(trial, tooLittleForArt, true)).toEqual({ phase: 'settled', step: 1 });
  });

  it('never tries below the smallest size', () => {
    expect(nextCardFit(fitting(smallest), tooLittleForArt, true)).toEqual({
      phase: 'settled',
      step: smallest,
    });
  });

  it('stays settled on later layouts, stepping down only if the card overflows', () => {
    const settled: CardFitState = { phase: 'settled', step: 0 };
    expect(nextCardFit(settled, tooLittleForArt, true)).toEqual(settled);
    expect(nextCardFit(settled, overflow, true)).toEqual({ phase: 'settled', step: 1 });
  });
});
