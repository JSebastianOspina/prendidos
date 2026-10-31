import { act, renderHook } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import type { ReactNode } from 'react';

import type { Catalog } from '@/features/content/catalog';
import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { readDeviceState } from '@/features/device/device-storage';

import { GameProvider, useGame } from '../game-provider';
import type { GameEnvironment } from '../game-types';
import {
  ana,
  beto,
  friendsSettings,
  groupCard,
  individualCard,
  testCategories,
} from './fixtures/game-fixtures';

const catalog: Catalog = {
  categories: testCategories,
  cards: [
    individualCard('e1', { points: 1, body: 'Abrace a {player}.' }),
    individualCard('e3', { points: 3 }),
    individualCard('t1', { points: 2, targetGender: 'male', body: 'Mire a {player}.' }),
    individualCard('c1', { categoryId: 'entre-dos', body: 'Bese la mano de {partner}.' }),
    groupCard('g1'),
  ],
};

let environment: GameEnvironment;

function wrapper({ children }: { children: ReactNode }) {
  return (
    <DeviceStateProvider now={() => '2026-10-31T20:00:00.000Z'}>
      <GameProvider catalog={catalog} environment={environment}>
        {children}
      </GameProvider>
    </DeviceStateProvider>
  );
}

beforeEach(() => {
  Storage.clearSync();
  environment = {
    random: () => 0.99,
    createId: () => 'game-1',
    now: () => '2026-10-31T20:00:00.000Z',
  };
});

describe('useGame', () => {
  it('has no game before one starts', async () => {
    const { result } = await renderHook(() => useGame(), { wrapper });
    expect(result.current.session).toBeUndefined();
    expect(result.current.ranking).toEqual([]);
    expect(result.current.isGroupInterlude).toBe(false);
    expect(result.current.canSwap).toBe(false);
    await act(() => result.current.completeCard());
    expect(result.current.session).toBeUndefined();
  });

  it('starts a game, renders the card, and saves the session and players', async () => {
    const { result } = await renderHook(() => useGame(), { wrapper });
    let errors: string[] = [];
    await act(() => {
      errors = result.current.startGame(friendsSettings({ players: [ana, beto] }));
    });
    expect(errors).toEqual([]);
    expect(result.current.currentPlayer?.name).toBe('Ana');
    expect(result.current.currentCard?.id).toBe('e1');
    expect(result.current.currentCardCopy?.body).toBe('Abrace a Beto.');
    expect(result.current.currentDifficulty).toBe('easy');
    expect(result.current.canSwap).toBe(true);

    const saved = readDeviceState();
    expect(saved.activeSession?.id).toBe('game-1');
    expect(saved.lastPlayers).toEqual([ana, beto]);
    expect(saved.seenCardIds).toEqual(['e1']);
  });

  it('reports why a game cannot start', async () => {
    const { result } = await renderHook(() => useGame(), { wrapper });
    let errors: string[] = [];
    await act(() => {
      errors = result.current.startGame(friendsSettings({ players: [ana] }));
    });
    expect(errors).toEqual(['playerCount']);
    expect(result.current.session).toBeUndefined();
  });

  it('plays turns, swaps, and ranks the players', async () => {
    const { result } = await renderHook(() => useGame(), { wrapper });
    await act(() => result.current.startGame(friendsSettings({ players: [ana, beto] })));
    await act(() => result.current.swapCard());
    expect(result.current.canSwap).toBe(false);
    const swappedPoints = result.current.currentCard?.points ?? 0;
    await act(() => result.current.completeCard());
    expect(result.current.lastOutcome).toMatchObject({
      kind: 'completed',
      playerId: 'p1',
      pointsDelta: swappedPoints,
    });
    await act(() => result.current.refuseCard());
    expect(result.current.lastOutcome?.kind).toBe('refused');
    expect(result.current.ranking[0].player.name).toBe('Ana');
  });

  it('ends the game, clears the saved session, and forgets it on demand', async () => {
    const { result } = await renderHook(() => useGame(), { wrapper });
    await act(() =>
      result.current.startGame(
        friendsSettings({ players: [ana, beto], endCondition: { type: 'open' } }),
      ),
    );
    await act(() => result.current.endGame());
    expect(result.current.session?.status).toBe('finished');
    expect(result.current.currentCard).toBeUndefined();
    expect(readDeviceState().activeSession).toBeUndefined();
    await act(() => result.current.clearFinishedGame());
    expect(result.current.session).toBeUndefined();
  });

  it('shows group interludes and continues after them', async () => {
    environment = { ...environment, random: () => 0 };
    const { result } = await renderHook(() => useGame(), { wrapper });
    await act(() => result.current.startGame(friendsSettings({ players: [ana, beto] })));
    expect(result.current.isGroupInterlude).toBe(true);
    expect(result.current.canSwap).toBe(false);
    await act(() => result.current.nextAfterGroupCard());
    expect(result.current.isGroupInterlude).toBe(false);
    expect(result.current.currentPlayer?.name).toBe('Ana');
  });

  it('names the partner in couple mode', async () => {
    const { result } = await renderHook(() => useGame(), { wrapper });
    await act(() =>
      result.current.startGame(
        friendsSettings({ mode: 'couple', categoryId: 'entre-dos', players: [ana, beto] }),
      ),
    );
    expect(result.current.currentCardCopy?.body).toBe('Bese la mano de Beto.');
  });

  it('resumes the saved session after a restart', async () => {
    const first = await renderHook(() => useGame(), { wrapper });
    await act(() => first.result.current.startGame(friendsSettings({ players: [ana, beto] })));
    await first.unmount();

    const { result } = await renderHook(() => useGame(), { wrapper });
    expect(result.current.session?.id).toBe('game-1');
    expect(result.current.currentCardCopy?.body).toBe('Abrace a Beto.');
  });

  it('scores once per card when two taps land in the same render', async () => {
    const { result } = await renderHook(() => useGame(), { wrapper });
    await act(() => result.current.startGame(friendsSettings({ players: [ana, beto] })));
    await act(() => {
      result.current.completeCard();
      result.current.completeCard();
    });
    expect(result.current.session?.scores).toEqual({ p1: 1, p2: 0 });
    expect(result.current.currentPlayer?.name).toBe('Beto');
  });

  it('drops a saved game whose card no longer ships', async () => {
    const first = await renderHook(() => useGame(), { wrapper });
    await act(() => first.result.current.startGame(friendsSettings({ players: [ana, beto] })));
    await first.unmount();

    const { result } = await renderHook(() => useGame(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <DeviceStateProvider>
          <GameProvider
            catalog={{ ...catalog, cards: catalog.cards.filter((card) => card.id !== 'e1') }}
          >
            {children}
          </GameProvider>
        </DeviceStateProvider>
      ),
    });
    expect(result.current.session).toBeUndefined();
  });

  it('fails loudly outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useGame())).rejects.toThrow('GameProvider');
  });
});
