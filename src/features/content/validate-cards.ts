import { findBannedPhrases, normalizeForMatching } from './banned-phrases';
import {
  copyLengthLimits,
  groupCardTypes,
  individualCardTypes,
  pointsRangeByDifficulty,
  type Card,
  type CardType,
  type Difficulty,
  type GameMode,
  type Heat,
} from './card-types';
import {
  isBlank,
  longestRenderedLength,
  parseGenderedText,
  renderAllGenders,
  type TextIssue,
} from './gendered-text';

export type ContentRule =
  | 'missingField'
  | 'invalidField'
  | 'unknownField'
  | 'forbiddenField'
  | 'duplicateId'
  | 'unknownCategory'
  | 'pointsRange'
  | 'drinksLimit'
  | 'drinksInCopy'
  | 'copyLength'
  | 'heatMode'
  | 'bannedPhrase'
  | 'malformedVariant'
  | 'malformedText'
  | 'unknownPlaceholder'
  | 'targetGender';

/** `error` blocks shipping; `warning` flags copy for the mandatory human review (PRD §6.2). */
export type ViolationSeverity = 'error' | 'warning';

export type ContentViolation = {
  /** Card or category ID; `cards[i]` / `categories[i]` without a usable ID; or `catalog`. */
  subjectId: string;
  rule: ContentRule;
  severity: ViolationSeverity;
  message: string;
};

/** Text heuristics that can't be both complete and free of false positives. */
const warningRules: ReadonlySet<ContentRule> = new Set<ContentRule>(['bannedPhrase', 'drinksInCopy']);

/** Untrusted card data (e.g. JSON from the write-cards skill): any field may be missing or mistyped. */
export type CardInput = { [Field in keyof Card]?: unknown };

type PlainObject = Record<string, unknown>;

type Report = (rule: ContentRule, message: string) => void;

type CopyField = 'headline' | 'body' | 'penalty.quip';

/** Mode of a known category; `null` when the category exists but its mode is invalid. */
type CategoryModes = Map<string, GameMode | null>;

const cardTypes: readonly CardType[] = [...individualCardTypes, ...groupCardTypes];
const difficulties = Object.keys(pointsRangeByDifficulty) as Difficulty[];
const gameModes: readonly GameMode[] = ['friends', 'couple'];
const heats: readonly Heat[] = ['standard', 'spicy'];
const targetGenders: readonly string[] = ['male', 'female'];
const allowedDrinks: readonly unknown[] = [1, 2, 3];

const cardFields: readonly string[] = [
  'id',
  'categoryId',
  'type',
  'difficulty',
  'headline',
  'body',
  'points',
  'penalty',
  'heat',
  'requiresConsent',
  'reachesOutside',
  'illustration',
  'targetGender',
  'sourceLegacyId',
];

/** Notes the write-cards skill adds for reviewers; ignored by validation. */
const authoringNoteFields: readonly string[] = ['rationale', 'selfCheck', 'illustrationIdea'];

const penaltyFields: readonly string[] = ['drinks', 'quip'];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const placeholdersByMode: Record<GameMode, readonly string[]> = {
  friends: ['player'],
  couple: ['player', 'partner'],
};

const placeholdersInAnyMode = [...new Set(Object.values(placeholdersByMode).flat())];

const ruleByTextIssue: Record<TextIssue['kind'], ContentRule> = {
  malformedVariant: 'malformedVariant',
  unknownToken: 'malformedText',
  unbalancedBrace: 'malformedText',
};

const drinkUnits =
  '(?:tragos?|shots?|copas?|piscineros?|polas?|guaros?|aguardientes?|cervezas?|chupitos?|vasos?|botellas?)';

/** An amount shortly before a drink unit: "5 tragos", "dos shots", "media botella", "5tragos". */
const drinkAmountPattern = new RegExp(
  `(?<![a-z0-9])(?:\\d+|un|una|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|doble|media|medio)(?:\\s+\\S+){0,2}?\\s*${drinkUnits}(?![a-z0-9])`,
);

/**
 * A drinking verb shortly before an amount: "se toma 2", "tómese tres", "se toman uno".
 * "un" / "una" are left out so photo dares ("tómense una selfie") pass.
 */
const drinkingVerbPattern =
  /(?<![a-z0-9])(?:tom(?:a|as|an|e|es|en|ese|ense|ate|emos)|beb(?:a|as|an|e|es|en|ase|anse|ete))(?:\s+\S+){0,2}?\s+(?:\d+|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|doble)(?![a-z0-9])/;

function prescribesDrinks(text: string): boolean {
  const normalized = normalizeForMatching(text);
  return drinkAmountPattern.test(normalized) || drinkingVerbPattern.test(normalized);
}

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Reads an own property only, so keys like `constructor` never resolve to prototype values. */
function readField(record: PlainObject, field: string): unknown {
  return Object.prototype.hasOwnProperty.call(record, field) ? record[field] : undefined;
}

function isUnset(value: unknown): boolean {
  return value === undefined || value === null;
}

function isMissing(value: unknown): boolean {
  return isUnset(value) || (typeof value === 'string' && isBlank(value));
}

function isOneOf<Value>(options: readonly Value[], value: unknown): value is Value {
  return options.includes(value as Value);
}

/** True when any violation blocks shipping; warnings alone still need a human review. */
export function hasErrors(violations: readonly ContentViolation[]): boolean {
  return violations.some((violation) => violation.severity === 'error');
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

function checkOptionalText(report: Report, field: string, value: unknown): string | undefined {
  if (isUnset(value)) return undefined;
  if (typeof value !== 'string') {
    report('invalidField', `${field} must be text.`);
    return undefined;
  }
  return value;
}

function checkOptionalNonBlankText(report: Report, field: string, value: unknown): string | undefined {
  if (typeof value === 'string' && isBlank(value)) {
    report('missingField', `${field} cannot be blank; omit it instead.`);
    return undefined;
  }
  return checkOptionalText(report, field, value);
}

function checkRequiredText(report: Report, field: string, value: unknown): string | undefined {
  if (isMissing(value)) {
    report('missingField', `${field} is required and cannot be blank.`);
    return undefined;
  }
  return checkOptionalText(report, field, value);
}

function checkBoolean(report: Report, field: string, value: unknown): void {
  if (isUnset(value)) {
    report('missingField', `${field} is required.`);
  } else if (typeof value !== 'boolean') {
    report('invalidField', `${field} must be true or false.`);
  }
}

/** Placeholders a card may use, with a phrase for messages. */
type PlaceholderPolicy = { allowed: readonly string[]; context: string };

function placeholderPolicyFor(mode: GameMode | null, isGroupCard: boolean): PlaceholderPolicy {
  if (isGroupCard) return { allowed: [], context: 'group cards' };
  if (mode === null) return { allowed: placeholdersInAnyMode, context: 'any mode' };
  return { allowed: placeholdersByMode[mode], context: `${mode} cards` };
}

const lengthLimitByField: Record<CopyField, number> = {
  headline: copyLengthLimits.headline,
  body: copyLengthLimits.body,
  'penalty.quip': copyLengthLimits.quip,
};

function checkCopy(
  report: Report,
  field: CopyField,
  text: string,
  placeholderPolicy: PlaceholderPolicy,
): void {
  const limit = lengthLimitByField[field];
  const length = longestRenderedLength(text);
  if (length > limit) {
    report('copyLength', `${field} is ${length} characters in its longest variant; the limit is ${limit}.`);
  }

  const renderings = renderAllGenders(text);
  const bannedFound = new Set(renderings.flatMap(findBannedPhrases));
  for (const phrase of bannedFound) {
    report('bannedPhrase', `${field} contains the banned phrase "${phrase}".`);
  }

  if (field !== 'headline' && renderings.some(prescribesDrinks)) {
    report('drinksInCopy', `${field} seems to state an amount to drink; drinks belong only in penalty.drinks (PRD §5.8).`);
  }

  const { segments, issues } = parseGenderedText(text);
  for (const issue of issues) {
    report(ruleByTextIssue[issue.kind], `${field} has a malformed token: ${issue.token}`);
  }

  for (const segment of segments) {
    if (segment.kind === 'placeholder' && !placeholderPolicy.allowed.includes(segment.name)) {
      report(
        'unknownPlaceholder',
        `${field} uses {${segment.name}}, which is not allowed in ${placeholderPolicy.context}.`,
      );
    }
  }
}

function checkPoints(report: Report, points: unknown, difficulty: Difficulty | undefined): void {
  if (isUnset(points)) {
    report('missingField', 'points is required for challenge and truth cards.');
    return;
  }
  if (typeof points !== 'number') {
    report('invalidField', 'points must be a number.');
    return;
  }
  if (difficulty === undefined) return;
  const { min, max } = pointsRangeByDifficulty[difficulty];
  if (!Number.isInteger(points) || points < min || points > max) {
    report('pointsRange', `points must be a whole number from ${min} to ${max} for ${difficulty} cards.`);
  }
}

function reportUnknownFields(
  report: Report,
  record: PlainObject,
  knownFields: readonly string[],
  prefix = '',
): void {
  for (const field of Object.keys(record)) {
    if (!knownFields.includes(field)) {
      report('unknownField', `Unknown field "${prefix}${field}"; check for a typo.`);
    }
  }
}

function checkPenalty(report: Report, penalty: unknown, placeholderPolicy: PlaceholderPolicy): void {
  if (isUnset(penalty)) {
    report('missingField', 'penalty is required for challenge and truth cards.');
    return;
  }
  if (!isPlainObject(penalty) || !isOneOf(allowedDrinks, readField(penalty, 'drinks'))) {
    report('drinksLimit', 'penalty.drinks must be 1, 2, or 3 (PRD §5.8).');
  }
  if (!isPlainObject(penalty)) return;
  reportUnknownFields(report, penalty, penaltyFields, 'penalty.');
  const quip = checkOptionalNonBlankText(report, 'penalty.quip', readField(penalty, 'quip'));
  if (quip !== undefined) checkCopy(report, 'penalty.quip', quip, placeholderPolicy);
}

function checkCategories(categories: unknown[], report: (subjectId: string) => Report): CategoryModes {
  const modes: CategoryModes = new Map();

  categories.forEach((category, index) => {
    const position = `categories[${index}]`;
    if (!isPlainObject(category)) {
      report(position)('invalidField', 'A category must be an object.');
      return;
    }

    const id = readField(category, 'id');
    const hasId = typeof id === 'string' && !isBlank(id);
    const reportCategory = report(hasId ? id : position);
    if (!hasId) {
      reportCategory(isMissing(id) ? 'missingField' : 'invalidField', 'id is required and must be text.');
    } else if (modes.has(id)) {
      reportCategory('duplicateId', `Category id "${id}" is used by more than one category.`);
    }

    const mode = checkEnum(reportCategory, 'mode', readField(category, 'mode'), gameModes);

    const freeDifficulties = readField(category, 'freeDifficulties');
    if (
      !Array.isArray(freeDifficulties) ||
      !freeDifficulties.every((difficulty) => isOneOf(difficulties, difficulty))
    ) {
      reportCategory('invalidField', `freeDifficulties must be a list of: ${difficulties.join(', ')}.`);
    }

    if (hasId && !modes.has(id)) modes.set(id, mode ?? null);
  });

  return modes;
}

function checkCard(card: PlainObject, report: Report, categoryModes: CategoryModes): void {
  reportUnknownFields(report, card, [...cardFields, ...authoringNoteFields]);

  const type = checkEnum(report, 'type', readField(card, 'type'), cardTypes);
  const difficulty = checkEnum(report, 'difficulty', readField(card, 'difficulty'), difficulties);
  const heat = checkEnum(report, 'heat', readField(card, 'heat'), heats);

  let mode: GameMode | null = null;
  const categoryId = readField(card, 'categoryId');
  if (isMissing(categoryId)) {
    report('missingField', 'categoryId is required.');
  } else if (typeof categoryId !== 'string' || !categoryModes.has(categoryId)) {
    report('unknownCategory', `categoryId "${String(categoryId)}" is not in the catalog.`);
  } else {
    mode = categoryModes.get(categoryId) ?? null;
  }

  checkBoolean(report, 'requiresConsent', readField(card, 'requiresConsent'));
  checkBoolean(report, 'reachesOutside', readField(card, 'reachesOutside'));
  checkOptionalText(report, 'illustration', readField(card, 'illustration'));
  checkOptionalText(report, 'sourceLegacyId', readField(card, 'sourceLegacyId'));

  const isIndividual = type !== undefined && isOneOf(individualCardTypes, type);
  const isGroup = type !== undefined && isOneOf(groupCardTypes, type);
  const placeholderPolicy = placeholderPolicyFor(mode, isGroup);

  const headline = isIndividual
    ? checkRequiredText(report, 'headline', readField(card, 'headline'))
    : checkOptionalText(report, 'headline', readField(card, 'headline'));
  if (headline !== undefined && !isBlank(headline)) {
    checkCopy(report, 'headline', headline, placeholderPolicy);
  }

  const body = checkRequiredText(report, 'body', readField(card, 'body'));
  if (body !== undefined) checkCopy(report, 'body', body, placeholderPolicy);

  const points = readField(card, 'points');
  const penalty = readField(card, 'penalty');
  if (isIndividual) {
    checkPoints(report, points, difficulty);
    checkPenalty(report, penalty, placeholderPolicy);
  }
  if (isGroup) {
    if (!isUnset(points)) report('forbiddenField', 'Group cards must not have points.');
    if (!isUnset(penalty)) report('forbiddenField', 'Group cards must not have a penalty.');
  }

  if (heat === 'spicy' && mode === 'couple') {
    report('heatMode', 'Spicy (Sin Filtro) cards must belong to a friends category (PRD §6.4).');
  }

  const targetGender = readField(card, 'targetGender');
  if (!isUnset(targetGender) && !isOneOf(targetGenders, targetGender)) {
    report('targetGender', 'targetGender must be male or female when set.');
  }
}

/**
 * Returns every content rule the catalog breaks. It can ship when `hasErrors` is false
 * and a human has reviewed the warnings. Never throws on a JSON value.
 */
export function validateCards(catalog: unknown): ContentViolation[] {
  const violations: ContentViolation[] = [];
  const reportFor =
    (subjectId: string): Report =>
    (rule, message) =>
      violations.push({
        subjectId,
        rule,
        severity: warningRules.has(rule) ? 'warning' : 'error',
        message,
      });

  if (!isPlainObject(catalog)) {
    reportFor('catalog')('invalidField', 'The catalog must be an object with categories and cards lists.');
    return violations;
  }

  const categories = readField(catalog, 'categories');
  const cards = readField(catalog, 'cards');
  if (!Array.isArray(categories)) reportFor('catalog')('invalidField', 'categories must be a list.');
  if (!Array.isArray(cards)) reportFor('catalog')('invalidField', 'cards must be a list.');

  const categoryModes = checkCategories(Array.isArray(categories) ? categories : [], reportFor);
  const seenIds = new Set<string>();

  (Array.isArray(cards) ? cards : []).forEach((card, index) => {
    const position = `cards[${index}]`;
    if (!isPlainObject(card)) {
      reportFor(position)('invalidField', 'A card must be an object.');
      return;
    }

    const id = readField(card, 'id');
    const hasId = typeof id === 'string' && !isBlank(id);
    const report = reportFor(hasId ? id : position);
    if (!hasId) {
      report(isMissing(id) ? 'missingField' : 'invalidField', 'id is required and must be text.');
    } else if (!slugPattern.test(id)) {
      report('invalidField', 'id must be a slug of lowercase letters, digits, and single hyphens.');
    } else if (seenIds.has(id)) {
      report('duplicateId', `id "${id}" is used by more than one card.`);
    } else {
      seenIds.add(id);
    }

    checkCard(card, report, categoryModes);
  });

  return violations;
}
