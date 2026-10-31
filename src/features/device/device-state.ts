/**
 * What the phone remembers between launches (docs/data-model.md → DeviceState).
 * Nothing about finished games is kept.
 */
import type { PlayerGender } from '@/features/content/card-types';
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

const playerGenders: readonly PlayerGender[] = ['male', 'female', 'undisclosed'];

type UnknownRecord = Record<string, unknown>;

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

function isGameSession(value: unknown): value is GameSession {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isRecord(value.settings) &&
    Array.isArray(value.settings.players) &&
    (value.status === 'inProgress' || value.status === 'finished') &&
    typeof value.currentRound === 'number' &&
    typeof value.currentPlayerIndex === 'number' &&
    isRecord(value.scores) &&
    Array.isArray(value.playedCardIds)
  );
}

function listOf<Item>(value: unknown, isItem: (item: unknown) => item is Item): Item[] {
  return Array.isArray(value) ? value.filter(isItem) : [];
}

const isString = (value: unknown): value is string => typeof value === 'string';

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
