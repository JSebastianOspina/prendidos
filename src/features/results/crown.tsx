import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { BorderWidth, Colors } from '@/constants/theme';

type CrownProps = {
  /** Width in points; the height follows (0.7 × width). */
  width: number;
  testID?: string;
  style?: StyleProp<ViewStyle>;
};

/** Points and vertical offset of each diamond tip, as fractions of the crown width. */
const tips = [
  { centerX: 0.24, lift: 0 },
  { centerX: 0.5, lift: 0.08 },
  { centerX: 0.76, lift: 0 },
] as const;

/**
 * The winner's crown, drawn with views (no SVG library): a `points` band with an `ink`
 * outline and three diamond tips whose lower halves hide behind the band. Decorative.
 */
export function Crown({ width, testID, style }: CrownProps) {
  const height = Math.round(width * 0.7);
  const bandHeight = Math.round(height * 0.45);
  const tipSide = Math.round(width * 0.32);
  const bandTop = height - bandHeight;

  return (
    <View
      testID={testID}
      accessible={false}
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height }, style]}
    >
      {tips.map((tip) => (
        <View
          key={tip.centerX}
          style={[
            styles.piece,
            styles.tip,
            {
              width: tipSide,
              height: tipSide,
              left: width * tip.centerX - tipSide / 2,
              top: bandTop - width * tip.lift - tipSide / 2,
            },
          ]}
        />
      ))}
      <View style={[styles.piece, styles.band, { height: bandHeight }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    backgroundColor: Colors.points,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
  },
  tip: {
    borderRadius: BorderWidth.small,
    transform: [{ rotate: '45deg' }],
  },
  band: {
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: BorderWidth.regular,
  },
});
