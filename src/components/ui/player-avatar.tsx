import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BorderWidth, Colors } from '@/constants/theme';
import type { AvatarId } from '@/features/game/avatars';

import { avatarArt } from './brand-art';

export type PlayerAvatarProps = {
  avatarId: AvatarId;
  /** Side of the square frame in points (design tokens § Player Avatars in the UI). */
  size: number;
  /** Names the avatar for screen readers; without it the avatar is decorative next to the name. */
  playerName?: string;
  style?: StyleProp<ViewStyle>;
};

/** A player's cat in a square outlined frame; never cropped to a circle (hats stick out). */
export function PlayerAvatar({ avatarId, size, playerName, style }: PlayerAvatarProps) {
  const padding = Math.max(2, Math.round(size * 0.08));
  return (
    <View
      accessible={playerName !== undefined}
      accessibilityRole={playerName ? 'image' : undefined}
      accessibilityLabel={playerName ? `Avatar de ${playerName}` : undefined}
      importantForAccessibility={playerName ? 'yes' : 'no-hide-descendants'}
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: Math.round(size / 4), padding },
        style,
      ]}
    >
      <Image source={avatarArt[avatarId]} contentFit="contain" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: Colors.surface,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
  },
});
