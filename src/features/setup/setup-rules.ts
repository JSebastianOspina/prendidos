/** Pure rules of the game setup screen (no React). */
import { allDifficulties, type Difficulty, type GameMode } from '@/features/content/card-types';
import { createPlayer, playerLimitsByMode, type EndCondition, type Player } from '@/features/game';

/** A new row: no name yet, gender not disclosed, drinks, and an avatar nobody else has. */
export function createEmptyPlayer(
  createId: () => string,
  currentPlayers: readonly Player[] = [],
): Player {
  return createPlayer(
    { name: '', gender: 'undisclosed' },
    createId,
    currentPlayers.map((player) => player.avatarId),
  );
}

/**
 * Fits the remembered players to the mode limits: pads with empty rows up to the minimum and
 * keeps the first ones up to the maximum. Returns the same array when nothing changes.
 */
export function preparePlayersForMode(
  players: Player[],
  mode: GameMode,
  createId: () => string,
): Player[] {
  const { min, max } = playerLimitsByMode[mode];
  if (players.length >= min && players.length <= max) return players;
  const prepared = players.slice(0, max);
  while (prepared.length < min) prepared.push(createEmptyPlayer(createId, prepared));
  return prepared;
}

/** Fisher–Yates shuffle; when the order comes out unchanged it rotates by one so it is visible. */
export function shufflePlayers(players: readonly Player[], random: () => number): Player[] {
  const shuffled = [...players];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  const unchanged = shuffled.every((player, index) => player.id === players[index].id);
  return unchanged && shuffled.length > 1 ? [...shuffled.slice(1), shuffled[0]] : shuffled;
}

/** Selects or deselects a level, never leaving the selection empty; keeps the canonical order. */
export function toggleDifficulty(
  selected: readonly Difficulty[],
  difficulty: Difficulty,
): Difficulty[] {
  const isSelected = selected.includes(difficulty);
  if (isSelected && selected.length === 1) return [...selected];
  return allDifficulties.filter((candidate) =>
    candidate === difficulty ? !isSelected : selected.includes(candidate),
  );
}

export function hasMissingName(player: Player): boolean {
  return player.name.trim() === '';
}

export function trimPlayerNames(players: readonly Player[]): Player[] {
  return players.map((player) => ({ ...player, name: player.name.trim() }));
}

/** Every end condition the setup offers, in display order. */
export const endConditionOptions: readonly EndCondition[] = [
  { type: 'rounds', rounds: 5 },
  { type: 'rounds', rounds: 10 },
  { type: 'rounds', rounds: 15 },
  { type: 'rounds', rounds: 20 },
  { type: 'points', target: 100 },
  { type: 'points', target: 200 },
  { type: 'points', target: 300 },
  { type: 'open' },
];

export function isSameEndCondition(first: EndCondition, second: EndCondition): boolean {
  if (first.type === 'rounds' && second.type === 'rounds') return first.rounds === second.rounds;
  if (first.type === 'points' && second.type === 'points') return first.target === second.target;
  return first.type === 'open' && second.type === 'open';
}
