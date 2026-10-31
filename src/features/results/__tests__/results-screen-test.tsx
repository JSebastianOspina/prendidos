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

const dani: Player = {
  id: 'p4',
  name: 'Dani',
  gender: 'undisclosed',
  drinks: true,
  avatarId: 'avatar-04',
};
const caro: Player = {
  id: 'p5',
  name: 'Caro',
  gender: 'female',
  drinks: true,
  avatarId: 'avatar-05',
};

const catalog: Catalog = {
  categories: [{ id: 'la-previa', name: 'La Previa', mode: 'friends', freeDifficulties: ['easy'] }],
  // Every card is worth 6: completing adds 6, refusing subtracts 3.
  cards: Array.from({ length: 12 }, (_, index) => individualCard(`c${index + 1}`, { points: 6 })),
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

/** Plays the turns in player order, then ends the game. */
async function finishGame(turns: TurnAction[], gameSettings: GameSettings = settings) {
  await act(() => {
    probe.game?.startGame(gameSettings);
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
    expect(screen.queryByText('Otra partida')).toBeNull();
  });

  it('redirects home while the game is still in progress', async () => {
    await renderResults();
    await act(() => {
      probe.game?.startGame(settings);
    });
    expect(mockRedirect).toHaveBeenLastCalledWith(routes.home);
    expect(screen.queryByText('Otra partida')).toBeNull();
    expect(readDeviceState().activeSession?.id).toBe('game-1');
  });

  it('names a single winner in the header and centers them on the podium', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);

    expect(screen.getByRole('header', { name: '¡Ganó Ana!' })).toBeTruthy();
    expect(screen.getByText('La Previa · Meta 100 pts')).toBeTruthy();
    expect(screen.getByLabelText('Prendido, el gato, guiñando el ojo')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 1: Ana, 6 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 2: Luis, menos 3 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 2: Beto, menos 3 puntos')).toBeTruthy();
    expect(screen.getByTestId('winner-crown', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText(/comparten el primer puesto/)).toBeNull();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('colors the podium steps by position', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);

    expect(screen.getByTestId('podium-step-p1')).toHaveStyle({ backgroundColor: Colors.primary });
    expect(screen.getByTestId('podium-step-p2')).toHaveStyle({
      backgroundColor: Colors.surfaceSoft,
    });
    // Luis and Beto tie for second, so they share the step color and number.
    expect(screen.getByTestId('podium-step-p3')).toHaveStyle({
      backgroundColor: Colors.surfaceSoft,
    });
    expect(screen.getAllByText('2')).toHaveLength(2);
  });

  it('shows a tie for first as shared steps and a shared title', async () => {
    await renderResults();
    await finishGame(['complete', 'complete', 'refuse']);

    expect(screen.getByRole('header', { name: '¡Empate arriba!' })).toBeTruthy();
    expect(screen.getByText('Ana y Luis comparten el primer puesto.')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 1: Ana, 6 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 1: Luis, 6 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 3: Beto, menos 3 puntos')).toBeTruthy();
    expect(screen.getAllByText('1')).toHaveLength(2);
    expect(screen.getByTestId('podium-step-p3')).toHaveStyle({ backgroundColor: Colors.surface });
    expect(screen.queryByTestId('winner-crown', { includeHiddenElements: true })).toBeNull();
  });

  it('lists the players after the podium as rows with shared positions', async () => {
    await renderResults();
    await finishGame(
      ['complete', 'complete', 'complete', 'refuse', 'refuse', 'complete', 'refuse'],
      { ...settings, players: [ana, luis, beto, dani, caro], endCondition: { type: 'open' } },
    );

    expect(screen.getByText('La Previa · 2 rondas')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 1: Ana, 12 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 2: Beto, 6 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 3: Luis, 3 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 4: Dani, menos 3 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 4: Caro, menos 3 puntos')).toBeTruthy();
    for (const score of screen.getAllByText('-3 pts')) {
      expect(score).toHaveStyle({ color: Colors.negative });
    }
  });

  it('shows two steps in a two-player game', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse'], {
      ...settings,
      players: [ana, luis],
      endCondition: { type: 'open' },
    });

    expect(screen.getByText('La Previa · 1 ronda')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 1: Ana, 6 puntos')).toBeTruthy();
    expect(screen.getByLabelText('Puesto 2: Luis, menos 3 puntos')).toBeTruthy();
    expect(screen.queryByLabelText(/Puesto 3/)).toBeNull();
  });

  it('shows negative scores on the podium in the negative color', async () => {
    await renderResults();
    await finishGame(['complete', 'complete', 'refuse']);

    expect(screen.getByText('-3 pts')).toHaveStyle({ color: Colors.negative });
    expect(screen.getAllByText('6 pts')[0]).toHaveStyle({ color: Colors.ink });
  });

  it('keeps a negative winner score readable on the orange step', async () => {
    await renderResults();
    await finishGame(['refuse', 'refuse', 'refuse']);

    for (const score of screen.getAllByText('-3 pts')) {
      expect(score).toHaveStyle({ color: Colors.ink });
    }
  });

  it('keeps long names on one line and reads the full name', async () => {
    await renderResults();
    const maximiliano: Player = { ...ana, name: 'Maximiliano Andrés' };
    await finishGame(['complete', 'refuse', 'refuse'], {
      ...settings,
      players: [maximiliano, luis, beto],
    });

    expect(screen.getByLabelText('Puesto 1: Maximiliano Andrés, 6 puntos')).toBeTruthy();
    expect(screen.getByText('Maximiliano Andrés')).toHaveProp('numberOfLines', 1);
  });

  it('no longer keeps the finished game as resumable', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);
    expect(readDeviceState().activeSession).toBeUndefined();
  });

  it('"Otra partida" refills the draft and opens the setup', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);

    expect(screen.getByText('Otra partida')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Jugar otra partida' }));

    expect(probe.draft?.toSettings()).toEqual(settings);
    expect(probe.game?.session).toBeUndefined();
    expect(mockDismissTo).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).toHaveBeenCalledWith(routes.newGame.setup);
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('"Inicio" forgets the game and goes home', async () => {
    await renderResults();
    await finishGame(['complete', 'refuse', 'refuse']);

    expect(screen.getByText('Inicio')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Volver al inicio' }));

    expect(probe.game?.session).toBeUndefined();
    expect(mockDismissTo).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).toHaveBeenCalledWith(routes.home);
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
