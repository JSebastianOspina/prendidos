import { StyleSheet, View } from 'react-native';

import { BorderWidth, Colors } from '@/constants/theme';

const shieldWidth = 22;
const shieldHeight = 26;

/**
 * Small outlined shield with a check, drawn from tokens (no icon library is used in the app yet).
 * Decorative: the moderation text next to it carries the meaning, so screen readers skip it.
 */
export function ShieldGlyph() {
  return (
    <View
      testID="shield-glyph"
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.shield}
    >
      <View style={styles.check} />
    </View>
  );
}

const styles = StyleSheet.create({
  shield: {
    width: shieldWidth,
    height: shieldHeight,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: shieldWidth / 2,
    borderBottomRightRadius: shieldWidth / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 9,
    height: 5,
    marginTop: -2,
    borderLeftWidth: BorderWidth.small,
    borderBottomWidth: BorderWidth.small,
    borderColor: Colors.ink,
    transform: [{ rotate: '-45deg' }],
  },
});
