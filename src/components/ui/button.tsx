import { useRef } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  BorderWidth,
  Colors,
  PressedTravel,
  Radius,
  ShadowOffset,
  Spacing,
  TouchTarget,
} from '@/constants/theme';

import { AppText } from './app-text';
import { usePressFeedback } from './use-press-feedback';

/** Presses closer than this to the previous one are ignored (no double navigation or double turn). */
export const repeatedPressWindowMs = 600;

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'onBrand';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** `turn` is the 72-high action at the bottom of the turn screen. */
  size?: 'regular' | 'turn';
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  /** Stable selector for E2E flows (`.maestro/`). */
  testID?: string;
};

const fillByVariant: Record<ButtonVariant, { background: string; text: string }> = {
  primary: { background: Colors.primary, text: Colors.ink },
  secondary: { background: Colors.surface, text: Colors.ink },
  dark: { background: Colors.ink, text: Colors.white },
  onBrand: { background: Colors.white, text: Colors.ink },
};

/**
 * Chunky clay button: ink outline and a hard shadow layer. The `Pressable` is the static hit
 * area; only the face inside it sinks when pressed (`usePressFeedback`).
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}: ButtonProps) {
  const fill = fillByVariant[variant];
  const lastPressAt = useRef<number | undefined>(undefined);
  const { onPressIn, onPressOut, animatedFaceStyle } = usePressFeedback({ travel: PressedTravel });

  const handlePress = () => {
    const now = Date.now();
    if (lastPressAt.current !== undefined && now - lastPressAt.current < repeatedPressWindowMs)
      return;
    lastPressAt.current = now;
    onPress();
  };
  const height = size === 'turn' ? TouchTarget.turnAction : 60;

  return (
    <View
      style={[
        styles.wrapper,
        { height: height + ShadowOffset.button },
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={[styles.shadow, { height, top: ShadowOffset.button }]} />
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{ height }}
      >
        <Animated.View
          style={[styles.face, { backgroundColor: fill.background }, animatedFaceStyle]}
        >
          <AppText variant="button" color={fill.text}>
            {label}
          </AppText>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
  },
  shadow: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: Radius.lg,
    backgroundColor: Colors.ink,
  },
  face: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  disabled: {
    opacity: 0.5,
  },
});
