import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** The platform haptic for a clay press; `null` where none is played. */
function pressHapticRequest(): (() => Promise<void>) | null {
  switch (Platform.OS) {
    case 'ios':
      return () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    case 'android':
      // The haptics engine: the standard key-press feel, with no VIBRATE permission.
      return () => Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Virtual_Key);
    default:
      return null;
  }
}

/**
 * One light haptic for a press (design tokens § Motion). Fire-and-forget: a device
 * that cannot play it (Low Power Mode, haptics off, an error) never blocks the press.
 */
export function playPressHaptic(): void {
  const request = pressHapticRequest();
  if (request === null) return;
  try {
    request().catch(() => undefined);
  } catch {
    // Haptics are best-effort.
  }
}
