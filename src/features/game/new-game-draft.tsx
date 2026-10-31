import { createContext, use, useState, type ReactNode } from 'react';

import { allDifficulties, type Difficulty, type GameMode } from '@/features/content/card-types';
import { useDeviceState } from '@/features/device/device-state-provider';

import {
  defaultEndCondition,
  type EndCondition,
  type GameSettings,
  type Player,
} from './game-types';

export type NewGameDraft = {
  mode?: GameMode;
  categoryId?: string;
  players: Player[];
  selectedDifficulties: Difficulty[];
  endCondition: EndCondition;
  spicyEnabled: boolean;
};

export type NewGameDraftValue = NewGameDraft & {
  /** Changing the mode clears the category; couple mode turns Sin Filtro off. */
  setMode: (mode: GameMode) => void;
  setCategoryId: (categoryId: string) => void;
  setPlayers: (players: Player[]) => void;
  setSelectedDifficulties: (difficulties: Difficulty[]) => void;
  setEndCondition: (endCondition: EndCondition) => void;
  setSpicyEnabled: (spicyEnabled: boolean) => void;
  /** True once mode and category are chosen. */
  isReadyForSetup: boolean;
  /** Complete settings; throws when mode or category is missing. */
  toSettings: () => GameSettings;
  reset: () => void;
};

const NewGameDraftContext = createContext<NewGameDraftValue | null>(null);

export function NewGameDraftProvider({ children }: { children: ReactNode }) {
  const device = useDeviceState();
  const initialDraft = (): NewGameDraft => ({
    players: device.lastPlayers,
    selectedDifficulties: [...allDifficulties],
    endCondition: defaultEndCondition,
    spicyEnabled: device.lastSpicyEnabled,
  });
  const [draft, setDraft] = useState<NewGameDraft>(initialDraft);
  const change = (patch: Partial<NewGameDraft>) =>
    setDraft((previous) => ({ ...previous, ...patch }));

  const value: NewGameDraftValue = {
    ...draft,
    setMode: (mode) =>
      setDraft((previous) => ({
        ...previous,
        mode,
        categoryId: previous.mode === mode ? previous.categoryId : undefined,
        spicyEnabled: mode === 'couple' ? false : previous.spicyEnabled,
      })),
    setCategoryId: (categoryId) => change({ categoryId }),
    setPlayers: (players) => change({ players }),
    setSelectedDifficulties: (selectedDifficulties) => change({ selectedDifficulties }),
    setEndCondition: (endCondition) => change({ endCondition }),
    setSpicyEnabled: (spicyEnabled) => change({ spicyEnabled }),
    isReadyForSetup: draft.mode !== undefined && draft.categoryId !== undefined,
    toSettings: () => {
      if (!draft.mode || !draft.categoryId)
        throw new Error('Choose a mode and a category before the setup');
      return {
        mode: draft.mode,
        categoryId: draft.categoryId,
        players: draft.players,
        selectedDifficulties: draft.selectedDifficulties,
        endCondition: draft.endCondition,
        spicyEnabled: draft.mode === 'couple' ? false : draft.spicyEnabled,
      };
    },
    reset: () => setDraft(initialDraft()),
  };

  return <NewGameDraftContext value={value}>{children}</NewGameDraftContext>;
}

/** Mode, category, players, and options collected across the new-game screens. */
export function useNewGameDraft(): NewGameDraftValue {
  const value = use(NewGameDraftContext);
  if (!value) throw new Error('useNewGameDraft must be used inside NewGameDraftProvider');
  return value;
}
