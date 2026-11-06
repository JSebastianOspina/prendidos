import { Spacing } from '@/constants/theme';

import { cardIllustrationGap, cardIllustrationHeight, fitsIllustration } from '../illustration-fit';

describe('fitsIllustration', () => {
  const sizes = { illustrationHeight: 120, gap: 12 };

  it('fits when the slot has more room than the illustration and its gap', () => {
    expect(fitsIllustration({ slotHeight: 200, ...sizes })).toBe(true);
  });

  it('does not fit when the slot is shorter than the illustration and its gap', () => {
    expect(fitsIllustration({ slotHeight: 131, ...sizes })).toBe(false);
  });

  it('fits at the exact boundary (slot = height + gap)', () => {
    expect(fitsIllustration({ slotHeight: 132, ...sizes })).toBe(true);
  });

  it('does not fit in a zero slot (the text already fills the card)', () => {
    expect(fitsIllustration({ slotHeight: 0, ...sizes })).toBe(false);
  });

  it('uses a 120 pt illustration with a medium gap on the turn card', () => {
    expect(cardIllustrationHeight).toBe(120);
    expect(cardIllustrationGap).toBe(Spacing.md);
  });
});
