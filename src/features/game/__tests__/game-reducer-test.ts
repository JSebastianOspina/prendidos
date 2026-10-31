import type { Card } from '@/features/content/card-types';

import { createGame, currentCardOf, gameReducer, type GameContext } from '../game-reducer';
import type { GameState } from '../game-types';
import {
  ana,
  beto,
  cami,
  friendsSettings,
  groupCard,
  individualCard,
  testCategories,
} from './fixtures/game-fixtures';

const noGroupRoll = () => 0.99;

const cards: Card[] = [
  individualCard('e1', { points: 1 }),
  individualCard('e7', { points: 7, penalty: { drinks: 2, quip: 'por {flojo|floja|floje}' } }),
  individualCard('e9', { points: 9 }),
  individualCard('m15', { difficulty: 'medium', points: 15 }),
  individualCard('h25', { difficulty: 'hard', points: 25 }),
  groupCard('g1'),
];

function context(overrides: Partial<GameContext> = {}): GameContext {
  let idCounter = 0;
  return {
    cards,
    categories: testCategories,
    seenCardIds: [],
    environment: {
      random: noGroupRoll,
      createId: () => `id-${(idCounter += 1)}`,
      now: () => '2026-10-31T20:00:00.000Z',
    },
    ...overrides,
  };
}

function started(overrides: Partial<GameContext> = {}, settings = friendsSettings()): GameState {
  const result = createGame(settings, context(overrides));
  if (!result.ok) throw new Error(result.errors.join());
  return result.state;
}

describe('createGame', () => {
  it('starts at round 1 with the first player, zero scores, and a first card', () => {
    const state = started();
    expect(state.session).toMatchObject({
      id: 'id-1',
      status: 'inProgress',
      currentRound: 1,
      currentPlayerIndex: 0,
      scores: { p1: 0, p2: 0, p3: 0 },
      playedCardIds: ['e1'],
      swapsUsed: {},
      couplePaywallShown: false,
      startedAt: '2026-10-31T20:00:00.000Z',
    });
    expect(currentCardOf(state, cards)?.id).toBe('e1');
  });

  it('reports settings errors instead of starting', () => {
    const result = createGame(friendsSettings({ players: [ana] }), context());
    expect(result).toEqual({ ok: false, errors: ['playerCount'] });
  });

  it('reports an empty category', () => {
    const result = createGame(friendsSettings(), context({ cards: [] }));
    expect(result).toEqual({ ok: false, errors: ['noCards'] });
  });
});

describe('gameReducer', () => {
  it('completing adds the points and passes the turn', () => {
    const state = gameReducer(started(), { type: 'complete' }, context());
    expect(state.session.scores.p1).toBe(1);
    expect(state.session.currentPlayerIndex).toBe(1);
    expect(state.lastOutcome).toEqual({ kind: 'completed', playerId: 'p1', pointsDelta: 1 });
    expect(state.session.playedCardIds).toEqual(['e1', 'e7']);
  });

  it('refusing subtracts half rounded up, reports the penalty, and passes the turn', () => {
    let state = gameReducer(started(), { type: 'complete' }, context());
    state = gameReducer(state, { type: 'refuse' }, context());
    expect(state.session.scores.p2).toBe(-4);
    expect(state.lastOutcome).toEqual({
      kind: 'refused',
      playerId: 'p2',
      pointsDelta: -4,
      penalty: { drinks: 2, quip: 'por {flojo|floja|floje}' },
      penaltyQuip: 'por flojo',
    });
    expect(state.session.currentPlayerIndex).toBe(2);
  });

  it('completes a round after the last player and escalates', () => {
    let state = started({}, friendsSettings({ endCondition: { type: 'rounds', rounds: 5 } }));
    for (let turn = 0; turn < 6; turn += 1) state = gameReducer(state, { type: 'complete' }, context());
    expect(state.session.currentRound).toBe(3);
    expect(state.session.currentPlayerIndex).toBe(0);
    expect(currentCardOf(state, cards)?.difficulty).toBe('medium');
  });

  it('swaps once per player with no score or turn change', () => {
    const first = started();
    const swapped = gameReducer(first, { type: 'swap' }, context());
    expect(currentCardOf(swapped, cards)?.id).toBe('e7');
    expect(swapped.session.swapsUsed).toEqual({ p1: true });
    expect(swapped.session.scores.p1).toBe(0);
    expect(swapped.session.currentPlayerIndex).toBe(0);
    expect(gameReducer(swapped, { type: 'swap' }, context())).toBe(swapped);
  });

  it('keeps the card when no other card is left to swap to', () => {
    const lonely = context({ cards: [individualCard('only')] });
    const state = started({ cards: [individualCard('only')] });
    expect(gameReducer(state, { type: 'swap' }, lonely)).toBe(state);
  });

  it('shows group cards as interludes that keep the turn', () => {
    const groupFirst = context({ environment: { ...context().environment, random: () => 0 } });
    const state = started({ environment: groupFirst.environment });
    expect(currentCardOf(state, cards)?.id).toBe('g1');

    expect(gameReducer(state, { type: 'complete' }, context())).toBe(state);
    expect(gameReducer(state, { type: 'refuse' }, context())).toBe(state);
    expect(gameReducer(state, { type: 'swap' }, context())).toBe(state);

    const next = gameReducer(state, { type: 'nextAfterGroupCard' }, context());
    expect(next.session.currentPlayerIndex).toBe(0);
    expect(next.session.scores.p1).toBe(0);
    expect(currentCardOf(next, cards)?.type).toBe('challenge');
  });

  it('ignores nextAfterGroupCard on an individual card', () => {
    const state = started();
    expect(gameReducer(state, { type: 'nextAfterGroupCard' }, context())).toBe(state);
  });

  it('finishes a game by rounds after the last round', () => {
    let state = started({}, friendsSettings({ players: [ana, beto], endCondition: { type: 'rounds', rounds: 5 } }));
    for (let turn = 0; turn < 10; turn += 1) state = gameReducer(state, { type: 'complete' }, context());
    expect(state.session.status).toBe('finished');
    expect(state.session.currentRound).toBe(5);
    expect(gameReducer(state, { type: 'complete' }, context())).toBe(state);
  });

  it('finishes a game by points only when the round completes', () => {
    const rich = [individualCard('big', { difficulty: 'hard', points: 30 })];
    const settings = friendsSettings({ endCondition: { type: 'points', target: 100 } });
    let state = started({ cards: rich }, settings);
    state = { ...state, session: { ...state.session, scores: { p1: 90, p2: 0, p3: 0 } } };
    state = gameReducer(state, { type: 'complete' }, context({ cards: rich }));
    expect(state.session.scores.p1).toBe(120);
    expect(state.session.status).toBe('inProgress');
    state = gameReducer(state, { type: 'complete' }, context({ cards: rich }));
    state = gameReducer(state, { type: 'complete' }, context({ cards: rich }));
    expect(state.session.status).toBe('finished');
  });

  it('reports no quip when the refused card has none', () => {
    const plain = [individualCard('plain', { penalty: { drinks: 1 } })];
    const state = gameReducer(started({ cards: plain }), { type: 'refuse' }, context({ cards: plain }));
    expect(state.lastOutcome?.penaltyQuip).toBeUndefined();
  });

  it('ends any game early', () => {
    const state = gameReducer(started({}, friendsSettings({ endCondition: { type: 'open' } })), { type: 'end' }, context());
    expect(state.session.status).toBe('finished');
  });

  it('finishes when no card can be drawn anymore', () => {
    const single = [individualCard('only')];
    const state = started({ cards: single });
    const onlyForMen = [individualCard('only', { targetGender: 'male' })];
    const next = gameReducer(state, { type: 'complete' }, context({ cards: onlyForMen }));
    expect(next.session.status).toBe('finished');
    expect(next.session.scores.p1).toBe(5);
  });

  it('ignores actions when the current card is unknown', () => {
    const state = started();
    expect(gameReducer(state, { type: 'complete' }, context({ cards: [] }))).toBe(state);
  });

  it('remembers who is mentioned on the card', () => {
    const state = started();
    expect([beto.id, cami.id]).toContain(state.mentionedPlayerId);
  });
});
