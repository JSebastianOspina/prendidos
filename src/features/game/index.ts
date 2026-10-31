/** Public surface of the game feature for screens: types, hooks, and helpers. */
export type {
  EndCondition,
  GameEnvironment,
  GameSession,
  GameSettings,
  GameStatus,
  Player,
  PointsTarget,
  RankingEntry,
  RenderedCard,
  RoundCount,
  TurnOutcome,
} from './game-types';
export { allDifficulties } from '@/features/content/card-types';
export { defaultEndCondition } from './game-types';
export type { StartError } from './game-reducer';
export type { SettingsError } from './settings-validation';
export { playerLimitsByMode } from './settings-validation';
export { refusalPenaltyPoints } from './scoring';
export { createLocalId, createPlayer, type NewPlayer } from './players';
export { avatarIds, nextFreeAvatar, pickFreeAvatar, type AvatarId } from './avatars';
export { GameProvider, useGame, type GameValue } from './game-provider';
export {
  NewGameDraftProvider,
  useNewGameDraft,
  type NewGameDraft,
  type NewGameDraftValue,
} from './new-game-draft';
