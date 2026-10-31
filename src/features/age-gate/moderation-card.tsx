import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BorderWidth, Colors, Radius, ShadowOffset, Spacing } from '@/constants/theme';

import { ShieldGlyph } from './shield-glyph';

export type ModerationCardProps = {
  message: string;
};

/**
 * White outlined card with the responsible-drinking notice. Smaller than the game `CardFrame`
 * (radius 20, 5 pt hard shadow, 16 pt padding), as on proposal board 01.
 */
export function ModerationCard({ message }: ModerationCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.shadow} />
      <View style={styles.face}>
        <ShieldGlyph />
        <AppText style={styles.message}>{message}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    paddingBottom: ShadowOffset.button,
  },
  shadow: {
    ...StyleSheet.absoluteFill,
    top: ShadowOffset.button,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
  },
  face: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
  },
  message: {
    flex: 1,
  },
});
