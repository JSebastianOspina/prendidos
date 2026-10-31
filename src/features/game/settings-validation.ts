import type { Category } from '@/features/content/card-types';

import type { GameSettings } from './game-types';

export type SettingsError =
  'playerCount' | 'selectedDifficulties' | 'category' | 'playerName' | 'playerId';

export const playerLimitsByMode = {
  friends: { min: 2, max: 12 },
  couple: { min: 2, max: 2 },
} as const;

/** Returns every rule the settings break; an empty list means the game can start. */
export function validateSettings(
  settings: GameSettings,
  categories: readonly Category[],
): SettingsError[] {
  const errors: SettingsError[] = [];
  const limits = playerLimitsByMode[settings.mode];
  const playerCount = settings.players.length;

  if (playerCount < limits.min || playerCount > limits.max) errors.push('playerCount');
  if (settings.selectedDifficulties.length === 0) errors.push('selectedDifficulties');

  const category = categories.find((candidate) => candidate.id === settings.categoryId);
  if (!category || category.mode !== settings.mode) errors.push('category');

  if (settings.players.some((player) => player.name.trim() === '')) errors.push('playerName');

  const uniqueIds = new Set(settings.players.map((player) => player.id));
  if (uniqueIds.size !== playerCount) errors.push('playerId');

  return errors;
}
