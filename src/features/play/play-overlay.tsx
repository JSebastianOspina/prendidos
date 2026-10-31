import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BorderWidth, Colors, Radius, Spacing } from '@/constants/theme';

/** Modal panel drawn over the turn screen (refusal penalty, end confirmation). */
export function PlayOverlay({ children }: { children: ReactNode }) {
  return (
    <View style={styles.scrim} accessibilityViewIsModal>
      <View style={styles.panel}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.scrim,
    justifyContent: 'center',
    padding: Spacing.gutter,
  },
  panel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
});
