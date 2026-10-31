import { act, renderHook } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import type { ReactNode } from 'react';

import { DeviceStateProvider, useDeviceState } from '../device-state-provider';
import { deviceStateKey, readDeviceState } from '../device-storage';

const player = {
  id: 'p1',
  name: 'Ana',
  gender: 'female' as const,
  drinks: true,
  avatarId: 'avatar-01' as const,
};

function wrapper({ children }: { children: ReactNode }) {
  return (
    <DeviceStateProvider now={() => '2026-10-31T20:00:00.000Z'}>{children}</DeviceStateProvider>
  );
}

beforeEach(() => Storage.clearSync());

describe('useDeviceState', () => {
  it('starts empty on a fresh install', async () => {
    const { result } = await renderHook(() => useDeviceState(), { wrapper });
    expect(result.current.ageConfirmedAt).toBeUndefined();
    expect(result.current.lastPlayers).toEqual([]);
    expect(result.current.lastSpicyEnabled).toBe(false);
  });

  it('remembers everything across a restart', async () => {
    const { result, unmount } = await renderHook(() => useDeviceState(), { wrapper });
    await act(() => {
      result.current.confirmAge();
      result.current.rememberPlayers([player]);
      result.current.rememberSpicyEnabled(true);
      result.current.markCardsSeen(['a', 'b']);
      result.current.markCardsSeen(['b']);
    });
    await unmount();

    const reopened = await renderHook(() => useDeviceState(), { wrapper });
    expect(reopened.result.current).toMatchObject({
      ageConfirmedAt: '2026-10-31T20:00:00.000Z',
      lastPlayers: [player],
      lastSpicyEnabled: true,
      seenCardIds: ['a', 'b'],
    });
    expect(Storage.getItemSync(deviceStateKey)).not.toBeNull();
  });

  it('saves and clears the active session', async () => {
    const session = {
      id: 's1',
      settings: {
        mode: 'friends' as const,
        categoryId: 'la-previa',
        players: [player],
        selectedDifficulties: ['easy' as const],
        endCondition: { type: 'open' as const },
        spicyEnabled: false,
      },
      status: 'inProgress' as const,
      currentRound: 1,
      currentPlayerIndex: 0,
      scores: { p1: 0 },
      playedCardIds: ['a'],
      swapsUsed: {},
      couplePaywallShown: false,
      startedAt: '2026-10-31T20:00:00.000Z',
    };
    const { result } = await renderHook(() => useDeviceState(), { wrapper });
    await act(() => result.current.saveActiveSession(session));
    expect(readDeviceState().activeSession).toEqual(session);
    await act(() => result.current.saveActiveSession(undefined));
    expect(readDeviceState().activeSession).toBeUndefined();
  });

  it('uses the real clock by default', async () => {
    const { result } = await renderHook(() => useDeviceState(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <DeviceStateProvider>{children}</DeviceStateProvider>
      ),
    });
    await act(() => result.current.confirmAge());
    expect(Number.isNaN(Date.parse(result.current.ageConfirmedAt ?? ''))).toBe(false);
  });

  it('fails loudly outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useDeviceState())).rejects.toThrow('DeviceStateProvider');
  });
});
