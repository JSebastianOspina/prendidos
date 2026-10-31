import { useEffect, type ReactNode } from 'react';
import { Text } from 'react-native';

import type { GameMode } from '@/features/content/card-types';
import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { GameProvider, NewGameDraftProvider, useNewGameDraft } from '@/features/game';

/** The same provider stack as the root layout. */
export function DraftProviders({ children }: { children: ReactNode }) {
  return (
    <DeviceStateProvider>
      <GameProvider>
        <NewGameDraftProvider>{children}</NewGameDraftProvider>
      </GameProvider>
    </DeviceStateProvider>
  );
}

/** Chooses a mode in the draft and renders the screen under test only once it is stored. */
export function WithDraftMode({ mode, children }: { mode: GameMode; children: ReactNode }) {
  const draft = useNewGameDraft();
  const isModeStored = draft.mode === mode;
  const { setMode } = draft;
  useEffect(() => {
    if (!isModeStored) setMode(mode);
  }, [isModeStored, mode, setMode]);
  return isModeStored ? children : null;
}

export const draftProbeTestId = 'draft-probe';

/** Prints the draft's mode and category so tests can assert what a tap stored. */
export function DraftProbe() {
  const { mode, categoryId } = useNewGameDraft();
  return <Text testID={draftProbeTestId}>{`${mode ?? 'none'}|${categoryId ?? 'none'}`}</Text>;
}
