import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BorderWidth, Colors, Radius, Spacing, TouchTarget } from '@/constants/theme';

import { setupCopy } from './copy';

const addButtonHeight = 52;

/** Dashed "+ Agregar jugador" (an empty slot waiting for a player). */
export function AddPlayerButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={setupCopy.addPlayerLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <AppText variant="button">{setupCopy.addPlayer}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Math.max(addButtonHeight, TouchTarget.minimum),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.regular,
    borderStyle: 'dashed',
    borderColor: Colors.ink,
  },
  pressed: {
    backgroundColor: Colors.surfaceSoft,
  },
});
