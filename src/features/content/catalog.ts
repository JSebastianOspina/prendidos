/**
 * Bundled content runtime: loads the shipped JSON, validates it with the existing
 * validator, and refuses to serve a catalog with errors.
 */
import type { Card, Category, GameMode } from './card-types';
import entreDosSource from './catalog/entre-dos.json';
import laPreviaSource from './catalog/la-previa.json';
import { hasErrors, validateCards, type ContentViolation } from './validate-cards';

export type Catalog = { categories: Category[]; cards: Card[] };

/** Raw JSON sources, in the validator's catalog shape. */
export const shippedCatalogSources = [laPreviaSource, entreDosSource] as unknown as Catalog[];

function mergeSources(sources: readonly Catalog[]): Catalog {
  return {
    categories: sources.flatMap((source) => source.categories),
    cards: sources.flatMap((source) => source.cards),
  };
}

/** Merges and validates sources; throws when any card has an error. */
export function buildCatalog(sources: readonly Catalog[]): Catalog {
  const merged = mergeSources(sources);
  const errors = validateCards(merged).filter((violation) => violation.severity === 'error');
  if (hasErrors(errors)) {
    throw new Error(
      `Catalog has ${errors.length} content errors: ${errors.map((error) => error.message).join('; ')}`,
    );
  }
  return merged;
}

let cachedCatalog: Catalog | undefined;

/** The shipped catalog, already validated. */
export function loadCatalog(): Catalog {
  cachedCatalog ??= buildCatalog(shippedCatalogSources);
  return cachedCatalog;
}

export function categoriesForMode(mode: GameMode): Category[] {
  return loadCatalog().categories.filter((category) => category.mode === mode);
}

/** Warnings a human content reviewer must look at before release. */
export function contentWarnings(): ContentViolation[] {
  return validateCards(mergeSources(shippedCatalogSources)).filter(
    (violation) => violation.severity === 'warning',
  );
}
