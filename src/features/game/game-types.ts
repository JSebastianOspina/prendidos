/**
 * Game domain types. Entity names and fields follow docs/data-model.md.
 */
import type {
  Card,
  Difficulty,
  DrinkPenalty,
  GameMode,
  PlayerGender,
} from '@/features/content/card-types';

export type Player = {
  id: string;
  name: string;
  gender: PlayerGender;
  /** `false` = gets alternative penalties instead of drinks (HU-11). */
  drinks: boolean;
};

export type RoundCount = 5 | 10 | 15 | 20;

export type PointsTarget = 100 | 200 | 300;

export type EndCondition =
  | { type: 'rounds'; rounds: RoundCount }
  | { type: 'points'; target: PointsTarget }
  | { type: 'open' };

export type GameSettings = {
  mode: GameMode;
  categoryId: string;
  /** Turn order = array order. */
  players: Player[];
  selectedDifficulties: Difficulty[];
  endCondition: EndCondition;
  spicyEnabled: boolean;
};

export type GameStatus = 'inProgress' | 'finished';

export type GameSession = {
  id: string;
  settings: GameSettings;
  status: GameStatus;
  /** 1-based. */
  currentRound: number;
  currentPlayerIndex: number;
  scores: Record<string, number>;
  /** The last id is the card on screen. */
  playedCardIds: string[];
  swapsUsed: Record<string, boolean>;
  couplePaywallShown: boolean;
  /** ISO 8601 date. */
  startedAt: string;
};

export type TurnOutcome = {
  kind: 'completed' | 'refused';
  playerId: string;
  pointsDelta: number;
  penalty?: DrinkPenalty;
  /** Penalty quip already rendered for the refusing player. */
  penaltyQuip?: string;
};

/** Engine state: the persisted session plus transient turn details. */
export type GameState = {
  session: GameSession;
  /** Player that fills `{player}` on the current card. */
  mentionedPlayerId?: string;
  lastOutcome?: TurnOutcome;
};

export type RankingEntry = {
  player: Player;
  score: number;
  /** 1-based; tied players share the position (1, 1, 3). */
  position: number;
};

export type RenderedCard = {
  card: Card;
  headline?: string;
  body: string;
  penaltyQuip?: string;
};

/** Injected sources of randomness, ids, and time so the rules stay deterministic in tests. */
export type GameEnvironment = {
  random: () => number;
  createId: () => string;
  now: () => string;
};

export const defaultEndCondition: EndCondition = { type: 'rounds', rounds: 10 };

export const allDifficulties: readonly Difficulty[] = ['easy', 'medium', 'hard'];
