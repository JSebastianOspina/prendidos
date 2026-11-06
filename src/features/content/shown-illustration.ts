import type { Card, Difficulty, IllustrationKey } from './card-types';

/** The level's mascot face (as on the level-up screen) for cards without an illustration key. */
const levelFaceByDifficulty: Record<Difficulty, IllustrationKey> = {
  easy: 'mascot-relaxed',
  medium: 'mascot-smirk',
  hard: 'mascot-laugh',
};

export function defaultIllustrationFor(difficulty: Difficulty): IllustrationKey {
  return levelFaceByDifficulty[difficulty];
}

/** The illustration a card shows when it has room: its own key, or its level's mascot face. */
export function shownIllustrationFor(card: Card): IllustrationKey {
  return card.illustration ?? defaultIllustrationFor(card.difficulty);
}
