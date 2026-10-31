import { createContext, use, useState, type ReactNode } from 'react';

import type { GameSession, Player } from '@/features/game/game-types';

import type { DeviceState } from './device-state';
import { readDeviceState, writeDeviceState } from './device-storage';

export type DeviceStateValue = DeviceState & {
  confirmAge: () => void;
  rememberPlayers: (players: Player[]) => void;
  rememberSpicyEnabled: (value: boolean) => void;
  /** Adds card ids to the seen history (game engine only). */
  markCardsSeen: (cardIds: readonly string[]) => void;
  /** Saves or clears the resumable game (game engine only). */
  saveActiveSession: (session: GameSession | undefined) => void;
};

const DeviceStateContext = createContext<DeviceStateValue | null>(null);

type DeviceStateProviderProps = {
  children: ReactNode;
  /** Clock for `ageConfirmedAt`; injectable for tests. */
  now?: () => string;
};

export function DeviceStateProvider({ children, now = () => new Date().toISOString() }: DeviceStateProviderProps) {
  const [deviceState, setDeviceState] = useState<DeviceState>(readDeviceState);

  const update = (change: (previous: DeviceState) => DeviceState) => {
    setDeviceState((previous) => {
      const next = change(previous);
      writeDeviceState(next);
      return next;
    });
  };

  const value: DeviceStateValue = {
    ...deviceState,
    confirmAge: () => update((previous) => ({ ...previous, ageConfirmedAt: now() })),
    rememberPlayers: (players) => update((previous) => ({ ...previous, lastPlayers: players })),
    rememberSpicyEnabled: (spicy) => update((previous) => ({ ...previous, lastSpicyEnabled: spicy })),
    markCardsSeen: (cardIds) =>
      update((previous) => {
        const fresh = cardIds.filter((id) => !previous.seenCardIds.includes(id));
        return fresh.length === 0 ? previous : { ...previous, seenCardIds: [...previous.seenCardIds, ...fresh] };
      }),
    saveActiveSession: (session) =>
      update(({ activeSession: _previousSession, ...rest }) => (session ? { ...rest, activeSession: session } : rest)),
  };

  return <DeviceStateContext value={value}>{children}</DeviceStateContext>;
}

export function useDeviceState(): DeviceStateValue {
  const value = use(DeviceStateContext);
  if (!value) throw new Error('useDeviceState must be used inside DeviceStateProvider');
  return value;
}
