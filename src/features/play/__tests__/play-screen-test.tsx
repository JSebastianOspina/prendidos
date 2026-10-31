import { fireEvent, render, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import { router } from 'expo-router';
import { useEffect, type ReactNode } from 'react';
import { Text } from 'react-native';

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

import { continueWithLabel, levelUpLine, playCopy } from '../copy';
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

/** Scores are no longer on the turn screen, so tests read them from the game. */
function ScoreProbe() {
  const { session } = useGame();
  const players = session?.settings.players ?? [];
  return (
    <Text testID="scores">
      {players.map((player) => `${player.name}=${session?.scores[player.id] ?? 0}`).join(' ')}
    </Text>
  );
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
            <ScoreProbe />
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

const completeFive = `${playCopy.completed} +5 pts`;
const refuseFive = `${playCopy.refused} −3 pts`;
const anyComplete = /^¡Cumplió!/;

async function pressMatching(name: RegExp) {
  clockMs += repeatedPressWindowMs;
  await fireEvent.press(screen.getByRole('button', { name }));
}

function scores(): string {
  return String(screen.getByTestId('scores').props.children);
}

/** Two players, five rounds, every level: rounds 1–2 are Suave and round 3 is Picante. */
const escalatingCards: Card[] = [
  individualCard('e1', { points: 5 }),
  individualCard('e2', { points: 5 }),
  individualCard('e3', { points: 5 }),
  individualCard('e4', { points: 5 }),
  individualCard('m1', { difficulty: 'medium', points: 12, body: 'Carta picante.' }),
];

async function completeTurns(count: number) {
  for (let turn = 0; turn < count; turn += 1) {
    await press(completeFive);
  }
}

describe('PlayScreen', () => {
  it('shows the top bar and the card with whose turn it is, without a scoreboard', async () => {
    await renderPlay();

    expect(screen.getByRole('button', { name: playCopy.pauseButton })).toBeTruthy();
    expect(screen.getByText('Ronda 1 de 5')).toBeTruthy();
    expect(screen.getByText('Cambiar (1)')).toBeTruthy();
    expect(screen.getByText(playCopy.turnOf)).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByLabelText('Avatar de Ana')).toBeTruthy();
    expect(screen.getByText('Abrace a Beto.')).toBeTruthy();
    expect(screen.getByText('5 pts')).toBeTruthy();
    expect(screen.getByText('Toma 1 trago — por floja')).toBeTruthy();
    expect(screen.queryByText(/Ana · /)).toBeNull();
    expect(screen.getByRole('button', { name: completeFive })).toBeTruthy();
    expect(screen.getByRole('button', { name: refuseFive })).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it('shows the level progress of the game in the top bar', async () => {
    await renderPlay();
    expect(screen.getByLabelText('Nivel actual: Suave')).toBeTruthy();
  });

  it('adds the points and passes the turn on Cumplió', async () => {
    await renderPlay();
    await press(completeFive);

    expect(screen.getByText('Beto')).toBeTruthy();
    expect(scores()).toBe('Ana=5 Beto=0');
    expect(screen.getByText('Cante una canción.')).toBeTruthy();
  });

  it('shows the refusal penalty before the next turn on No cumplió', async () => {
    await renderPlay();
    await press(refuseFive);

    expect(screen.getByText(playCopy.refusedBy('Ana'))).toBeTruthy();
    expect(screen.getAllByText('Toma 1 trago — por floja').length).toBeGreaterThan(0);
    expect(screen.getByText('−3 pts')).toBeTruthy();

    await press(playCopy.next);
    expect(screen.queryByText(playCopy.refusedBy('Ana'))).toBeNull();
    expect(screen.getByText('Beto')).toBeTruthy();
    expect(scores()).toBe('Ana=-3 Beto=0');
  });

  it('lets each player swap once, then shows the swap as unavailable', async () => {
    await renderPlay();
    await press(playCopy.swap);

    expect(screen.queryByText('Abrace a Beto.')).toBeNull();
    expect(screen.getByText('Cante una canción.')).toBeTruthy();
    const usedSwap = screen.getByRole('button', { name: playCopy.swapUsed });
    expect(usedSwap.props.accessibilityState).toEqual(expect.objectContaining({ disabled: true }));
    expect(screen.getByText('Cambiar (0)')).toBeTruthy();
    expect(screen.queryByRole('button', { name: playCopy.swap })).toBeNull();
  });

  it('shows group cards as an interlude that continues with the due player', async () => {
    await renderPlay({ cards: [...individualCards, groupCard('g1')], random: 0 });

    expect(screen.getByText('Ronda 1 de 5 · Interludio')).toBeTruthy();
    expect(screen.getByText(playCopy.everyoneChip)).toBeTruthy();
    expect(screen.getByLabelText('Nivel Suave')).toBeTruthy();
    expect(screen.getByRole('button', { name: playCopy.pauseButton })).toBeTruthy();
    expect(screen.queryByText(playCopy.turnOf)).toBeNull();
    expect(screen.queryByRole('button', { name: anyComplete })).toBeNull();
    expect(screen.queryByRole('button', { name: playCopy.swap })).toBeNull();

    await press(continueWithLabel('Ana'));
    expect(screen.queryByText(playCopy.everyoneChip)).toBeNull();
    expect(screen.getByText(playCopy.turnOf)).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
  });

  it('pauses and keeps the same card on Seguir jugando', async () => {
    await renderPlay();
    await press(playCopy.pauseButton);
    expect(screen.getByText(playCopy.pause)).toBeTruthy();
    // The screen behind the dialog is hidden from assistive tech, so only the dialog's round shows.
    expect(screen.getByText('Ronda 1 de 5')).toBeTruthy();
    expect(screen.queryByRole('button', { name: anyComplete })).toBeNull();

    await press(playCopy.keepPlaying);
    expect(screen.queryByText(playCopy.pause)).toBeNull();
    expect(screen.getByText('Abrace a Beto.')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  it('ends the game from the pause dialog and goes to the ranking', async () => {
    await renderPlay();
    await press(playCopy.pauseButton);
    await press(playCopy.endAndRank);
    expect(replace).toHaveBeenCalledWith(routes.results);
  });

  it('goes to the ranking by itself when the last turn is completed', async () => {
    await renderPlay();
    for (let turn = 0; turn < 10; turn += 1) {
      await pressMatching(anyComplete);
    }
    expect(replace).toHaveBeenCalledWith(routes.results);
  });

  it('shows the penalty of a refused last turn before going to the ranking', async () => {
    await renderPlay({ cards: [individualCard('only', { points: 5 })] });
    await completeTurns(9);
    await press(refuseFive);

    expect(screen.getByText(playCopy.refusedBy('Beto'))).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();

    await press(playCopy.next);
    expect(replace).toHaveBeenCalledWith(routes.results);
  });

  it('reads the round with the goal in points games', async () => {
    await renderPlay({
      settings: friendsSettings({
        players: [ana, beto],
        endCondition: { type: 'points', target: 200 },
      }),
    });
    expect(screen.getByText('Ronda 1 · Meta 200 pts')).toBeTruthy();
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

  describe('level up', () => {
    it('celebrates once when the level goes up, then shows the new card', async () => {
      await renderPlay({ cards: escalatingCards });
      expect(screen.queryByText(playCopy.keepPartying)).toBeNull();

      await completeTurns(4);
      expect(screen.getByText(playCopy.levelUpTitles.medium)).toBeTruthy();
      expect(screen.getByText(levelUpLine('medium'))).toBeTruthy();
      expect(screen.getByText(playCopy.moderation)).toBeTruthy();
      expect(screen.getAllByText('Ronda 3 de 5').length).toBeGreaterThan(0);
      expect(screen.getByLabelText(playCopy.currentLevel('medium'))).toBeTruthy();
      expect(screen.getByLabelText('Prendido, el gato, con mirada pícara')).toBeTruthy();
      expect(screen.queryByRole('button', { name: anyComplete })).toBeNull();

      await press(playCopy.keepPartying);
      expect(screen.queryByText(playCopy.levelUpTitles.medium)).toBeNull();
      expect(screen.getByText('Carta picante.')).toBeTruthy();
      expect(screen.getByRole('button', { name: `${playCopy.completed} +12 pts` })).toBeTruthy();
    });

    it('does not celebrate the level a game starts at', async () => {
      await renderPlay({
        cards: escalatingCards,
        settings: friendsSettings({ players: [ana, beto], selectedDifficulties: ['medium'] }),
      });
      expect(screen.getByText('Carta picante.')).toBeTruthy();
      expect(screen.queryByText(playCopy.keepPartying)).toBeNull();
    });

    it('waits for the individual card after a group interlude', async () => {
      await renderPlay({
        cards: [...escalatingCards, groupCard('gm1', { difficulty: 'medium' })],
        random: 0,
      });
      await completeTurns(4);
      expect(screen.getByText(playCopy.everyoneChip)).toBeTruthy();
      expect(screen.queryByText(playCopy.keepPartying)).toBeNull();

      await press(continueWithLabel('Ana'));
      expect(screen.getByText(levelUpLine('medium'))).toBeTruthy();
    });

    it('shows the refusal penalty before the level up', async () => {
      await renderPlay({ cards: escalatingCards });
      await completeTurns(3);
      await press(refuseFive);

      expect(screen.getByText(playCopy.refusedBy('Beto'))).toBeTruthy();
      expect(screen.queryByText(playCopy.keepPartying)).toBeNull();

      await press(playCopy.next);
      expect(screen.getByText(levelUpLine('medium'))).toBeTruthy();
    });
  });
});
