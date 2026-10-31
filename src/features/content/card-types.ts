/**
 * Content domain types for bundled cards. Shapes and rules come from
 * docs/data-model.md and openspec/specs/card-content.
 */

export type GameMode = 'friends' | 'couple';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type IndividualCardType = 'challenge' | 'truth';

export type GroupCardType = 'everyoneWho' | 'neverHaveIEver';

export type CardType = IndividualCardType | GroupCardType;

/** `spicy` cards form the opt-in Sin Filtro layer (PRD §6.4). */
export type Heat = 'standard' | 'spicy';

export type PlayerGender = 'male' | 'female' | 'undisclosed';

export type TargetGender = Exclude<PlayerGender, 'undisclosed'>;

/**
 * Spanish copy with `{player}` / `{partner}` placeholders and
 * `{masculine|feminine|neutral}` gender variants.
 */
export type GenderedText = string;

export type DrinkCount = 1 | 2 | 3;

export type DrinkPenalty = {
  drinks: DrinkCount;
  /** Teasing tag shown after the drinks, e.g. "por aguafiestas". */
  quip?: GenderedText;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  mode: GameMode;
  freeDifficulties: Difficulty[];
};

type CardBase = {
  id: string;
  categoryId: string;
  difficulty: Difficulty;
  body: GenderedText;
  heat: Heat;
  /** The app shows "Solo si la otra persona acepta" on the card. */
  requiresConsent: boolean;
  /** Calls, messages, or posts; the app shows the outside-contact rules. */
  reachesOutside: boolean;
  illustration?: string;
  targetGender?: TargetGender;
  sourceLegacyId?: string;
};

export type IndividualCard = CardBase & {
  type: IndividualCardType;
  headline: GenderedText;
  points: number;
  penalty: DrinkPenalty;
};

export type GroupCard = CardBase & {
  type: GroupCardType;
  headline?: GenderedText;
  points?: never;
  penalty?: never;
};

export type Card = IndividualCard | GroupCard;

export type PointsRange = { min: number; max: number };

export const pointsRangeByDifficulty: Record<Difficulty, PointsRange> = {
  easy: { min: 1, max: 10 },
  medium: { min: 11, max: 20 },
  hard: { min: 21, max: 30 },
};

export const copyLengthLimits = {
  headline: 45,
  body: 240,
  quip: 30,
} as const;

/** Assumed rendered length of a placeholder, since real names are unknown when validating. */
export const placeholderRenderLength = 12;

export const individualCardTypes: readonly IndividualCardType[] = ['challenge', 'truth'];

export const groupCardTypes: readonly GroupCardType[] = ['everyoneWho', 'neverHaveIEver'];

/** Levels in play order. */
export const allDifficulties: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export const playerGenders: readonly PlayerGender[] = ['male', 'female', 'undisclosed'];
