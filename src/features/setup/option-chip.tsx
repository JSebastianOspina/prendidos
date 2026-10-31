import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BorderWidth, Colors, Radius, Spacing, TouchTarget } from '@/constants/theme';

export type OptionChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** `radio` for one-of choices, `checkbox` for toggles. */
  role: 'radio' | 'checkbox';
  accessibilityLabel?: string;
  /** Fill and text when selected; defaults to the dark `ink` toggle style. */
  selectedColors?: { fill: string; text: string };
};

const inkSelection = { fill: Colors.ink, text: Colors.white };

/** Pill toggle used in the level and end-condition lists. */
export function OptionChip({
  label,
  selected,
  onPress,
  role,
  accessibilityLabel,
  selectedColors = inkSelection,
}: OptionChipProps) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? selectedColors.fill : Colors.surface }]}
    >
      <AppText variant="body" color={selected ? selectedColors.text : Colors.textMuted}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: TouchTarget.minimum,
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.lg,
  },
});
