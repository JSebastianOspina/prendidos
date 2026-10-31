/** User-facing copy of the game setup screen (Colombian Spanish, usted). */
import { levelLabels } from '@/components/ui/level-badge';
import { allDifficulties, type Difficulty, type PlayerGender } from '@/features/content/card-types';
import type { EndCondition, Player } from '@/features/game';

export const setupCopy = {
  title: '¿Quiénes juegan?',
  back: 'Volver',
  addPlayer: '+ Agregar jugador',
  addPlayerLabel: 'Agregar jugador',
  namePlaceholder: 'Nombre',
  missingName: 'Falta el nombre',
  missingNamesSummary: 'Escriba el nombre de cada jugador para empezar.',
  startFailed: 'No se pudo empezar la partida. Vuelva y elija otra categoría.',
  removeSymbol: '×',
  swapSymbol: '⇄',
  noDrinks: 'No toma',
  levelsHeading: 'Niveles',
  levelsHint: 'Deje al menos uno.',
  allLevels: 'Los 3',
  endHeading: 'Fin de la partida',
  endChip: 'Fin',
  levelsChip: 'Niveles',
  orderChip: 'Orden',
  shuffle: 'Barajar',
  shuffleLabel: 'Barajar el orden de los jugadores',
} as const;

export const genderLabels: Record<PlayerGender, string> = {
  male: 'Hombre',
  female: 'Mujer',
  undisclosed: 'Prefiero no decir',
};

const summarySeparator = ' · ';

export function playerPositionLabel(position: number): string {
  return `jugador ${position}`;
}

export function nameFieldLabel(position: number): string {
  return `Nombre del jugador ${position}`;
}

export function removePlayerLabel(position: number): string {
  return `Quitar al jugador ${position}`;
}

export function genderGroupLabel(position: number): string {
  return `Género del jugador ${position}`;
}

/** "Cambiar avatar de Vale", or by position while the name is blank. */
export function avatarButtonLabel(name: string, position: number): string {
  const trimmedName = name.trim();
  return trimmedName === ''
    ? `Cambiar avatar del ${playerPositionLabel(position)}`
    : `Cambiar avatar de ${trimmedName}`;
}

/** One-line summary of a collapsed row: "Caro · Mujer", plus "No toma" when it applies. */
export function playerSummary(player: Player, position: number): string {
  const trimmedName = player.name.trim();
  const parts = [trimmedName === '' ? `Jugador ${position}` : trimmedName];
  if (player.gender !== 'undisclosed') parts.push(genderLabels[player.gender]);
  if (!player.drinks) parts.push(setupCopy.noDrinks);
  return parts.join(summarySeparator);
}

export function expandPlayerLabel(summary: string, position: number): string {
  return `Editar al ${playerPositionLabel(position)}: ${summary}`;
}

/** "Los 3" when every level is on, otherwise the names: "Picante y Prendido". */
export function levelsSummary(selected: readonly Difficulty[]): string {
  if (allDifficulties.every((difficulty) => selected.includes(difficulty)))
    return setupCopy.allLevels;
  const names = allDifficulties
    .filter((difficulty) => selected.includes(difficulty))
    .map((difficulty) => levelLabels[difficulty]);
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} y ${names[names.length - 1]}`;
}

export function endChipLabel(value: string): string {
  return `${setupCopy.endHeading}: ${value}`;
}

export function levelsChipLabel(value: string): string {
  return `${setupCopy.levelsHeading}: ${value}`;
}

export function startButtonLabel(playerCount: number): string {
  return `¡A jugar!${summarySeparator}${playerCount} jugadores`;
}

export function endConditionLabel(endCondition: EndCondition): string {
  switch (endCondition.type) {
    case 'rounds':
      return `${endCondition.rounds} rondas`;
    case 'points':
      return `${endCondition.target} puntos`;
    case 'open':
      return 'Abierta';
  }
}
