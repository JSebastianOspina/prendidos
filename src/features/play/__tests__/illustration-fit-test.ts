import { Spacing } from '@/constants/theme';

import {
  cardIllustrationGap,
  cardIllustrationMaxHeight,
  cardIllustrationMinHeight,
  illustrationHeightFor,
} from '../illustration-fit';

describe('illustrationHeightFor', () => {
  it('uses 72–160 pt illustrations with a medium gap above them', () => {
    expect(cardIllustrationMaxHeight).toBe(160);
    expect(cardIllustrationMinHeight).toBe(72);
    expect(cardIllustrationGap).toBe(Spacing.md);
  });

  it('caps the illustration at 160 pt when there is plenty of room', () => {
    expect(illustrationHeightFor(400)).toBe(160);
  });

  it('fills the free space minus the gap when there is less room', () => {
    expect(illustrationHeightFor(100)).toBe(100 - cardIllustrationGap);
  });

  it('still shows a 72 pt illustration at the exact boundary', () => {
    expect(illustrationHeightFor(72 + cardIllustrationGap)).toBe(72);
  });

  it('shows no illustration just under the boundary', () => {
    expect(illustrationHeightFor(72 + cardIllustrationGap - 1)).toBeNull();
  });

  it('shows no illustration when the text already fills the card', () => {
    expect(illustrationHeightFor(0)).toBeNull();
  });
});
