import type { Card } from '../card-types';
import { defaultIllustrationFor, shownIllustrationFor } from '../shown-illustration';

const baseCard = {
  id: 'c1',
  categoryId: 'la-previa',
  type: 'challenge',
  headline: 'Hola',
  body: 'Haga algo.',
  points: 5,
  penalty: { drinks: 1 },
  heat: 'standard',
  requiresConsent: false,
  reachesOutside: false,
} as const;

describe('shownIllustrationFor', () => {
  it("shows the card's own illustration key", () => {
    const card: Card = { ...baseCard, difficulty: 'easy', illustration: 'moon-stars' };
    expect(shownIllustrationFor(card)).toBe('moon-stars');
  });

  it.each([
    ['easy', 'mascot-relaxed'],
    ['medium', 'mascot-smirk'],
    ['hard', 'mascot-laugh'],
  ] as const)("shows the %s level's mascot face on a card without a key", (difficulty, face) => {
    const card: Card = { ...baseCard, difficulty, points: { easy: 5, medium: 15, hard: 25 }[difficulty] };
    expect(shownIllustrationFor(card)).toBe(face);
    expect(defaultIllustrationFor(difficulty)).toBe(face);
  });
});
