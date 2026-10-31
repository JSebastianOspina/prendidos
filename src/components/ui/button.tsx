import { useRef } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

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
};

const fillByVariant: Record<ButtonVariant, { background: string; text: string }> = {
  primary: { background: Colors.primary, text: Colors.ink },
  secondary: { background: Colors.surface, text: Colors.ink },
  dark: { background: Colors.ink, text: Colors.white },
  onBrand: { background: Colors.white, text: Colors.ink },
};

/** Chunky clay button: ink outline and a hard shadow layer; the piece sinks when pressed. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  disabled = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const fill = fillByVariant[variant];
  const lastPressAt = useRef<number | undefined>(undefined);

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
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.face,
          { height, backgroundColor: fill.background },
          pressed && { transform: [{ translateY: PressedTravel }] },
        ]}
      >
        <AppText variant="button" color={fill.text}>
          {label}
        </AppText>
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
