import { pointsRangeByDifficulty, type GroupCard, type IndividualCard } from '../card-types';

const challenge: IndividualCard = {
  id: 'prev-001',
  categoryId: 'la-previa',
  type: 'challenge',
  difficulty: 'easy',
  headline: 'Cultura time',
  body: 'Marcas de carros. El que repita o se demore pierde.',
  points: 5,
  penalty: { drinks: 1 },
  heat: 'standard',
  requiresConsent: false,
  reachesOutside: false,
};

// @ts-expect-error — an individual card must have a penalty.
const challengeWithoutPenalty: IndividualCard = { ...challenge, penalty: undefined };

const groupCard: GroupCard = {
  id: 'prev-002',
  categoryId: 'la-previa',
  type: 'neverHaveIEver',
  difficulty: 'easy',
  body: '…he llegado a una fiesta solo por la picada.',
  heat: 'standard',
  requiresConsent: false,
  reachesOutside: false,
};

// @ts-expect-error — a group card never carries points.
const groupCardWithPoints: GroupCard = { ...groupCard, points: 5 };

// @ts-expect-error — penalties are capped at 3 drinks.
const tooManyDrinks: IndividualCard = { ...challenge, penalty: { drinks: 4 } };

describe('card types', () => {
  it('keeps the invalid shapes above as compile-time errors only', () => {
    expect([challengeWithoutPenalty, groupCardWithPoints, tooManyDrinks]).toHaveLength(3);
  });

  it('defines non-overlapping points ranges in ascending order', () => {
    const { easy, medium, hard } = pointsRangeByDifficulty;
    expect(easy.max).toBeLessThan(medium.min);
    expect(medium.max).toBeLessThan(hard.min);
  });
});
