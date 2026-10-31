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

  it('holds enough standard La Previa cards for 10 rounds with 6 players without a pool reset', () => {
    const { cards } = loadCatalog();
    const individualAt = (difficulty: string) =>
      cards.filter(
        (card) =>
          card.categoryId === 'la-previa' &&
          card.heat === 'standard' &&
          card.difficulty === difficulty &&
          (card.type === 'challenge' || card.type === 'truth'),
      ).length;
    // Rounds 1–4 easy, 5–7 medium, 8–10 hard → 24 / 18 / 18 individual turns.
    expect(individualAt('easy')).toBeGreaterThanOrEqual(24);
    expect(individualAt('medium')).toBeGreaterThanOrEqual(18);
    expect(individualAt('hard')).toBeGreaterThanOrEqual(18);
  });

  it('ships both launch categories in all three levels', () => {
    const { categories, cards } = loadCatalog();
    expect(categories.map((category) => category.id).sort()).toEqual(['entre-dos', 'la-previa']);
    for (const categoryId of ['la-previa', 'entre-dos']) {
      const levels = new Set(cards.filter((card) => card.categoryId === categoryId).map((card) => card.difficulty));
      expect([...levels].sort()).toEqual(['easy', 'hard', 'medium']);
    }
  });

  it('lists warnings for the content reviewer', () => {
    expect(Array.isArray(contentWarnings())).toBe(true);
  });
});

describe('buildCatalog', () => {
  it('rejects a catalog with errors so it never reaches the app', () => {
    const broken = { categories: validCategories, cards: [{ ...validCards[0], points: 99 }] } as Catalog;
    expect(() => buildCatalog([broken])).toThrow(/content errors/);
  });

  it('merges valid sources', () => {
    expect(buildCatalog([{ categories: validCategories, cards: validCards }]).cards).toHaveLength(validCards.length);
  });
});

describe('categoriesForMode', () => {
  it('returns only the categories of the mode', () => {
    expect(categoriesForMode('friends').map((category) => category.id)).toEqual(['la-previa']);
    expect(categoriesForMode('couple').map((category) => category.id)).toEqual(['entre-dos']);
  });
});
