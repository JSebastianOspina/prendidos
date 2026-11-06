import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useReduceMotion } from '@/hooks/use-reduce-motion';

import { playPressHaptic } from './haptics';
import { pressTravelDurationFor } from './motion';

export type PressFeedback = {
  onPressIn: () => void;
  onPressOut: () => void;
  /** Goes on the animated face inside the static `Pressable` hit area. */
  animatedFaceStyle: ReturnType<typeof useAnimatedStyle>;
};

/**
 * The clay press shared by every clay button: the face sinks by `travel` over the press
 * duration with one light haptic, and comes back on release. Under Reduce Motion it sinks
 * at once; the haptic still plays, since it is not motion.
 */
export function usePressFeedback({ travel }: { travel: number }): PressFeedback {
  const reduceMotion = useReduceMotion();
  const offset = useSharedValue(0);

  function moveTo(target: number) {
    const duration = pressTravelDurationFor(reduceMotion);
    offset.value = duration === 0 ? target : withTiming(target, { duration });
  }

  const animatedFaceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return {
    onPressIn: () => {
      playPressHaptic();
      moveTo(travel);
    },
    onPressOut: () => moveTo(0),
    animatedFaceStyle,
  };
}
