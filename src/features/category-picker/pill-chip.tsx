import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BorderWidth, Colors, Radius, Spacing } from '@/constants/theme';

/** Small outlined pill with an uppercase label, e.g. "GRATIS" or "2 JUGADORES". */
export function PillChip({ label, backgroundColor }: { label: string; backgroundColor: string }) {
  return (
    <View style={[styles.chip, { backgroundColor }]}>
      <AppText variant="label">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'center',
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
});
