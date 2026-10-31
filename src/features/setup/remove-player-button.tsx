import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BorderWidth, Colors, Radius, TouchTarget } from '@/constants/theme';

import { removePlayerLabel, setupCopy } from './copy';

export type RemovePlayerButtonProps = {
  /** 1-based turn position, used in the accessibility label. */
  position: number;
  onPress: () => void;
};

/** Square outlined "×" that removes a player; shared by expanded and collapsed rows. */
export function RemovePlayerButton({ position, onPress }: RemovePlayerButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={removePlayerLabel(position)}
      onPress={onPress}
      style={styles.button}
    >
      <AppText variant="button">{setupCopy.removeSymbol}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: TouchTarget.minimum,
    height: TouchTarget.minimum,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
});
