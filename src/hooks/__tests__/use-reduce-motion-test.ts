import { act, renderHook } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { useReduceMotion } from '../use-reduce-motion';

jest.mock('react-native-reanimated', () => ({ useReducedMotion: jest.fn() }));

const mockedUseReducedMotion = jest.mocked(useReducedMotion);

type ReduceMotionListener = (isEnabled: boolean) => void;

function listenToReduceMotion() {
  const remove = jest.fn();
  let listener: ReduceMotionListener | undefined;
  const addEventListener = jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation(((eventName: string, handler: ReduceMotionListener) => {
      if (eventName === 'reduceMotionChanged') listener = handler;
      return { remove };
    }) as unknown as typeof AccessibilityInfo.addEventListener);
  return { addEventListener, remove, emit: (isEnabled: boolean) => listener?.(isEnabled) };
}

describe('useReduceMotion', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each([true, false])('starts from the launch value %s without waiting', async (launchValue) => {
    mockedUseReducedMotion.mockReturnValue(launchValue);
    listenToReduceMotion();
    const { result } = await renderHook(() => useReduceMotion());
    expect(result.current).toBe(launchValue);
  });

  it('follows the system setting when it changes while the app runs', async () => {
    mockedUseReducedMotion.mockReturnValue(false);
    const reduceMotion = listenToReduceMotion();
    const { result } = await renderHook(() => useReduceMotion());

    await act(() => reduceMotion.emit(true));
    expect(result.current).toBe(true);

    await act(() => reduceMotion.emit(false));
    expect(result.current).toBe(false);
  });

  it('stops listening on unmount', async () => {
    mockedUseReducedMotion.mockReturnValue(false);
    const reduceMotion = listenToReduceMotion();
    const { unmount } = await renderHook(() => useReduceMotion());
    expect(reduceMotion.addEventListener).toHaveBeenCalledWith('reduceMotionChanged', expect.any(Function));

    await unmount();
    expect(reduceMotion.remove).toHaveBeenCalledTimes(1);
  });
});
