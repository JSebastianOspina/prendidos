import type { Card, Category } from '@/features/content/card-types';
import { renderGenderedText } from '@/features/content/gendered-text';

import { drawCard, isGroupCard } from './card-selection';
import { isGameOverAfterRound } from './end-condition';
import { currentDifficultyFor } from './escalation';
import type { GameEnvironment, GameSession, GameSettings, GameState } from './game-types';
import { refusalPenaltyPoints } from './scoring';
import { validateSettings, type SettingsError } from './settings-validation';

export type GameAction =
  | { type: 'complete' }
  | { type: 'refuse' }
  | { type: 'swap' }
  | { type: 'nextAfterGroupCard' }
  | { type: 'end' };

export type GameContext = {
  cards: readonly Card[];
  categories: readonly Category[];
  seenCardIds: readonly string[];
  environment: GameEnvironment;
};

export type StartError = SettingsError | 'noCards';

export type StartResult = { ok: true; state: GameState } | { ok: false; errors: StartError[] };

/** The card on screen is the last one played. */
export function currentCardOf(state: GameState, cards: readonly Card[]): Card | undefined {
  const currentId = state.session.playedCardIds.at(-1);
  return cards.find((card) => card.id === currentId);
}

type DrawOptions = { previousCardWasGroup: boolean; swapping?: Card };

/** Draws the next card into the state; finishes the game when nothing can be drawn. */
function withNextCard(session: GameSession, context: GameContext, options: DrawOptions): GameState {
  const { settings } = session;
  const drawn = drawCard({
    cards: context.cards,
    settings,
    currentPlayerId: settings.players[session.currentPlayerIndex].id,
    difficulty: currentDifficultyFor(
      settings.selectedDifficulties,
      settings.endCondition,
      session.currentRound,
      session.scores,
    ),
    playedCardIds: session.playedCardIds,
    seenCardIds: context.seenCardIds,
    previousCardWasGroup: options.previousCardWasGroup,
    excludeGroupCards: options.swapping !== undefined,
    excludedCardIds: options.swapping ? [options.swapping.id] : [],
    random: context.environment.random,
  });

  if (!drawn) return { session: { ...session, status: 'finished' } };
  return {
    session: { ...session, playedCardIds: drawn.playedCardIds },
    mentionedPlayerId: drawn.mentionedPlayerId,
  };
}

export function createGame(settings: GameSettings, context: GameContext): StartResult {
  const errors = validateSettings(settings, context.categories);
  if (errors.length > 0) return { ok: false, errors };

  const session: GameSession = {
    id: context.environment.createId(),
    settings,
    status: 'inProgress',
    currentRound: 1,
    currentPlayerIndex: 0,
    scores: Object.fromEntries(settings.players.map((player) => [player.id, 0])),
    playedCardIds: [],
    swapsUsed: {},
    couplePaywallShown: false,
    startedAt: context.environment.now(),
  };
  const state = withNextCard(session, context, { previousCardWasGroup: false });
  if (state.session.status === 'finished') return { ok: false, errors: ['noCards'] };
  return { ok: true, state };
}

/** Passes the turn; a wrap completes the round and may end the game. */
function advanceTurn(session: GameSession, context: GameContext): GameState {
  const nextIndex = session.currentPlayerIndex + 1;
  if (nextIndex < session.settings.players.length) {
    return withNextCard({ ...session, currentPlayerIndex: nextIndex }, context, { previousCardWasGroup: false });
  }
  if (isGameOverAfterRound(session.settings.endCondition, session.currentRound, session.scores)) {
    return { session: { ...session, status: 'finished' } };
  }
  return withNextCard(
    { ...session, currentPlayerIndex: 0, currentRound: session.currentRound + 1 },
    context,
    { previousCardWasGroup: false },
  );
}

/** Pure game transitions. Invalid actions return the same state, so a double tap is harmless. */
export function gameReducer(state: GameState, action: GameAction, context: GameContext): GameState {
  const { session } = state;
  if (session.status === 'finished') return state;
  if (action.type === 'end') return { ...state, session: { ...session, status: 'finished' } };

  const card = currentCardOf(state, context.cards);
  if (!card) return state;
  const player = session.settings.players[session.currentPlayerIndex];

  if (isGroupCard(card)) {
    if (action.type !== 'nextAfterGroupCard') return state;
    return withNextCard(session, context, { previousCardWasGroup: true });
  }

  switch (action.type) {
    case 'complete':
    case 'refuse': {
      const pointsDelta = action.type === 'complete' ? card.points : -refusalPenaltyPoints(card.points);
      const scored: GameSession = {
        ...session,
        scores: { ...session.scores, [player.id]: session.scores[player.id] + pointsDelta },
      };
      return {
        ...advanceTurn(scored, context),
        lastOutcome:
          action.type === 'complete'
            ? { kind: 'completed', playerId: player.id, pointsDelta }
            : {
                kind: 'refused',
                playerId: player.id,
                pointsDelta,
                penalty: card.penalty,
                penaltyQuip:
                  card.penalty.quip === undefined
                    ? undefined
                    : renderGenderedText(card.penalty.quip, player.gender, {}),
              },
      };
    }
    case 'swap': {
      if (session.swapsUsed[player.id]) return state;
      const swapped = withNextCard(session, context, { previousCardWasGroup: false, swapping: card });
      if (swapped.session.status === 'finished') return state;
      return {
        ...swapped,
        session: { ...swapped.session, swapsUsed: { ...session.swapsUsed, [player.id]: true } },
        lastOutcome: state.lastOutcome,
      };
    }
    case 'nextAfterGroupCard':
      return state;
  }
}
