import { createContext, use, useRef, useState, type ReactNode } from 'react';

import { loadCatalog, type Catalog } from '@/features/content/catalog';
import type { Card, Difficulty } from '@/features/content/card-types';
import { useDeviceState } from '@/features/device/device-state-provider';

import { isGroupCard } from './card-selection';
import { currentDifficultyFor } from './escalation';
import {
  createGame,
  currentCardOf,
  gameReducer,
  type GameAction,
  type GameContext,
  type StartError,
} from './game-reducer';
import type {
  GameEnvironment,
  GameSession,
  GameSettings,
  GameState,
  Player,
  RankingEntry,
  RenderedCard,
  TurnOutcome,
} from './game-types';
import { createLocalId, partnerOf } from './players';
import { rankPlayers } from './ranking';
import { renderCard } from './render-card';

export type GameValue = {
  /** `undefined` before a game starts and after `clearFinishedGame()`. */
  session?: GameSession;
  currentPlayer?: Player;
  currentCard?: Card;
  /** Spanish copy of the current card, rendered for the current player. */
  currentCardCopy?: RenderedCard;
  currentDifficulty?: Difficulty;
  /** True while a group interlude is on screen (no points, no turn). */
  isGroupInterlude: boolean;
  /** Whether the current player can still use their free swap. */
  canSwap: boolean;
  /** Result of the last individual card, e.g. the penalty to show after a refusal. */
  lastOutcome?: TurnOutcome;
  ranking: RankingEntry[];
  /** Returns the reasons a game could not start; empty when it started. */
  startGame: (settings: GameSettings) => StartError[];
  completeCard: () => void;
  refuseCard: () => void;
  swapCard: () => void;
  nextAfterGroupCard: () => void;
  endGame: () => void;
  clearFinishedGame: () => void;
};

const GameContextValue = createContext<GameValue | null>(null);

const defaultEnvironment: GameEnvironment = {
  random: Math.random,
  createId: createLocalId,
  now: () => new Date().toISOString(),
};

type GameProviderProps = {
  children: ReactNode;
  /** Injectable for tests. */
  catalog?: Catalog;
  environment?: GameEnvironment;
};

export function GameProvider({
  children,
  catalog = loadCatalog(),
  environment = defaultEnvironment,
}: GameProviderProps) {
  const device = useDeviceState();
  const [gameState, setGameState] = useState<GameState | undefined>(() => {
    const saved = device.activeSession;
    const savedCardId = saved?.playedCardIds.at(-1);
    // A saved game whose card no longer ships cannot continue.
    return saved && catalog.cards.some((card) => card.id === savedCardId)
      ? { session: saved }
      : undefined;
  });
  // Latest state for event handlers, so two taps in one render chain instead of overwriting each other.
  const latestState = useRef(gameState);

  const context: GameContext = {
    cards: catalog.cards,
    categories: catalog.categories,
    seenCardIds: device.seenCardIds,
    environment,
  };

  const commit = (next: GameState | undefined) => {
    latestState.current = next;
    setGameState(next);
    if (!next) {
      device.saveActiveSession(undefined);
      return;
    }
    device.saveActiveSession(next.session.status === 'inProgress' ? next.session : undefined);
    const shownCardId = next.session.playedCardIds.at(-1);
    if (shownCardId) device.markCardsSeen([shownCardId]);
  };

  const dispatch = (action: GameAction) => {
    const current = latestState.current;
    if (!current) return;
    const next = gameReducer(current, action, context);
    if (next !== current) commit(next);
  };

  const session = gameState?.session;
  const players = session?.settings.players ?? [];
  const currentPlayer = session ? players[session.currentPlayerIndex] : undefined;
  const currentCard =
    gameState && session?.status === 'inProgress'
      ? currentCardOf(gameState, catalog.cards)
      : undefined;
  const mentionedPlayer =
    players.find((player) => player.id === gameState?.mentionedPlayerId) ??
    players.find(
      (player) =>
        player.id !== currentPlayer?.id &&
        (!currentCard?.targetGender || player.gender === currentCard.targetGender),
    );

  /** Card actions name the card this render showed, so a stale tap is ignored. */
  const dispatchOnShownCard = (type: 'complete' | 'refuse' | 'swap' | 'nextAfterGroupCard') => {
    if (currentCard) dispatch({ type, cardId: currentCard.id });
  };

  const value: GameValue = {
    session,
    currentPlayer,
    currentCard,
    currentCardCopy:
      currentCard && currentPlayer
        ? renderCard(currentCard, {
            currentPlayer,
            mentionedPlayer,
            partner:
              session?.settings.mode === 'couple'
                ? partnerOf(players, currentPlayer.id)
                : undefined,
          })
        : undefined,
    currentDifficulty:
      currentCard?.difficulty ??
      (session
        ? currentDifficultyFor(
            session.settings.selectedDifficulties,
            session.settings.endCondition,
            session.currentRound,
            session.scores,
          )
        : undefined),
    isGroupInterlude: currentCard ? isGroupCard(currentCard) : false,
    canSwap: Boolean(
      currentPlayer &&
      currentCard &&
      !isGroupCard(currentCard) &&
      !session?.swapsUsed[currentPlayer.id],
    ),
    lastOutcome: gameState?.lastOutcome,
    ranking: session ? rankPlayers(players, session.scores) : [],
    startGame: (settings) => {
      const result = createGame(settings, context);
      if (!result.ok) return result.errors;
      device.rememberPlayers(settings.players);
      device.rememberSpicyEnabled(settings.spicyEnabled);
      commit(result.state);
      return [];
    },
    completeCard: () => dispatchOnShownCard('complete'),
    refuseCard: () => dispatchOnShownCard('refuse'),
    swapCard: () => dispatchOnShownCard('swap'),
    nextAfterGroupCard: () => dispatchOnShownCard('nextAfterGroupCard'),
    endGame: () => dispatch({ type: 'end' }),
    clearFinishedGame: () => commit(undefined),
  };

  return <GameContextValue value={value}>{children}</GameContextValue>;
}

/** The only way screens read or change the game. */
export function useGame(): GameValue {
  const value = use(GameContextValue);
  if (!value) throw new Error('useGame must be used inside GameProvider');
  return value;
}
