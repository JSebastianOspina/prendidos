/** Every user-facing string of the turn screen (Colombian Spanish, usted). */
import { levelLabels } from '@/components/ui/level-badge';
import {
  pointsRangeByDifficulty,
  type Difficulty,
  type DrinkCount,
  type GroupCardType,
} from '@/features/content/card-types';
import type { EndCondition } from '@/features/game';

export const playCopy = {
  turnOf: 'Le toca a',
  forTheGroup: 'Para todo el grupo',
  everyoneChip: '¡Todos!',
  groupRule: 'El que le aplique, toma.',
  groupRuleNote: 'Sin puntos. No cuenta para el ranking.',
  challengeTag: 'Reto',
  challengeHint: 'Hágalo',
  truthTag: 'Verdad',
  truthHint: 'Responda con la verdad',
  ifRefused: 'Si no cumple',
  consentNote: 'Solo si la otra persona acepta',
  outsideNote:
    'Nunca a alguien que lo haya bloqueado. Sin señal, sin redes o sin respuesta, igual cuenta como cumplido.',
  completed: '¡Cumplió!',
  refused: 'No cumplió',
  next: 'Siguiente',
  continue: 'Seguir',
  swap: 'Cambiar carta',
  swapUsed: 'Ya cambió su carta',
  pause: 'Pausa',
  pauseButton: 'Pausar la partida',
  keepPlaying: 'Seguir jugando',
  endAndRank: 'Terminar y ver ranking',
  levelUpTitles: {
    easy: '¡Arrancamos suave!',
    medium: '¡Subió la temperatura!',
    hard: '¡Esto se prendió!',
  } satisfies Record<Difficulty, string>,
  moderation: 'Ningún castigo pasa de 3 tragos. Tómenla suave.',
  keepPartying: 'Que siga la fiesta',
  currentLevel: (level: Difficulty) => `Nivel actual: ${levelLabels[level]}`,
  refusedBy: (name: string) => `${name} no cumplió`,
  groupHeadlines: {
    everyoneWho: '¡Todos los que…!',
    neverHaveIEver: 'Yo nunca…',
  } satisfies Record<GroupCardType, string>,
} as const;

/** "Ronda 3 de 10", "Ronda 3 · Meta 200 pts" or "Ronda 3" (open game). */
export function roundLabel(round: number, endCondition: EndCondition): string {
  switch (endCondition.type) {
    case 'rounds':
      return `Ronda ${round} de ${endCondition.rounds}`;
    case 'points':
      return `Ronda ${round} · Meta ${pointsLabel(endCondition.target)}`;
    case 'open':
      return `Ronda ${round}`;
  }
}

export function interludeLabel(round: number, endCondition: EndCondition): string {
  return `${roundLabel(round, endCondition)} · Interludio`;
}

/** Each player has one free swap: "Cambiar (1)" until it is used. */
export function swapLabel(canSwap: boolean): string {
  return `Cambiar (${canSwap ? 1 : 0})`;
}

export function continueWithLabel(playerName: string): string {
  return `Seguir: le toca a ${playerName}`;
}

export function levelUpLine(level: Difficulty): string {
  const { min, max } = pointsRangeByDifficulty[level];
  return `Subimos a nivel ${levelLabels[level]}: cartas de ${min} a ${max} puntos.`;
}

export function drinksLabel(drinks: DrinkCount): string {
  return `Toma ${drinks} ${drinks === 1 ? 'trago' : 'tragos'}`;
}

export function penaltyLine(drinks: DrinkCount, quip?: string): string {
  return quip ? `${drinksLabel(drinks)} — ${quip}` : drinksLabel(drinks);
}

export function pointsLabel(points: number): string {
  return `${points} ${Math.abs(points) === 1 ? 'pt' : 'pts'}`;
}

/** "+5 pts" / "−3 pts" (typographic minus). */
export function signedPointsLabel(points: number): string {
  const sign = points < 0 ? '−' : '+';
  return `${sign}${pointsLabel(Math.abs(points))}`;
}
