/**
 * Clay pieces the turn screen needs beyond the shared `Button` and `CardFrame`
 * (any fill, two-line labels, an edge-to-edge card footer). Same outline, radius and hard shadow.
 */
import { useRef, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { repeatedPressWindowMs } from '@/components/ui/button';
import {
  BorderWidth,
  Colors,
  PressedTravel,
  Radius,
  ShadowOffset,
  Spacing,
} from '@/constants/theme';

export type ClayButtonProps = {
  accessibilityLabel: string;
  onPress: () => void;
  children: ReactNode;
  fill?: string;
  height: number;
  shadow?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  faceStyle?: StyleProp<ViewStyle>;
};

/** A pressable clay piece; presses closer than `repeatedPressWindowMs` are ignored, like `Button`. */
export function ClayButton({
  accessibilityLabel,
  onPress,
  children,
  fill = Colors.surface,
  height,
  shadow = ShadowOffset.button,
  disabled = false,
  style,
  faceStyle,
}: ClayButtonProps) {
  const lastPressAt = useRef<number | undefined>(undefined);

  const handlePress = () => {
    const now = Date.now();
    if (lastPressAt.current !== undefined && now - lastPressAt.current < repeatedPressWindowMs)
      return;
    lastPressAt.current = now;
    onPress();
  };

  return (
    <View style={[{ height: height + shadow }, disabled && styles.disabled, style]}>
      <View style={[styles.buttonShadow, { height, top: shadow }]} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.buttonFace,
          { height, backgroundColor: fill },
          faceStyle,
          pressed && { transform: [{ translateY: Math.min(PressedTravel, shadow) }] },
        ]}
      >
        {children}
      </Pressable>
    </View>
  );
}

export type PlayCardProps = {
  fill: string;
  /** Degrees; small tilts only so the text stays easy to read. */
  rotation: number;
  children: ReactNode;
  /** Edge-to-edge strip at the bottom of the card. */
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** The game card on the turn screen: any fill, slightly tilted, content on top and footer below. */
export function PlayCard({ fill, rotation, children, footer, style }: PlayCardProps) {
  return (
    <View style={[styles.cardWrapper, { transform: [{ rotate: `${rotation}deg` }] }, style]}>
      <View style={styles.cardShadow} />
      <View style={[styles.cardFace, { backgroundColor: fill }]}>
        <View style={styles.cardBody}>{children}</View>
        {footer}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonShadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
  },
  buttonFace: {
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  disabled: {
    opacity: 0.5,
  },
  cardWrapper: {
    flexGrow: 1,
    paddingBottom: ShadowOffset.gameCard,
  },
  cardShadow: {
    ...StyleSheet.absoluteFill,
    top: ShadowOffset.gameCard,
    borderRadius: Radius.card,
    backgroundColor: Colors.ink,
  },
  cardFace: {
    flexGrow: 1,
    borderRadius: Radius.card,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    overflow: 'hidden',
  },
  cardBody: {
    flexGrow: 1,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
});
