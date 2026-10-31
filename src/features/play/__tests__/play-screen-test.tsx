import { fireEvent, render, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { repeatedPressWindowMs } from '@/components/ui/button';
import type { Card } from '@/features/content/card-types';
import type { Catalog } from '@/features/content/catalog';
import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { GameProvider, useGame, type GameEnvironment, type GameSettings } from '@/features/game';
import {
  ana,
  beto,
  friendsSettings,
  groupCard,
  individualCard,
  testCategories,
} from '@/features/game/__tests__/fixtures/game-fixtures';
import { routes } from '@/features/navigation/routes';

import { playCopy } from '../copy';
import { PlayScreen } from '../play-screen';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), push: jest.fn() },
}));

const replace = router.replace as jest.Mock;

const individualCards: Card[] = [
  individualCard('e1', { points: 5, body: 'Abrace a {player}.' }),
  individualCard('e2', { points: 6, body: 'Cante una canción.' }),
  individualCard('e3', { points: 7, body: 'Baile con {player}.' }),
];

function catalogWith(cards: Card[]): Catalog {
  return { categories: testCategories, cards };
}

function environmentWith(random: number): GameEnvironment {
  return { random: () => random, createId: () => 'game-1', now: () => '2026-10-31T20:00:00.000Z' };
}

/** Starts the game on mount and shows its children only once the session exists. */
function StartedGame({ settings, children }: { settings: GameSettings; children: ReactNode }) {
  const game = useGame();
  const { startGame } = game;
  useEffect(() => {
    startGame(settings);
    // Start once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return game.session ? children : null;
}

async function renderPlay({
  cards = individualCards,
  random = 0.99,
  settings = friendsSettings({ players: [ana, beto] }),
  started = true,
}: {
  cards?: Card[];
  random?: number;
  settings?: GameSettings;
  started?: boolean;
} = {}) {
  return render(
    <DeviceStateProvider now={() => '2026-10-31T20:00:00.000Z'}>
      <GameProvider catalog={catalogWith(cards)} environment={environmentWith(random)}>
        {started ? (
          <StartedGame settings={settings}>
            <PlayScreen />
          </StartedGame>
        ) : (
          <PlayScreen />
        )}
      </GameProvider>
    </DeviceStateProvider>,
  );
}

/** Fake clock so consecutive presses are never dropped as repeated presses by `Button`. */
let clockMs = 0;

async function press(label: string) {
  clockMs += repeatedPressWindowMs;
  await fireEvent.press(screen.getByRole('button', { name: label }));
}

beforeEach(() => {
  Storage.clearSync();
  replace.mockClear();
  clockMs = 0;
  jest.spyOn(Date, 'now').mockImplementation(() => clockMs);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('PlayScreen', () => {
  it('shows whose turn it is, the round, the scores, and the card', async () => {
    await renderPlay();

    expect(screen.getByText(playCopy.turnOf)).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('Ronda 1 de 5')).toBeTruthy();
    expect(screen.getByText('Ana · 0')).toBeTruthy();
    expect(screen.getByText('Beto · 0')).toBeTruthy();
    expect(screen.getByText('Abrace a Beto.')).toBeTruthy();
    expect(screen.getByText('5 pts')).toBeTruthy();
    expect(screen.getByText('Toma 1 trago — por floja')).toBeTruthy();
    expect(screen.getByRole('button', { name: playCopy.completed })).toBeTruthy();
    expect(screen.getByRole('button', { name: playCopy.refused })).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it('adds the points and passes the turn on Cumplió', async () => {
    await renderPlay();
    await press(playCopy.completed);

    expect(screen.getByText('Beto')).toBeTruthy();
    expect(screen.getByText('Ana · 5')).toBeTruthy();
    expect(screen.getByText('Cante una canción.')).toBeTruthy();
  });

  it('shows the refusal penalty before the next turn on No cumplió', async () => {
    await renderPlay();
    await press(playCopy.refused);

    expect(screen.getByText(playCopy.refusedBy('Ana'))).toBeTruthy();
    expect(screen.getAllByText('Toma 1 trago — por floja').length).toBeGreaterThan(0);
    expect(screen.getByText('−3 pts')).toBeTruthy();

    await press(playCopy.next);
    expect(screen.queryByText(playCopy.refusedBy('Ana'))).toBeNull();
    expect(screen.getByText('Beto')).toBeTruthy();
    expect(screen.getByText('Ana · -3')).toBeTruthy();
  });

  it('lets each player swap once, then shows the swap as unavailable', async () => {
    await renderPlay();
    await press(playCopy.swap);

    expect(screen.queryByText('Abrace a Beto.')).toBeNull();
    expect(screen.getByText('Cante una canción.')).toBeTruthy();
    const usedSwap = screen.getByRole('button', { name: playCopy.swapUsed });
    expect(usedSwap.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    expect(screen.queryByRole('button', { name: playCopy.swap })).toBeNull();
  });

  it('shows group cards as an interlude with a single Siguiente, then the due turn', async () => {
    await renderPlay({ cards: [...individualCards, groupCard('g1')], random: 0 });

    expect(screen.getByText(playCopy.forTheGroup)).toBeTruthy();
    expect(screen.queryByText(playCopy.turnOf)).toBeNull();
    expect(screen.queryByRole('button', { name: playCopy.completed })).toBeNull();
    expect(screen.queryByRole('button', { name: playCopy.swap })).toBeNull();

    await press(playCopy.next);
    expect(screen.queryByText(playCopy.forTheGroup)).toBeNull();
    expect(screen.getByText(playCopy.turnOf)).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
  });

  it('asks before ending the game and goes to the ranking on confirm', async () => {
    await renderPlay();
    await press(playCopy.endGame);
    expect(screen.getByText(playCopy.endConfirmTitle)).toBeTruthy();

    await press(playCopy.endCancel);
    expect(screen.queryByText(playCopy.endConfirmTitle)).toBeNull();
    expect(screen.getByText('Abrace a Beto.')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();

    await press(playCopy.endGame);
    await press(playCopy.endConfirm);
    expect(replace).toHaveBeenCalledWith(routes.results);
  });

  it('goes to the ranking by itself when the last turn is completed', async () => {
    await renderPlay();
    for (let turn = 0; turn < 10; turn += 1) {
      await press(playCopy.completed);
    }
    expect(replace).toHaveBeenCalledWith(routes.results);
  });

  it('shows the penalty of a refused last turn before going to the ranking', async () => {
    await renderPlay();
    for (let turn = 0; turn < 9; turn += 1) {
      await press(playCopy.completed);
    }
    await press(playCopy.refused);

    expect(screen.getByText(playCopy.refusedBy('Beto'))).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();

    await press(playCopy.next);
    expect(replace).toHaveBeenCalledWith(routes.results);
  });

  it('shows the round without a total in open games', async () => {
    await renderPlay({
      settings: friendsSettings({ players: [ana, beto], endCondition: { type: 'open' } }),
    });
    expect(screen.getByText('Ronda 1')).toBeTruthy();
  });

  it('sends the user home when there is no game', async () => {
    await renderPlay({ started: false });
    expect(replace).toHaveBeenCalledWith(routes.home);
  });
});
