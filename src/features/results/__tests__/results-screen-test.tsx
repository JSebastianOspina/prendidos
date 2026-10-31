import { act, fireEvent, render, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import type { Catalog } from '@/features/content/catalog';
import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { readDeviceState } from '@/features/device/device-storage';
import {
  GameProvider,
  NewGameDraftProvider,
  useGame,
  useNewGameDraft,
  type GameSettings,
  type GameValue,
  type NewGameDraftValue,
  type Player,
} from '@/features/game';
import { individualCard } from '@/features/game/__tests__/fixtures/game-fixtures';
import { routes } from '@/features/navigation/routes';

import { ResultsScreen } from '../results-screen';

const mockDismissTo = jest.fn();
const mockRedirect = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    dismissTo: (href: string) => mockDismissTo(href),
  },
  Redirect: ({ href }: { href: string }) => {
    mockRedirect(href);
    return null;
  },
}));

const ana: Player = {
  id: 'p1',
  name: 'Ana',
  gender: 'female',
  drinks: true,
  avatarId: 'avatar-01',
};
const luis: Player = {
  id: 'p2',
  name: 'Luis',
  gender: 'male',
  drinks: true,
  avatarId: 'avatar-02',
};
const beto: Player = {
  id: 'p3',
  name: 'Beto',
  gender: 'undisclosed',
  drinks: false,
  avatarId: 'avatar-03',
};

const catalog: Catalog = {
  categories: [{ id: 'la-previa', name: 'La Previa', mode: 'friends', freeDifficulties: ['easy'] }],
  // Every card is worth 6: completing adds 6, refusing subtracts 3.
  cards: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((id) => individualCard(id, { points: 6 })),
};

const settings: GameSettings = {
  mode: 'friends',
  categoryId: 'la-previa',
  players: [ana, luis, beto],
  selectedDifficulties: ['easy'],
  endCondition: { type: 'points', target: 100 },
  spicyEnabled: true,
};

const probe: { game?: GameValue; draft?: NewGameDraftValue } = {};

/** Exposes the game and the draft to the test after every render. */
function Probe() {
  const game = useGame();
  const draft = useNewGameDraft();
  useEffect(() => {
    probe.game = game;
    probe.draft = draft;
  });
  return null;
}

async function renderResults() {
  await render(
    <DeviceStateProvider now={() => '2026-10-31T20:00:00.000Z'}>
      <GameProvider
        catalog={catalog}
        environment={{ random: () => 0, createId: () => 'game-1', now: () => '2026-10-31' }}
      >
        <NewGameDraftProvider>
          <Probe />
          <ResultsScreen />
        </NewGameDraftProvider>
      </GameProvider>
    </DeviceStateProvider>,
  );
}

type TurnAction = 'complete' | 'refuse';

/** Plays one turn per player in order, then ends the game. */
async function finishGame(turns: TurnAction[]) {
  await act(() => {
    probe.game?.startGame(settings);
  });
  for (const turn of turns) {
    await act(() => {
      if (turn === 'complete') probe.game?.completeCard();
      else probe.game?.refuseCard();
    });
  }
  await act(() => probe.game?.endGame());
  mockRedirect.mockClear();
}

beforeEach(() => {
  Storage.clearSync();
  jest.clearAllMocks();
});

describe('ResultsScreen', () => {
  it('redirects home when there is no game', async () => {
    await renderResults();
    expect(mockRedirect).toHaveBeenCalledWith(routes.home);
    expect(screen.queryByText('Jugar otra vez')).toBeNull();
  });

  it('redirects home while the game is still in progress', async () => {
    await renderResults();
    await act(() => {
      probe.game?.startGame(settings);
    });
    expect(mockRedirect).toHaveBeenLastCalledWith(routes.home);
    expect(screen.queryByText('Jugar otra vez')).toBeNull();
    expect(readDeviceState().activeSession?.id).toBe('game-1');
  });

  it('highlights a single winner and lists the full ranking', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);

    expect(screen.getByRole('header', { name: 'Así quedó la noche' })).toBeTruthy();
    expect(screen.getByLabelText('Ganó Ana con 6 puntos')).toBeTruthy();
    expect(screen.getByText('¡Ganó la noche!')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 1: Ana, 6 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 2: Luis y Beto, menos 3 puntos')).toBeTruthy();
    expect(screen.getByText('2. Luis y Beto')).toBeTruthy();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('shows a tie for first as one shared position', async () => {
    await renderResults();
    await finishGame(['complete', 'complete', 'refuse']);

    expect(screen.getByText('¡Empate en la cima!')).toBeTruthy();
    expect(
      screen.getByLabelText('Empate en el primer puesto: Ana y Luis con 6 puntos'),
    ).toBeTruthy();
    expect(screen.getByText('1. Ana y Luis')).toBeTruthy();
    expect(screen.getByText('3. Beto')).toBeTruthy();
  });

  it('shows negative scores in the negative color', async () => {
    await renderResults();
    await finishGame(['complete', 'complete', 'refuse']);

    expect(screen.getByText('-3 pts')).toHaveStyle({ color: Colors.negative });
    expect(screen.getAllByText('6 pts')[0]).toHaveStyle({ color: Colors.ink });
  });

  it('no longer keeps the finished game as resumable', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);
    expect(readDeviceState().activeSession).toBeUndefined();
  });

  it('"Jugar otra vez" refills the draft and opens the setup', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);

    await fireEvent.press(screen.getByRole('button', { name: 'Jugar otra vez' }));

    expect(probe.draft?.toSettings()).toEqual(settings);
    expect(probe.game?.session).toBeUndefined();
    expect(mockDismissTo).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).toHaveBeenCalledWith(routes.newGame.setup);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('"Volver al inicio" forgets the game and goes home', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);

    await fireEvent.press(screen.getByRole('button', { name: 'Volver al inicio' }));

    expect(probe.game?.session).toBeUndefined();
    expect(mockDismissTo).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).toHaveBeenCalledWith(routes.home);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
