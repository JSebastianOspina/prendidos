/** Every user-facing string of the turn screen (Colombian Spanish, usted). */
import type { DrinkCount, GroupCardType } from '@/features/content/card-types';
import type { EndCondition } from '@/features/game';

export const playCopy = {
  turnOf: 'Le toca a',
  forTheGroup: 'Para todo el grupo',
  groupHint: 'Sin puntos: el que le aplique, toma.',
  scoreboard: 'Marcador',
  challengeTag: 'Reto',
  challengeHint: 'Hágalo',
  truthTag: 'Verdad',
  truthHint: 'Responda con la verdad',
  ifRefused: 'Si no cumple',
  consentNote: 'Solo si la otra persona acepta',
  outsideNote:
    'Nunca a alguien que lo haya bloqueado. Sin señal, sin redes o sin respuesta, igual cuenta como cumplido.',
  completed: 'Cumplió',
  refused: 'No cumplió',
  next: 'Siguiente',
  swap: 'Cambiar carta',
  swapUsed: 'Ya cambió su carta',
  endGame: 'Terminar partida',
  endConfirmTitle: '¿Terminar la partida?',
  endConfirmBody: 'Se va al ranking con los puntos que llevan.',
  endConfirm: 'Sí, terminar',
  endCancel: 'Seguir jugando',
  refusedBy: (name: string) => `${name} no cumplió`,
  groupHeadlines: {
    everyoneWho: '¡Todos los que…!',
    neverHaveIEver: 'Yo nunca…',
  } satisfies Record<GroupCardType, string>,
} as const;

export function roundLabel(round: number, endCondition: EndCondition): string {
  return endCondition.type === 'rounds'
    ? `Ronda ${round} de ${endCondition.rounds}`
    : `Ronda ${round}`;
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
