import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

import { Motion, PressedTravel } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

import { playPressHaptic } from '../haptics';
import { usePressFeedback } from '../use-press-feedback';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  performAndroidHapticsAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
  AndroidHaptics: { Virtual_Key: 'virtual-key' },
}));
jest.mock('@/hooks/use-reduce-motion', () => ({ useReduceMotion: jest.fn() }));

const impactAsync = jest.mocked(Haptics.impactAsync);
const performAndroidHapticsAsync = jest.mocked(Haptics.performAndroidHapticsAsync);
const mockedUseReduceMotion = jest.mocked(useReduceMotion);

function onPlatform(os: typeof Platform.OS) {
  jest.replaceProperty(Platform, 'OS', os);
}

function PressProbe({ onPress }: { onPress: () => void }) {
  const { onPressIn, onPressOut, animatedFaceStyle } = usePressFeedback({ travel: PressedTravel });
  return (
    <Pressable testID="probe" onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View testID="probe-face" style={animatedFaceStyle} />
    </Pressable>
  );
}

const oneFrameMs = 16;

async function pressIn() {
  await fireEvent(screen.getByTestId('probe'), 'pressIn');
}

describe('playPressHaptic', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('plays one light impact on iOS', () => {
    onPlatform('ios');
    playPressHaptic();
    expect(impactAsync).toHaveBeenCalledTimes(1);
    expect(impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    expect(performAndroidHapticsAsync).not.toHaveBeenCalled();
  });

  it('plays one virtual-key haptic on Android, without the vibrator', () => {
    onPlatform('android');
    playPressHaptic();
    expect(performAndroidHapticsAsync).toHaveBeenCalledTimes(1);
    expect(performAndroidHapticsAsync).toHaveBeenCalledWith(Haptics.AndroidHaptics.Virtual_Key);
    expect(impactAsync).not.toHaveBeenCalled();
  });

  it('requests no haptic on web', () => {
    onPlatform('web');
    playPressHaptic();
    expect(impactAsync).not.toHaveBeenCalled();
    expect(performAndroidHapticsAsync).not.toHaveBeenCalled();
  });

  it('ignores a haptic that fails, whether it rejects or throws', async () => {
    onPlatform('ios');
    impactAsync.mockRejectedValueOnce(new Error('Low Power Mode'));
    expect(() => playPressHaptic()).not.toThrow();
    impactAsync.mockImplementationOnce(() => {
      throw new Error('Haptics unavailable');
    });
    expect(() => playPressHaptic()).not.toThrow();
    await Promise.resolve();
  });
});

describe('usePressFeedback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    onPlatform('ios');
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('sinks the face over the press duration with one haptic, and comes back on release', async () => {
    mockedUseReduceMotion.mockReturnValue(false);
    await render(<PressProbe onPress={jest.fn()} />);
    const face = screen.getByTestId('probe-face');

    await pressIn();
    expect(impactAsync).toHaveBeenCalledTimes(1);
    await act(() => jest.advanceTimersByTime(oneFrameMs));
    expect(face).not.toHaveAnimatedStyle({ transform: [{ translateY: PressedTravel }] });

    await act(() => jest.advanceTimersByTime(Motion.pressDurationMs + 20));
    expect(face).toHaveAnimatedStyle({ transform: [{ translateY: PressedTravel }] });

    await fireEvent(screen.getByTestId('probe'), 'pressOut');
    await act(() => jest.advanceTimersByTime(Motion.pressDurationMs + 20));
    expect(face).toHaveAnimatedStyle({ transform: [{ translateY: 0 }] });
  });

  it('sinks at once under Reduce Motion and still plays the haptic', async () => {
    mockedUseReduceMotion.mockReturnValue(true);
    await render(<PressProbe onPress={jest.fn()} />);

    await pressIn();
    // One frame, far shorter than the press travel: no animation runs.
    await act(() => jest.advanceTimersByTime(oneFrameMs));
    expect(screen.getByTestId('probe-face')).toHaveAnimatedStyle({
      transform: [{ translateY: PressedTravel }],
    });
    expect(impactAsync).toHaveBeenCalledTimes(1);
  });

  it('still runs the press when the haptic fails', async () => {
    mockedUseReduceMotion.mockReturnValue(false);
    impactAsync.mockRejectedValueOnce(new Error('Haptics off'));
    const onPress = jest.fn();
    await render(<PressProbe onPress={onPress} />);

    await pressIn();
    await fireEvent.press(screen.getByTestId('probe'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
