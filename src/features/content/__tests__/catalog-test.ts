import { allDifficulties, illustrationKeys, type IllustrationKey } from '../card-types';
import { hasErrors, validateCards } from '../validate-cards';
import {
  buildCatalog,
  categoriesForMode,
  contentWarnings,
  loadCatalog,
  shippedCatalogSources,
  type Catalog,
} from '../catalog';
import { validCards, validCategories } from './fixtures/valid-catalog';

describe('shipped catalog', () => {
  it('passes the content validator with no errors', () => {
    const merged = {
      categories: shippedCatalogSources.flatMap((source) => source.categories),
      cards: shippedCatalogSources.flatMap((source) => source.cards),
    };
    expect(hasErrors(validateCards(merged))).toBe(false);
  });

  it('holds enough standard La Previa cards for 10 rounds with 6 players and their swaps without a pool reset', () => {
    const { cards } = loadCatalog();
    // Worst case: no player matches a gender-targeted card, so only untargeted cards count.
    const untargetedIndividualAt = (difficulty: string) =>
      cards.filter(
        (card) =>
          card.categoryId === 'la-previa' &&
          card.heat === 'standard' &&
          card.difficulty === difficulty &&
          card.targetGender === undefined &&
          (card.type === 'challenge' || card.type === 'truth'),
      ).length;
    const swaps = 6;
    // Rounds 1–4 easy, 5–7 medium, 8–10 hard → 24 / 18 / 18 turns, plus every player's swap.
    expect(untargetedIndividualAt('easy')).toBeGreaterThanOrEqual(24 + swaps);
    expect(untargetedIndividualAt('medium')).toBeGreaterThanOrEqual(18 + swaps);
    expect(untargetedIndividualAt('hard')).toBeGreaterThanOrEqual(18 + swaps);
  });

  it.each([
    ['la-previa', 'standard'],
    ['la-previa', 'spicy'],
    ['entre-dos', 'standard'],
  ] as const)('ships at least 30 cards per level in %s (%s)', (categoryId, heat) => {
    const { cards } = loadCatalog();
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const count = cards.filter(
        (card) =>
          card.categoryId === categoryId && card.heat === heat && card.difficulty === difficulty,
      ).length;
      expect({ difficulty, count: Math.min(count, 30) }).toEqual({ difficulty, count: 30 });
    }
  });

  it('keeps gender-targeted cards to at most 10 % of each category and heat', () => {
    const { cards } = loadCatalog();
    const groups = new Map<string, { total: number; targeted: number }>();
    for (const card of cards) {
      const key = `${card.categoryId}/${card.heat}`;
      const group = groups.get(key) ?? { total: 0, targeted: 0 };
      group.total += 1;
      if (card.targetGender) group.targeted += 1;
      groups.set(key, group);
    }
    for (const [key, group] of groups) {
      expect({ key, share: group.targeted / group.total <= 0.1 }).toEqual({ key, share: true });
    }
  });

  it('ships both launch categories in all three levels', () => {
    const { categories, cards } = loadCatalog();
    expect(categories.map((category) => category.id).sort()).toEqual(['entre-dos', 'la-previa']);
    for (const categoryId of ['la-previa', 'entre-dos']) {
      const levels = new Set(
        cards.filter((card) => card.categoryId === categoryId).map((card) => card.difficulty),
      );
      expect([...levels].sort()).toEqual(['easy', 'hard', 'medium']);
    }
  });

  it('lists warnings for the content reviewer', () => {
    expect(Array.isArray(contentWarnings())).toBe(true);
  });
});

/** Recurring formats share one illustration (launch-catalog spec), matched by headline start. */
const formatIllustrations: readonly { headline: RegExp; illustration: string }[] = [
  { headline: /^cultura time/i, illustration: 'mascot-monocle' },
  { headline: /^historytime/i, illustration: 'mascot-reading-book' },
  { headline: /^momento sad/i, illustration: 'mascot-sad-map-pin' },
];

function isLibraryKey(key: string): key is IllustrationKey {
  return (illustrationKeys as readonly string[]).includes(key);
}

describe('shipped catalog illustrations', () => {
  it('uses every illustration library key at least once', () => {
    const used = new Set(loadCatalog().cards.map((card) => card.illustration));
    const unused = illustrationKeys.filter((key) => !used.has(key));
    expect(unused).toEqual([]);
  });

  it.each(['la-previa', 'entre-dos'])('has illustrated cards in every level of %s', (categoryId) => {
    const { cards } = loadCatalog();
    for (const difficulty of allDifficulties) {
      const illustrated = cards.filter(
        (card) =>
          card.categoryId === categoryId &&
          card.difficulty === difficulty &&
          card.illustration !== undefined,
      ).length;
      expect({ difficulty, hasIllustrated: illustrated > 0 }).toEqual({
        difficulty,
        hasIllustrated: true,
      });
    }
  });

  it('puts drink props only on group cards, where the group rule is the shared drink', () => {
    const drinkProps: readonly string[] = ['shot-glass-on-fire', 'glasses-toasting'];
    const misplaced = loadCatalog()
      .cards.filter((card) => card.illustration !== undefined && drinkProps.includes(card.illustration))
      .filter((card) => card.type !== 'everyoneWho' && card.type !== 'neverHaveIEver')
      .map((card) => card.id);
    expect(misplaced).toEqual([]);
  });

  it('gives every card of a recurring format its format key, once that key exists', () => {
    const { cards } = loadCatalog();
    const formatsWithArt = formatIllustrations.filter(({ illustration }) => isLibraryKey(illustration));
    for (const { headline, illustration } of formatsWithArt) {
      const formatCards = cards.filter((card) => card.headline !== undefined && headline.test(card.headline));
      expect(formatCards.length).toBeGreaterThan(0);
      for (const card of formatCards) {
        expect({ id: card.id, illustration: card.illustration }).toEqual({ id: card.id, illustration });
      }
    }
  });
});

describe('buildCatalog', () => {
  it('rejects a catalog with errors so it never reaches the app', () => {
    const broken = {
      categories: validCategories,
      cards: [{ ...validCards[0], points: 99 }],
    } as Catalog;
    expect(() => buildCatalog([broken])).toThrow(/content errors/);
  });

  it('merges valid sources', () => {
    expect(buildCatalog([{ categories: validCategories, cards: validCards }]).cards).toHaveLength(
      validCards.length,
    );
  });
});

describe('categoriesForMode', () => {
  it('returns only the categories of the mode', () => {
    expect(categoriesForMode('friends').map((category) => category.id)).toEqual(['la-previa']);
    expect(categoriesForMode('couple').map((category) => category.id)).toEqual(['entre-dos']);
  });
});
