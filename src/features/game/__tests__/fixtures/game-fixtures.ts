import type { Card, Category } from '@/features/content/card-types';

import type { GameSettings, Player } from '../../game-types';

export const testCategories: Category[] = [
  { id: 'la-previa', name: 'La Previa', mode: 'friends', freeDifficulties: ['easy', 'medium', 'hard'] },
  { id: 'entre-dos', name: 'Entre Dos', mode: 'couple', freeDifficulties: ['easy'] },
];

export const ana: Player = { id: 'p1', name: 'Ana', gender: 'female', drinks: true };
export const beto: Player = { id: 'p2', name: 'Beto', gender: 'male', drinks: true };
export const cami: Player = { id: 'p3', name: 'Cami', gender: 'undisclosed', drinks: false };

type IndividualOverrides = Partial<Omit<Extract<Card, { type: 'challenge' | 'truth' }>, 'type'>> & {
  type?: 'challenge' | 'truth';
};

export function individualCard(id: string, overrides: IndividualOverrides = {}): Card {
  return {
    id,
    categoryId: 'la-previa',
    type: 'challenge',
    difficulty: 'easy',
    headline: 'Hola {campeón|campeona|estrella}',
    body: 'Haga algo con {player}.',
    points: 5,
    penalty: { drinks: 1, quip: 'por {flojo|floja|floje}' },
    heat: 'standard',
    requiresConsent: false,
    reachesOutside: false,
    ...overrides,
  } as Card;
}

export function groupCard(id: string, overrides: Partial<Card> = {}): Card {
  return {
    id,
    categoryId: 'la-previa',
    type: 'neverHaveIEver',
    difficulty: 'easy',
    body: '…he {bailado|bailado|bailado} solo.',
    heat: 'standard',
    requiresConsent: false,
    reachesOutside: false,
    ...overrides,
  } as Card;
}

export function friendsSettings(overrides: Partial<GameSettings> = {}): GameSettings {
  return {
    mode: 'friends',
    categoryId: 'la-previa',
    players: [ana, beto, cami],
    selectedDifficulties: ['easy', 'medium', 'hard'],
    endCondition: { type: 'rounds', rounds: 5 },
    spicyEnabled: false,
    ...overrides,
  };
}

/** Deterministic random source that cycles through the given values. */
export function sequenceRandom(values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
}
