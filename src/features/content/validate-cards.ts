import { findBannedPhrases } from './banned-phrases';
import {
  copyLengthLimits,
  groupCardTypes,
  individualCardTypes,
  pointsRangeByDifficulty,
  type Card,
  type CardType,
  type Category,
  type Difficulty,
  type GameMode,
  type Heat,
} from './card-types';
import { longestRenderedLength, parseGenderedText, type TextIssue } from './gendered-text';

export type ContentRule =
  | 'missingField'
  | 'invalidField'
  | 'forbiddenField'
  | 'duplicateId'
  | 'unknownCategory'
  | 'pointsRange'
  | 'drinksLimit'
  | 'copyLength'
  | 'heatMode'
  | 'bannedPhrase'
  | 'malformedVariant'
  | 'malformedText'
  | 'unknownPlaceholder'
  | 'targetGender';

export type ContentViolation = {
  /** Card ID, or `cards[<index>]` when the card has no usable ID. */
  subjectId: string;
  rule: ContentRule;
  message: string;
};

/** Untrusted card data (e.g. JSON from the write-cards skill): any field may be missing or mistyped. */
export type CardInput = { [Field in keyof Card]?: unknown };

export type CatalogInput = {
  categories: Category[];
  cards: CardInput[];
};

const cardTypes: readonly CardType[] = [...individualCardTypes, ...groupCardTypes];
const difficulties = Object.keys(pointsRangeByDifficulty) as Difficulty[];
const heats: readonly Heat[] = ['standard', 'spicy'];
const targetGenders: readonly string[] = ['male', 'female'];
const allowedDrinks: readonly unknown[] = [1, 2, 3];

const placeholdersByMode: Record<GameMode, readonly string[]> = {
  friends: ['player'],
  couple: ['player', 'partner'],
};

const ruleByTextIssue: Record<TextIssue['kind'], ContentRule> = {
  malformedVariant: 'malformedVariant',
  unknownToken: 'malformedText',
  unbalancedBrace: 'malformedText',
};

type CopyField = 'headline' | 'body' | 'penalty.quip';

type Report = (rule: ContentRule, message: string) => void;

function isMissing(value: unknown): boolean {
  return value === undefined || value === null || value === '';
}

function isOneOf<Value>(options: readonly Value[], value: unknown): value is Value {
  return options.includes(value as Value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function checkEnum<Value>(
  report: Report,
  field: string,
  value: unknown,
  options: readonly Value[],
): Value | undefined {
  if (isMissing(value)) {
    report('missingField', `${field} is required.`);
    return undefined;
  }
  if (!isOneOf(options, value)) {
    report('invalidField', `${field} must be one of: ${options.join(', ')}.`);
    return undefined;
  }
  return value;
}

function checkRequiredText(report: Report, field: CopyField, value: unknown): string | undefined {
  if (isMissing(value)) {
    report('missingField', `${field} is required.`);
    return undefined;
  }
  return checkOptionalText(report, field, value);
}

function checkOptionalText(report: Report, field: string, value: unknown): string | undefined {
  if (isMissing(value)) return undefined;
  if (typeof value !== 'string') {
    report('invalidField', `${field} must be text.`);
    return undefined;
  }
  return value;
}

function checkBoolean(report: Report, field: string, value: unknown): void {
  if (value === undefined || value === null) {
    report('missingField', `${field} is required.`);
  } else if (typeof value !== 'boolean') {
    report('invalidField', `${field} must be true or false.`);
  }
}

function checkCopy(
  report: Report,
  field: CopyField,
  text: string,
  mode: GameMode | undefined,
): void {
  if (field !== 'penalty.quip') {
    const limit = copyLengthLimits[field];
    const length = longestRenderedLength(text);
    if (length > limit) {
      report('copyLength', `${field} is ${length} characters in its longest variant; the limit is ${limit}.`);
    }
  }

  for (const phrase of findBannedPhrases(text)) {
    report('bannedPhrase', `${field} contains the banned phrase "${phrase}".`);
  }

  const { segments, issues } = parseGenderedText(text);
  for (const issue of issues) {
    report(ruleByTextIssue[issue.kind], `${field} has a malformed token: ${issue.token}`);
  }

  if (mode === undefined) return;
  const allowedPlaceholders = placeholdersByMode[mode];
  for (const segment of segments) {
    if (segment.kind === 'placeholder' && !allowedPlaceholders.includes(segment.name)) {
      report(
        'unknownPlaceholder',
        `${field} uses {${segment.name}}; ${mode} cards allow ${allowedPlaceholders.map((name) => `{${name}}`).join(', ')}.`,
      );
    }
  }
}

function checkPoints(report: Report, points: unknown, difficulty: Difficulty | undefined): void {
  if (points === undefined || points === null) {
    report('missingField', 'points is required for challenge and truth cards.');
    return;
  }
  if (difficulty === undefined) return;
  const { min, max } = pointsRangeByDifficulty[difficulty];
  if (typeof points !== 'number' || !Number.isInteger(points) || points < min || points > max) {
    report('pointsRange', `points must be a whole number from ${min} to ${max} for ${difficulty} cards.`);
  }
}

function checkPenalty(report: Report, penalty: unknown, mode: GameMode | undefined): void {
  if (penalty === undefined || penalty === null) {
    report('missingField', 'penalty is required for challenge and truth cards.');
    return;
  }
  if (!isPlainObject(penalty) || !isOneOf(allowedDrinks, penalty.drinks)) {
    report('drinksLimit', 'penalty.drinks must be 1, 2, or 3 (PRD §5.8).');
  }
  if (!isPlainObject(penalty)) return;
  const quip = checkOptionalText(report, 'penalty.quip', penalty.quip);
  if (quip !== undefined) checkCopy(report, 'penalty.quip', quip, mode);
}

function checkCard(
  card: CardInput,
  report: Report,
  categoriesById: Map<string, Category>,
): void {
  const type = checkEnum(report, 'type', card.type, cardTypes);
  const difficulty = checkEnum(report, 'difficulty', card.difficulty, difficulties);
  const heat = checkEnum(report, 'heat', card.heat, heats);

  let category: Category | undefined;
  if (isMissing(card.categoryId)) {
    report('missingField', 'categoryId is required.');
  } else if (typeof card.categoryId !== 'string' || !categoriesById.has(card.categoryId)) {
    report('unknownCategory', `categoryId "${String(card.categoryId)}" is not in the catalog.`);
  } else {
    category = categoriesById.get(card.categoryId);
  }
  const mode = category?.mode;

  checkBoolean(report, 'requiresConsent', card.requiresConsent);
  checkBoolean(report, 'reachesOutside', card.reachesOutside);
  checkOptionalText(report, 'illustration', card.illustration);
  checkOptionalText(report, 'sourceLegacyId', card.sourceLegacyId);

  const isIndividual = type !== undefined && isOneOf(individualCardTypes, type);
  const isGroup = type !== undefined && isOneOf(groupCardTypes, type);

  const headline = isIndividual
    ? checkRequiredText(report, 'headline', card.headline)
    : checkOptionalText(report, 'headline', card.headline);
  if (headline !== undefined) checkCopy(report, 'headline', headline, mode);

  const body = checkRequiredText(report, 'body', card.body);
  if (body !== undefined) checkCopy(report, 'body', body, mode);

  if (isIndividual) {
    checkPoints(report, card.points, difficulty);
    checkPenalty(report, card.penalty, mode);
  }
  if (isGroup) {
    if (card.points !== undefined) report('forbiddenField', 'Group cards must not have points.');
    if (card.penalty !== undefined) report('forbiddenField', 'Group cards must not have a penalty.');
  }

  if (heat === 'spicy' && mode === 'couple') {
    report('heatMode', 'Spicy (Sin Filtro) cards must belong to a friends category (PRD §6.4).');
  }

  if (card.targetGender !== undefined && !isOneOf(targetGenders, card.targetGender)) {
    report('targetGender', 'targetGender must be male or female when set.');
  }
}

/** Returns every content rule the catalog breaks; an empty list means it can ship. */
export function validateCards(catalog: CatalogInput): ContentViolation[] {
  const violations: ContentViolation[] = [];
  const categoriesById = new Map(catalog.categories.map((category) => [category.id, category]));
  const seenIds = new Set<string>();

  catalog.cards.forEach((card, index) => {
    const hasId = isPlainObject(card) && typeof card.id === 'string' && card.id !== '';
    const subjectId = hasId ? (card.id as string) : `cards[${index}]`;
    const report: Report = (rule, message) => violations.push({ subjectId, rule, message });

    if (!isPlainObject(card)) {
      report('invalidField', 'A card must be an object.');
      return;
    }
    if (!hasId) {
      report('missingField', 'id is required.');
    } else if (seenIds.has(subjectId)) {
      report('duplicateId', `id "${subjectId}" is used by more than one card.`);
    } else {
      seenIds.add(subjectId);
    }

    checkCard(card, report, categoriesById);
  });

  return violations;
}
