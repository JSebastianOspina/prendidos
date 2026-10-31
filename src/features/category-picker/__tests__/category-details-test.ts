import type { Card, Category } from '@/features/content/card-types';

import { isFullyFree, standardCardCounts, totalCards } from '../category-details';

function card(overrides: Partial<Card> & Pick<Card, 'id'>): Card {
  return {
    categoryId: 'la-previa',
    type: 'neverHaveIEver',
    difficulty: 'easy',
    body: 'Yo nunca he bailado.',
    heat: 'standard',
    requiresConsent: false,
    reachesOutside: false,
    ...overrides,
  } as Card;
}

const category: Category = {
  id: 'la-previa',
  name: 'La Previa',
  mode: 'friends',
  freeDifficulties: ['easy', 'medium', 'hard'],
};

describe('standardCardCounts', () => {
  it('counts the standard cards of one category per level', () => {
    const cards = [
      card({ id: 'a' }),
      card({ id: 'b', difficulty: 'hard' }),
      card({ id: 'c', difficulty: 'hard' }),
      card({ id: 'd', heat: 'spicy' }),
      card({ id: 'e', categoryId: 'entre-dos' }),
    ];
    expect(standardCardCounts('la-previa', cards)).toEqual({ easy: 1, medium: 0, hard: 2 });
  });

  it('reads the shipped catalog by default', () => {
    expect(standardCardCounts('entre-dos')).toEqual({ easy: 30, medium: 30, hard: 30 });
  });

  it('adds the levels up', () => {
    expect(totalCards({ easy: 1, medium: 2, hard: 3 })).toBe(6);
  });
});

describe('isFullyFree', () => {
  it('is true only when every level is free', () => {
    expect(isFullyFree(category)).toBe(true);
    expect(isFullyFree({ ...category, freeDifficulties: ['easy'] })).toBe(false);
  });
});
