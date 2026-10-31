/** Facts a category card shows, derived from the bundled catalog. */
import {
  allDifficulties,
  type Card,
  type Category,
  type Difficulty,
} from '@/features/content/card-types';
import { loadCatalog } from '@/features/content/catalog';

export type LevelCardCounts = Record<Difficulty, number>;

/** Standard cards per level; the opt-in Sin Filtro (`spicy`) layer is not counted. */
export function standardCardCounts(
  categoryId: string,
  cards: readonly Card[] = loadCatalog().cards,
): LevelCardCounts {
  const counts: LevelCardCounts = { easy: 0, medium: 0, hard: 0 };
  for (const card of cards) {
    if (card.categoryId === categoryId && card.heat === 'standard') counts[card.difficulty] += 1;
  }
  return counts;
}

export function totalCards(counts: LevelCardCounts): number {
  return allDifficulties.reduce((sum, difficulty) => sum + counts[difficulty], 0);
}

/** Every level is playable without a purchase. */
export function isFullyFree(category: Category): boolean {
  return allDifficulties.every((difficulty) => category.freeDifficulties.includes(difficulty));
}
