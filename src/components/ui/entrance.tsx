import { useEffect, useState, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Motion, type SpringToken } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

import { entranceFor } from './motion';

/** How far a piece entering `from: 'below'` starts under its place, in points. */
export const entranceRise = 24;

export type EntranceProps = {
  /** `below`: rises into place and fades in (cards). `small`: grows to full size (mascot pops). */
  from: 'below' | 'small';
  spring: SpringToken;
  /** Starting scale for `from: 'small'`. */
  startScale?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Plays one entrance on mount, on the UI thread: a spring with a small overshoot, or a
 * 200 ms opacity fade under Reduce Motion. Remount it (`key`) to play it again. Transforms
 * never change layout, so nothing around it moves and taps outside it are never delayed.
 */
export function Entrance({ from, spring, startScale = 0.4, children, style, testID }: EntranceProps) {
  const reduceMotion = useReduceMotion();
  // The kind is fixed when the entrance starts; a setting change applies to the next one.
  const [kind] = useState(() => entranceFor(reduceMotion));
  const progress = useSharedValue(0);

  useEffect(() => {
    // The Reduce Motion choice is made above, so Reanimated must not skip the fade itself.
    progress.value =
      kind === 'fade'
        ? withTiming(1, { duration: Motion.reducedFadeMs, reduceMotion: ReduceMotion.Never })
        : withSpring(1, { ...spring, reduceMotion: ReduceMotion.Never });
  }, [kind, progress, spring]);

  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.value;
    if (kind === 'fade') return { opacity: value };
    if (from === 'below') {
      return {
        opacity: Math.min(value, 1),
        transform: [{ translateY: (1 - value) * entranceRise }],
      };
    }
    return { transform: [{ scale: startScale + (1 - startScale) * value }] };
  });

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
