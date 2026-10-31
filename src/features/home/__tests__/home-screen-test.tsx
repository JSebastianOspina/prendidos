import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { deviceStateKey } from '@/features/device/device-storage';
import {
  GameProvider,
  NewGameDraftProvider,
  useNewGameDraft,
  type NewGameDraftValue,
  type Player,
} from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { homeCopy } from '../copy';
import { HomeScreen } from '../home-screen';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const rememberedPlayer: Player = { id: 'p1', name: 'Ana', gender: 'female', drinks: true };

let latestDraft: NewGameDraftValue | undefined;

/** Reads the draft through its public hook so the test can seed and inspect it. */
function DraftProbe({ onDraft }: { onDraft: (draft: NewGameDraftValue) => void }) {
  const draft = useNewGameDraft();
  useEffect(() => onDraft(draft), [draft, onDraft]);
  return null;
}

function captureDraft(draft: NewGameDraftValue) {
  latestDraft = draft;
}

async function renderHome() {
  return render(
    <DeviceStateProvider>
      <GameProvider>
        <NewGameDraftProvider>
          <HomeScreen />
          <DraftProbe onDraft={captureDraft} />
        </NewGameDraftProvider>
      </GameProvider>
    </DeviceStateProvider>,
  );
}

beforeEach(() => {
  Storage.clearSync();
  latestDraft = undefined;
  jest.mocked(router.push).mockClear();
});

describe('HomeScreen', () => {
  it('shows the wordmark as the heading and the tagline', async () => {
    await renderHome();
    expect(screen.getByRole('header', { name: homeCopy.wordmark })).toBeOnTheScreen();
    expect(screen.getByText(homeCopy.tagline)).toBeOnTheScreen();
  });

  it('hides the decorative logo tile from screen readers', async () => {
    await renderHome();
    expect(screen.queryByText(homeCopy.logoInitial)).not.toBeOnTheScreen();
    expect(screen.getByText(homeCopy.logoInitial, { includeHiddenElements: true })).toBeTruthy();
  });

  it('opens mode selection from "Nueva partida"', async () => {
    await renderHome();
    await fireEvent.press(screen.getByRole('button', { name: homeCopy.newGame }));
    expect(router.push).toHaveBeenCalledWith(routes.newGame.mode);
  });

  it('clears the previous draft but keeps the remembered players', async () => {
    Storage.setItemSync(
      deviceStateKey,
      JSON.stringify({ lastPlayers: [rememberedPlayer], seenCardIds: [] }),
    );
    await renderHome();
    await act(() => {
      latestDraft?.setMode('friends');
      latestDraft?.setCategoryId('la-previa');
    });
    expect(latestDraft?.categoryId).toBe('la-previa');

    await fireEvent.press(screen.getByRole('button', { name: homeCopy.newGame }));

    expect(latestDraft?.mode).toBeUndefined();
    expect(latestDraft?.categoryId).toBeUndefined();
    expect(latestDraft?.players).toEqual([rememberedPlayer]);
  });

  it('does not show the reserved resume and restore actions yet', async () => {
    await renderHome();
    expect(screen.queryByText(/Continuar partida/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Restaurar compras/i)).not.toBeOnTheScreen();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });
});
