import { Spacing } from '@/constants/theme';

/** Tallest a card illustration is drawn on the turn card, in points. */
export const cardIllustrationMaxHeight = 160;

/** Below this height the card renders text-only, in points. */
export const cardIllustrationMinHeight = 72;

/** Space kept between the card text and the illustration, in points. */
export const cardIllustrationGap = Spacing.md;

/**
 * "Text wins": the illustration takes only the free space left under the fitted text
 * (`slotHeight`, measured with the illustration out of the layout flow), up to 160 pt.
 * Returns `null` when less than 72 pt is left, so the card renders text-only.
 */
export function illustrationHeightFor(slotHeight: number): number | null {
  const height = Math.min(cardIllustrationMaxHeight, slotHeight - cardIllustrationGap);
  return height >= cardIllustrationMinHeight ? height : null;
}
