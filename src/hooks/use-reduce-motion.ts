import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

/**
 * The system Reduce Motion setting (iOS "Reduce Motion", Android "Remove animations"),
 * kept live. Reanimated reads it synchronously, but only at app launch, so its value
 * seeds the first frame and the accessibility listener follows later changes.
 * Every motion consumer reads this one hook.
 */
export function useReduceMotion(): boolean {
  const reducedAtLaunch = useReducedMotion();
  const [reduceMotion, setReduceMotion] = useState(reducedAtLaunch);

  useEffect(() => {
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  return reduceMotion;
}
