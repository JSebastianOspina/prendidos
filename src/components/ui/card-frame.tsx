import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BorderWidth, Colors, Radius, ShadowOffset, Spacing } from '@/constants/theme';

export type CardFrameProps = {
  children: ReactNode;
  /** `group` is the yellow interlude card ("Yo nunca", "Todos los que…"). */
  tone?: 'surface' | 'group';
  style?: StyleProp<ViewStyle>;
};

/** The game card: radius 34, ink outline, and an 8 pt hard shadow. */
export function CardFrame({ children, tone = 'surface', style }: CardFrameProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.shadow} />
      <View style={[styles.face, { backgroundColor: tone === 'group' ? Colors.flameYellow : Colors.surface }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingBottom: ShadowOffset.gameCard,
  },
  shadow: {
    ...StyleSheet.absoluteFill,
    top: ShadowOffset.gameCard,
    borderRadius: Radius.card,
    backgroundColor: Colors.ink,
  },
  face: {
    borderRadius: Radius.card,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
});
