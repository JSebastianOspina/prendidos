import { Spacing } from '@/constants/theme';

/** Tallest a card illustration is drawn on the turn card, in points. */
export const cardIllustrationHeight = 120;

/** Space kept between the card text and the illustration, in points. */
export const cardIllustrationGap = Spacing.md;

export type IllustrationFitInput = {
  /** Free height left below the card text, measured with the illustration hidden. */
  slotHeight: number;
  illustrationHeight: number;
  gap: number;
};

/**
 * "Text wins": the illustration shows only when it fits the free space under the
 * text without scrolling. A slot of 0 means the text already fills the card.
 */
export function fitsIllustration({ slotHeight, illustrationHeight, gap }: IllustrationFitInput): boolean {
  return slotHeight >= illustrationHeight + gap;
}
