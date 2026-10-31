/**
 * Phrases card copy should not contain: excessive-drinking instructions (PRD §5.8,
 * App Store 1.4.3) and the slurs found in the legacy deck, with their feminine and
 * common Colombian forms (PRD §6.3). Matches are warnings for human review.
 * Write entries lower-case and without accents.
 */
export const bannedPhrases: readonly string[] = [
  'fondo blanco',
  'hasta el fondo',
  'puss',
  'pussy',
  'puto',
  'puta',
  'hpt',
  'hpta',
  'hijueputa',
  'hijo de puta',
  'gilipollas',
  'pelotudo',
  'pelotuda',
  'marica',
  'maricon',
  'mka',
  'mk',
  'morrongo',
];

/** Combining marks and invisible format characters (zero-width spaces, soft hyphens). */
const ignoredCharactersPattern = /[\p{M}\p{Cf}]/gu;

/** What may sit between the words of a phrase: spaces, separators, or nothing. */
const wordSeparator = '[\\s\\-_.]*';

const pluralSuffix = '(?:e?s)?';

/** Lower-case text without accents, compatibility forms, or invisible characters, for heuristic matching. */
export function normalizeForMatching(text: string): string {
  return text.normalize('NFKD').replace(ignoredCharactersPattern, '').toLowerCase();
}

function escapeForPattern(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function phrasePattern(phrase: string): RegExp {
  const words = phrase.split(' ').map(escapeForPattern);
  const lastLetter = escapeForPattern(phrase.slice(-1));
  // Repeated last letters ("mkaaa") and a plural ending ("putos") still match.
  const body = `${words.join(wordSeparator)}${lastLetter}*${pluralSuffix}`;
  return new RegExp(`(?<![a-z0-9])${body}(?![a-z0-9])`);
}

const bannedPhrasePatterns = bannedPhrases.map((phrase) => ({
  phrase,
  pattern: phrasePattern(phrase),
}));

/** Returns the banned phrases found in the text, once each, in list order. */
export function findBannedPhrases(text: string): string[] {
  const normalizedText = normalizeForMatching(text);
  return bannedPhrasePatterns
    .filter(({ pattern }) => pattern.test(normalizedText))
    .map(({ phrase }) => phrase);
}
