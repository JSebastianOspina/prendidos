/**
 * Phrases no card copy may contain: excessive-drinking instructions (PRD §5.8,
 * App Store 1.4.3) and the slurs found in the legacy deck (PRD §6.3).
 * Write entries lower-case and without accents.
 */
export const bannedPhrases: readonly string[] = [
  'fondo blanco',
  'hasta el fondo',
  'puss',
  'puto',
  'gilipollas',
  'pelotudo',
  'marica',
  'mka',
  'morrongo',
];

const combiningMarksPattern = /\p{M}/gu;

function normalize(text: string): string {
  return text.normalize('NFD').replace(combiningMarksPattern, '').toLowerCase();
}

function phrasePattern(phrase: string): RegExp {
  const words = phrase.split(' ').join('\\s+');
  return new RegExp(`(?<![a-z0-9])${words}(?![a-z0-9])`);
}

const bannedPhrasePatterns = bannedPhrases.map((phrase) => ({
  phrase,
  pattern: phrasePattern(phrase),
}));

/** Returns the banned phrases found in the text, once each, in list order. */
export function findBannedPhrases(text: string): string[] {
  const normalizedText = normalize(text);
  return bannedPhrasePatterns
    .filter(({ pattern }) => pattern.test(normalizedText))
    .map(({ phrase }) => phrase);
}
