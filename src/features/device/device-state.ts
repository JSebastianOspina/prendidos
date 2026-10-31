/**
 * What the phone remembers between launches (docs/data-model.md → DeviceState).
 * Nothing about finished games is kept.
 */
import {
  allDifficulties,
  playerGenders,
  type Difficulty,
  type PlayerGender,
} from '@/features/content/card-types';
import type { GameSession, Player } from '@/features/game/game-types';

export type DeviceState = {
  /** ISO date when "Soy mayor de 18" was accepted. */
  ageConfirmedAt?: string;
  lastPlayers: Player[];
  seenCardIds: string[];
  lastSpicyEnabled: boolean;
  activeSession?: GameSession;
};

export const emptyDeviceState: DeviceState = {
  lastPlayers: [],
  seenCardIds: [],
  lastSpicyEnabled: false,
};

type UnknownRecord = Record<string, unknown>;

const isString = (value: unknown): value is string => typeof value === 'string';

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPlayer(value: unknown): value is Player {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    playerGenders.includes(value.gender as PlayerGender) &&
    typeof value.drinks === 'boolean'
  );
}

function isEndCondition(value: unknown): boolean {
  if (!isRecord(value)) return false;
  switch (value.type) {
    case 'rounds':
      return [5, 10, 15, 20].includes(value.rounds as number);
    case 'points':
      return [100, 200, 300].includes(value.target as number);
    case 'open':
      return true;
    default:
      return false;
  }
}

function isGameSettings(value: unknown): value is GameSession['settings'] {
  return (
    isRecord(value) &&
    (value.mode === 'friends' || value.mode === 'couple') &&
    typeof value.categoryId === 'string' &&
    Array.isArray(value.players) &&
    value.players.length > 0 &&
    value.players.every(isPlayer) &&
    Array.isArray(value.selectedDifficulties) &&
    value.selectedDifficulties.every((difficulty) =>
      allDifficulties.includes(difficulty as Difficulty),
    ) &&
    isEndCondition(value.endCondition) &&
    typeof value.spicyEnabled === 'boolean'
  );
}

const isNumber = (value: unknown): value is number => typeof value === 'number';

/** A saved game is kept only when it is complete enough to resume without crashing. */
function isGameSession(value: unknown): value is GameSession {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isGameSettings(value.settings) &&
    (value.status === 'inProgress' || value.status === 'finished') &&
    isNumber(value.currentRound) &&
    isNumber(value.currentPlayerIndex) &&
    value.currentPlayerIndex >= 0 &&
    value.currentPlayerIndex < value.settings.players.length &&
    isRecord(value.scores) &&
    Object.values(value.scores).every(isNumber) &&
    Array.isArray(value.playedCardIds) &&
    value.playedCardIds.length > 0 &&
    value.playedCardIds.every(isString) &&
    isRecord(value.swapsUsed) &&
    typeof value.couplePaywallShown === 'boolean' &&
    typeof value.startedAt === 'string'
  );
}

function listOf<Item>(value: unknown, isItem: (item: unknown) => item is Item): Item[] {
  return Array.isArray(value) ? value.filter(isItem) : [];
}

/** Tolerant parse: missing, corrupt, or wrongly-shaped data falls back to the empty state. */
export function parseDeviceState(raw: string | null): DeviceState {
  if (raw === null) return emptyDeviceState;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return emptyDeviceState;
  }
  if (!isRecord(parsed)) return emptyDeviceState;

  const state: DeviceState = {
    lastPlayers: listOf(parsed.lastPlayers, isPlayer),
    seenCardIds: listOf(parsed.seenCardIds, isString),
    lastSpicyEnabled: parsed.lastSpicyEnabled === true,
  };
  if (isString(parsed.ageConfirmedAt)) state.ageConfirmedAt = parsed.ageConfirmedAt;
  if (isGameSession(parsed.activeSession)) state.activeSession = parsed.activeSession;
  return state;
}

export function serializeDeviceState(state: DeviceState): string {
  return JSON.stringify(state);
}
