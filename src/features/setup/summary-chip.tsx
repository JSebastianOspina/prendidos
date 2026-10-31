import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BorderWidth, Colors, Fonts, Radius, Spacing } from '@/constants/theme';

export type SummaryChipProps = {
  /** Small caption, e.g. "Fin". */
  caption: string;
  /** Current value, e.g. "10 rondas". */
  value: string;
  accessibilityLabel: string;
  onPress: () => void;
  /** Set for chips that open a list; `undefined` for plain actions. */
  expanded?: boolean;
};

const chipMinHeight = 56;

/** One of the FIN / NIVELES / ORDEN chips: a caption over the current value. */
export function SummaryChip({
  caption,
  value,
  accessibilityLabel,
  onPress,
  expanded,
}: SummaryChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={expanded === undefined ? undefined : { expanded }}
      onPress={onPress}
      style={[styles.chip, expanded && styles.open]}
    >
      <AppText variant="label" color={Colors.textMuted} style={styles.caption}>
        {caption}
      </AppText>
      <AppText style={styles.value} numberOfLines={2}>
        {value}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minHeight: chipMinHeight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
  },
  open: {
    backgroundColor: Colors.surfaceSoft,
  },
  caption: {
    fontSize: 11,
  },
  value: {
    fontFamily: Fonts.nunitoExtraBold,
    fontSize: 15,
    lineHeight: 19,
    textAlign: 'center',
  },
});
