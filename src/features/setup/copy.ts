/** User-facing copy of the game setup screen (Colombian Spanish, usted). */
import type { PlayerGender } from '@/features/content/card-types';
import type { EndCondition } from '@/features/game';

export const setupCopy = {
  title: 'Arme la partida',
  playersHeading: 'Jugadores',
  playersHint: 'Juegan en este orden.',
  shuffle: 'Barajar',
  addPlayer: 'Agregar jugador',
  namePlaceholder: 'Nombre',
  missingName: 'Falta el nombre',
  missingNamesSummary: 'Escriba el nombre de cada jugador para empezar.',
  startFailed: 'No se pudo empezar la partida. Vuelva y elija otra categoría.',
  removeSymbol: '×',
  noDrinks: 'No toma',
  levelsHeading: 'Niveles',
  levelsHint: 'Deje al menos uno.',
  endHeading: 'Fin de la partida',
  start: 'Empezar',
} as const;

export const genderLabels: Record<PlayerGender, string> = {
  male: 'Hombre',
  female: 'Mujer',
  undisclosed: 'Prefiero no decir',
};

export function playerPositionLabel(position: number): string {
  return `jugador ${position}`;
}

export function nameFieldLabel(position: number): string {
  return `Nombre del jugador ${position}`;
}

export function removePlayerLabel(position: number): string {
  return `Quitar al jugador ${position}`;
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
