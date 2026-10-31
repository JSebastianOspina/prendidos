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

const friendsCardName = `${homeCopy.modes.friends.title}. ${homeCopy.modes.friends.subtitle}`;
const coupleCardName = `${homeCopy.modes.couple.title}. ${homeCopy.modes.couple.subtitle}`;

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
  it('shows the wordmark as the heading and asks who is playing', async () => {
    await renderHome();
    expect(screen.getByRole('header', { name: homeCopy.wordmark })).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: homeCopy.modeQuestion })).toBeOnTheScreen();
    expect(homeCopy.modeQuestion).toBe('¿Con quién va a jugar hoy?');
  });

  it('hides the decorative logo tile and illustrations from screen readers', async () => {
    await renderHome();
    expect(screen.queryByRole('image')).not.toBeOnTheScreen();
    expect(screen.getAllByRole('image', { includeHiddenElements: true })).toHaveLength(1);
  });

  it('offers Amigos and Pareja with their subtitles', async () => {
    await renderHome();
    expect(screen.getByRole('button', { name: friendsCardName })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: coupleCardName })).toBeOnTheScreen();
    expect(screen.getByText(homeCopy.modes.friends.subtitle)).toBeOnTheScreen();
    expect(screen.getByText(homeCopy.modes.couple.subtitle)).toBeOnTheScreen();
  });

  it('shows the moderation footer', async () => {
    await renderHome();
    expect(screen.getByText('Tome con moderación. Si tomó, no maneje.')).toBeOnTheScreen();
  });

  it('stores Pareja and opens the category list', async () => {
    await renderHome();
    await fireEvent.press(screen.getByRole('button', { name: coupleCardName }));
    expect(latestDraft?.mode).toBe('couple');
    expect(router.push).toHaveBeenCalledWith(routes.newGame.category);
  });

  it('clears the previous draft but keeps the remembered players', async () => {
    Storage.setItemSync(
      deviceStateKey,
      JSON.stringify({ lastPlayers: [rememberedPlayer], seenCardIds: [] }),
    );
    await renderHome();
    await act(() => {
      latestDraft?.setMode('couple');
      latestDraft?.setCategoryId('entre-dos');
    });
    expect(latestDraft?.categoryId).toBe('entre-dos');

    await fireEvent.press(screen.getByRole('button', { name: friendsCardName }));

    expect(latestDraft?.mode).toBe('friends');
    expect(latestDraft?.categoryId).toBeUndefined();
    expect(latestDraft?.players).toEqual([rememberedPlayer]);
    expect(router.push).toHaveBeenCalledWith(routes.newGame.category);
  });

  it('offers only the two modes: no new-game, resume, restore, or settings actions yet', async () => {
    await renderHome();
    expect(screen.queryByText(/Nueva partida/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Continuar partida/i)).not.toBeOnTheScreen();
    expect(screen.queryByText(/Restaurar compras/i)).not.toBeOnTheScreen();
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});
