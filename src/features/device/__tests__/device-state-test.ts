import type { Player } from '@/features/game/game-types';

import {
  emptyDeviceState,
  parseDeviceState,
  serializeDeviceState,
  type DeviceState,
} from '../device-state';

const player: Player = { id: 'p1', name: 'Ana', gender: 'female', drinks: true };

describe('parseDeviceState', () => {
  it('returns the empty state for missing or corrupt data', () => {
    expect(parseDeviceState(null)).toEqual(emptyDeviceState);
    expect(parseDeviceState('{not json')).toEqual(emptyDeviceState);
    expect(parseDeviceState('42')).toEqual(emptyDeviceState);
    expect(parseDeviceState('null')).toEqual(emptyDeviceState);
  });

  it('round-trips a full device state', () => {
    const state: DeviceState = {
      ageConfirmedAt: '2026-10-31T20:00:00.000Z',
      lastPlayers: [player],
      seenCardIds: ['prev-001'],
      lastSpicyEnabled: true,
      activeSession: {
        id: 's1',
        settings: {
          mode: 'friends',
          categoryId: 'la-previa',
          players: [player],
          selectedDifficulties: ['easy'],
          endCondition: { type: 'open' },
          spicyEnabled: false,
        },
        status: 'inProgress',
        currentRound: 1,
        currentPlayerIndex: 0,
        scores: { p1: 0 },
        playedCardIds: ['prev-001'],
        swapsUsed: {},
        couplePaywallShown: false,
        startedAt: '2026-10-31T20:00:00.000Z',
      },
    };
    expect(parseDeviceState(serializeDeviceState(state))).toEqual(state);
  });

  it('drops fields with the wrong shape and keeps the valid ones', () => {
    const raw = JSON.stringify({
      ageConfirmedAt: 5,
      lastPlayers: [player, { id: 'p2', name: 'x', gender: 'robot', drinks: true }, 'junk'],
      seenCardIds: ['a', 3],
      lastSpicyEnabled: 'yes',
      activeSession: { id: 's1' },
    });
    expect(parseDeviceState(raw)).toEqual({
      ...emptyDeviceState,
      lastPlayers: [player],
      seenCardIds: ['a'],
    });
  });

  it('drops a saved game that is missing fields or out of range', () => {
    const base = JSON.parse(
      serializeDeviceState({
        ...emptyDeviceState,
        activeSession: {
          id: 's1',
          settings: {
            mode: 'friends',
            categoryId: 'la-previa',
            players: [player],
            selectedDifficulties: ['easy'],
            endCondition: { type: 'open' },
            spicyEnabled: false,
          },
          status: 'inProgress',
          currentRound: 1,
          currentPlayerIndex: 0,
          scores: { p1: 0 },
          playedCardIds: ['prev-001'],
          swapsUsed: {},
          couplePaywallShown: false,
          startedAt: '2026-10-31T20:00:00.000Z',
        },
      }),
    );
    const broken = [
      { swapsUsed: undefined },
      { currentPlayerIndex: 3 },
      { playedCardIds: [] },
      { scores: { p1: 'x' } },
      { settings: { ...base.activeSession.settings, players: [{ id: 'p1' }] } },
      { settings: { ...base.activeSession.settings, endCondition: { type: 'forever' } } },
      { settings: { ...base.activeSession.settings, selectedDifficulties: 'easy' } },
      { settings: { ...base.activeSession.settings, mode: 'solo' } },
    ];
    for (const change of broken) {
      const raw = JSON.stringify({ ...base, activeSession: { ...base.activeSession, ...change } });
      expect(parseDeviceState(raw).activeSession).toBeUndefined();
    }
    expect(parseDeviceState(JSON.stringify(base)).activeSession?.id).toBe('s1');
  });

  it('ignores non-array lists', () => {
    expect(parseDeviceState(JSON.stringify({ lastPlayers: 'x', seenCardIds: {} }))).toEqual(
      emptyDeviceState,
    );
  });
});
