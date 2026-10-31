import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

import { mascotArt, type MascotArtName } from './brand-art';

export type MascotProps = {
  art: MascotArtName;
  /** Height in points; the width follows the art's proportions. */
  size: number;
  /** Replaces the default Spanish description when the screen gives more context. */
  accessibilityLabel?: string;
  style?: StyleProp<ImageStyle>;
};

/** Prendido, the mascot, on a transparent background. */
export function Mascot({ art, size, accessibilityLabel, style }: MascotProps) {
  const { source, label, aspectRatio } = mascotArt[art];
  return (
    <Image
      source={source}
      contentFit="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[{ width: Math.round(size * aspectRatio), height: size }, style]}
    />
  );
}
