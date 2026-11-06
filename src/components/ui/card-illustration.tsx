import { Image } from 'expo-image';

import type { IllustrationKey } from '@/features/content/card-types';

import { cardIllustrationArt } from './brand-art';

export type CardIllustrationProps = {
  illustration: IllustrationKey;
  /** Height in points; the width follows the art's proportions. */
  height: number;
};

/**
 * A card illustration library piece. Decorative: the card text carries the card,
 * so screen readers never focus or announce it.
 */
export function CardIllustration({ illustration, height }: CardIllustrationProps) {
  const { source, aspectRatio } = cardIllustrationArt[illustration];
  return (
    <Image
      testID="card-illustration"
      source={source}
      contentFit="contain"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: Math.round(height * aspectRatio), height }}
    />
  );
}
