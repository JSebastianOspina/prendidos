import legacyCorpus from '../../../../docs/content/legacy/legacy-challenges.json';
import { copyLengthLimits } from '../card-types';
import { hasErrors, validateCards, type CardInput } from '../validate-cards';
import {
  validCards,
  validCategories,
  validChallenge,
  validGroupCard,
  validTruth,
} from './fixtures/valid-catalog';

function validateOne(card: unknown) {
  return validateCards({ categories: validCategories, cards: [card] });
}

function rulesOf(card: unknown) {
  return validateOne(card).map((violation) => violation.rule);
}

describe('validateCards', () => {
  it('returns no violations for a valid catalog', () => {
    expect(validateCards({ categories: validCategories, cards: validCards })).toEqual([]);
  });

  it('reports every violation in the catalog, each with its card and rule', () => {
    const violations = validateCards({
      categories: validCategories,
      cards: [
        { ...validChallenge, penalty: { drinks: 4 } },
        validTruth,
        { ...validTruth, headline: 'Otra verdad' },
      ],
    });
    expect(violations).toEqual([
      expect.objectContaining({ subjectId: 'prev-001', rule: 'drinksLimit' }),
      expect.objectContaining({ subjectId: 'dos-001', rule: 'duplicateId' }),
    ]);
    violations.forEach((violation) => expect(violation.message).not.toBe(''));
  });

  describe('identity and category', () => {
    it('flags a duplicate ID across categories', () => {
      const violations = validateCards({
        categories: validCategories,
        cards: [validChallenge, { ...validTruth, id: 'prev-001' }],
      });
      expect(violations).toEqual([
        expect.objectContaining({ subjectId: 'prev-001', rule: 'duplicateId' }),
      ]);
    });

    it('flags a card without an ID, naming it by position', () => {
      expect(validateOne({ ...validChallenge, id: '' })).toEqual([
        expect.objectContaining({ subjectId: 'cards[0]', rule: 'missingField' }),
      ]);
    });

    it('flags a card without a category', () => {
      expect(rulesOf({ ...validChallenge, categoryId: undefined })).toEqual(['missingField']);
    });

    it('flags an unknown category', () => {
      expect(rulesOf({ ...validChallenge, categoryId: 'sin-filtro' })).toEqual(['unknownCategory']);
    });
  });

  describe('enumerated fields', () => {
    it.each([
      ['type', 'dare'],
      ['difficulty', 'prendido'],
      ['heat', 'extreme'],
      ['requiresConsent', 'yes'],
      ['reachesOutside', 1],
      ['illustration', 42],
      ['sourceLegacyId', false],
    ])('flags an invalid %s', (field, value) => {
      expect(rulesOf({ ...validChallenge, [field]: value })).toContain('invalidField');
    });

    it('flags missing consent and outside-contact flags', () => {
      expect(
        rulesOf({ ...validChallenge, requiresConsent: undefined, reachesOutside: undefined }),
      ).toEqual(['missingField', 'missingField']);
    });
  });

  describe('points', () => {
    it('flags points outside the level range', () => {
      expect(rulesOf({ ...validChallenge, difficulty: 'medium', points: 25 })).toEqual([
        'pointsRange',
      ]);
    });

    it('flags non-integer points', () => {
      expect(rulesOf({ ...validChallenge, difficulty: 'hard', points: 22.5 })).toEqual([
        'pointsRange',
      ]);
    });

    it('flags missing points on an individual card', () => {
      expect(rulesOf({ ...validTruth, points: undefined })).toEqual(['missingField']);
    });
  });

  describe('penalty', () => {
    it('flags more than 3 drinks', () => {
      expect(rulesOf({ ...validChallenge, penalty: { drinks: 4 } })).toEqual(['drinksLimit']);
    });

    it('flags zero drinks', () => {
      expect(rulesOf({ ...validChallenge, penalty: { drinks: 0 } })).toEqual(['drinksLimit']);
    });

    it('flags a missing penalty', () => {
      expect(rulesOf({ ...validChallenge, penalty: undefined })).toEqual(['missingField']);
    });

    it('flags a quip that is not text', () => {
      expect(rulesOf({ ...validChallenge, penalty: { drinks: 1, quip: 3 } })).toEqual([
        'invalidField',
      ]);
    });
  });

  describe('group cards', () => {
    it('flags points on a group card', () => {
      expect(rulesOf({ ...validGroupCard, points: 5 })).toEqual(['forbiddenField']);
    });

    it('flags a penalty on a group card', () => {
      expect(rulesOf({ ...validGroupCard, penalty: { drinks: 1 } })).toEqual(['forbiddenField']);
    });
  });

  describe('copy', () => {
    it('flags an individual card without a headline', () => {
      expect(rulesOf({ ...validChallenge, headline: '' })).toEqual(['missingField']);
    });

    it('flags a card without a body', () => {
      expect(rulesOf({ ...validGroupCard, body: undefined })).toEqual(['missingField']);
    });

    it('flags a headline longer than 45 characters', () => {
      expect(rulesOf({ ...validChallenge, headline: 'x'.repeat(46) })).toEqual(['copyLength']);
    });

    it('flags a body that is too long only in its longest variant', () => {
      const body = `${'x'.repeat(229)} {a|b|neutralxxxxxxxxxx}`;
      expect(rulesOf({ ...validChallenge, body })).toEqual(['copyLength']);
    });

    it('flags banned phrases regardless of case, naming the phrase', () => {
      const violations = validateOne({
        ...validChallenge,
        body: 'Cuente un chisme o se toma un FONDO BLANCO',
      });
      expect(violations).toEqual([expect.objectContaining({ rule: 'bannedPhrase' })]);
      expect(violations[0].message).toContain('fondo blanco');
    });

    it('checks the penalty quip for banned phrases', () => {
      expect(rulesOf({ ...validChallenge, penalty: { drinks: 2, quip: 'por puss*' } })).toEqual([
        'bannedPhrase',
      ]);
    });
  });

  describe('placeholders and gender variants', () => {
    it('flags a two-option variant', () => {
      expect(rulesOf({ ...validChallenge, headline: 'Muy {tímido|tímida}' })).toEqual([
        'malformedVariant',
      ]);
    });

    it('flags an unknown placeholder', () => {
      expect(rulesOf({ ...validChallenge, body: 'Llame a {jugador} ya' })).toEqual([
        'unknownPlaceholder',
      ]);
    });

    it('flags {partner} in a friends category', () => {
      expect(rulesOf({ ...validChallenge, body: 'Mírele a los ojos a {partner}' })).toEqual([
        'unknownPlaceholder',
      ]);
    });

    it('allows {player} in friends and {partner} in couple categories', () => {
      expect(rulesOf({ ...validChallenge, body: 'Imite a {player}' })).toEqual([]);
      expect(rulesOf(validTruth)).toEqual([]);
    });

    it('flags broken braces and empty tokens', () => {
      expect(rulesOf({ ...validChallenge, body: 'Abra la {jeta y {}' })).toEqual([
        'malformedText',
        'malformedText',
      ]);
    });
  });

  describe('heat by mode', () => {
    it('flags a spicy card in a couple category', () => {
      expect(rulesOf({ ...validTruth, heat: 'spicy' })).toEqual(['heatMode']);
    });
  });

  describe('target gender', () => {
    it('flags undisclosed as a target gender', () => {
      expect(rulesOf({ ...validChallenge, targetGender: 'undisclosed' })).toEqual([
        'targetGender',
      ]);
    });
  });

  describe('malformed input', () => {
    it('reports violations instead of throwing on wrong types', () => {
      const malformed = {
        id: 'bad-001',
        categoryId: 'la-previa',
        type: 'challenge',
        difficulty: 'easy',
        points: '10',
        penalty: 'Toma 2 tragos',
        headline: 7,
        body: null,
      } as unknown as CardInput;
      expect(() => validateOne(malformed)).not.toThrow();
      expect(rulesOf(malformed)).toEqual(
        expect.arrayContaining(['drinksLimit', 'invalidField', 'missingField']),
      );
    });

    it('reports a card that is not an object', () => {
      expect(rulesOf('not a card' as unknown as CardInput)).toEqual(['invalidField']);
    });

    it.each([null, 'catalog', 42, {}, { categories: {}, cards: {} }])(
      'reports a malformed catalog (%p) instead of throwing',
      (catalog) => {
        const violations = validateCards(catalog);
        expect(violations.length).toBeGreaterThan(0);
        violations.forEach((violation) =>
          expect(violation).toMatchObject({ subjectId: 'catalog', rule: 'invalidField' }),
        );
      },
    );

    it('reports categories and cards that are not objects by position', () => {
      expect(
        validateCards({ categories: [null, ...validCategories], cards: ['not a card'] }),
      ).toEqual([
        expect.objectContaining({ subjectId: 'categories[0]', rule: 'invalidField' }),
        expect.objectContaining({ subjectId: 'cards[0]', rule: 'invalidField' }),
      ]);
    });
  });

  describe('categories', () => {
    const coupleCategory = validCategories[1];

    it('flags a mode with the wrong case and skips mode rules for its cards', () => {
      const violations = validateCards({
        categories: [validCategories[0], { ...coupleCategory, mode: 'Couple' }],
        cards: [{ ...validTruth, heat: 'spicy' }],
      });
      expect(violations).toEqual([
        expect.objectContaining({ subjectId: 'entre-dos', rule: 'invalidField' }),
      ]);
    });

    it('flags a duplicate category ID', () => {
      expect(
        validateCards({ categories: [...validCategories, validCategories[0]], cards: [] }),
      ).toEqual([expect.objectContaining({ subjectId: 'la-previa', rule: 'duplicateId' })]);
    });

    it('flags free difficulties outside the difficulty list', () => {
      expect(
        validateCards({
          categories: [{ ...validCategories[0], freeDifficulties: ['prendido'] }],
          cards: [],
        }),
      ).toEqual([expect.objectContaining({ subjectId: 'la-previa', rule: 'invalidField' })]);
    });

    it('flags a category ID that is not text by position', () => {
      expect(
        validateCards({ categories: [{ ...validCategories[0], id: 7 }], cards: [] }),
      ).toEqual([expect.objectContaining({ subjectId: 'categories[0]', rule: 'invalidField' })]);
    });

    it('flags a category without a usable ID by position', () => {
      expect(
        validateCards({ categories: [{ ...validCategories[0], id: '  ' }], cards: [] }),
      ).toEqual([expect.objectContaining({ subjectId: 'categories[0]', rule: 'missingField' })]);
    });
  });

  describe('card IDs and fields', () => {
    it('flags an ID that is not a slug', () => {
      expect(rulesOf({ ...validChallenge, id: 'Prev 001' })).toEqual(['invalidField']);
    });

    it('flags a blank ID by position', () => {
      expect(validateOne({ ...validChallenge, id: '   ' })).toEqual([
        expect.objectContaining({ subjectId: 'cards[0]', rule: 'missingField' }),
      ]);
    });

    it('flags an unknown field, naming it', () => {
      const violations = validateOne({ ...validChallenge, targetGendre: 'female' });
      expect(violations).toEqual([expect.objectContaining({ rule: 'unknownField' })]);
      expect(violations[0].message).toContain('targetGendre');
    });

    it('accepts the skill authoring notes and null optional fields', () => {
      expect(
        rulesOf({
          ...validChallenge,
          rationale: 'Kernel: total surrender to the group.',
          selfCheck: { policy: 'pass', fun: 4 },
          illustrationIdea: 'mascot with diva lips',
          targetGender: null,
          sourceLegacyId: null,
          illustration: null,
        }),
      ).toEqual([]);
    });

    it('flags a card ID that is not text by position', () => {
      expect(validateOne({ ...validChallenge, id: 42 })).toEqual([
        expect.objectContaining({ subjectId: 'cards[0]', rule: 'invalidField' }),
      ]);
    });

    it('flags points that are not a number as an invalid field', () => {
      expect(rulesOf({ ...validChallenge, points: '10' })).toEqual(['invalidField']);
    });
  });

  describe('blank and long copy', () => {
    it('flags a whitespace-only body', () => {
      expect(rulesOf({ ...validChallenge, body: ' \n\t ' })).toEqual(['missingField']);
    });

    it('flags a headline made only of invisible characters', () => {
      expect(rulesOf({ ...validChallenge, headline: '​​' })).toEqual(['missingField']);
    });

    it('flags a quip longer than 30 characters', () => {
      expect(
        rulesOf({ ...validChallenge, penalty: { drinks: 2, quip: 'x'.repeat(31) } }),
      ).toEqual(['copyLength']);
    });
  });

  describe('drinks in copy', () => {
    it.each(['Tómese 5 tragos de aguardiente', 'Si no, dos shots', 'Brinde con una copa de vino'])(
      'flags an amount to drink in the body: "%s"',
      (body) => {
        expect(rulesOf({ ...validChallenge, body })).toEqual(['drinksInCopy']);
      },
    );

    it('flags an amount to drink in the quip', () => {
      expect(rulesOf({ ...validChallenge, penalty: { drinks: 1, quip: 'y 2 tragos más' } })).toEqual(
        ['drinksInCopy'],
      );
    });

    it('allows mentioning drinks without an amount', () => {
      expect(rulesOf({ ...validChallenge, body: 'Algo de comer con cuchara (nada de trago).' })).toEqual(
        [],
      );
    });
  });

  describe('severity', () => {
    it('marks banned phrases and drinks in copy as warnings', () => {
      const violations = validateOne({
        ...validChallenge,
        body: 'Cuente un chisme o se toma 2 en fondo blanco',
      });
      expect(violations.map(({ rule, severity }) => ({ rule, severity }))).toEqual([
        { rule: 'bannedPhrase', severity: 'warning' },
        { rule: 'drinksInCopy', severity: 'warning' },
      ]);
      expect(hasErrors(violations)).toBe(false);
    });

    it('marks structural problems as errors', () => {
      const violations = validateOne({ ...validChallenge, penalty: { drinks: 4 } });
      expect(violations).toEqual([
        expect.objectContaining({ rule: 'drinksLimit', severity: 'error' }),
      ]);
      expect(hasErrors(violations)).toBe(true);
    });

    it('reports no errors for an empty list', () => {
      expect(hasErrors([])).toBe(false);
    });
  });

  describe('group cards', () => {
    it('rejects placeholders in a group card', () => {
      expect(rulesOf({ ...validGroupCard, body: '…he imitado a {player}' })).toEqual([
        'unknownPlaceholder',
      ]);
    });

    it('allows gender variants in a group card, which render neutral', () => {
      expect(
        rulesOf({ ...validGroupCard, body: '…he llegado {solo|sola|sin compañía} a una fiesta' }),
      ).toEqual([]);
    });
  });

  describe('penalty fields', () => {
    it('flags an unknown field inside the penalty', () => {
      const violations = validateOne({
        ...validChallenge,
        penalty: { drinks: 2, qiup: 'por gallina' },
      });
      expect(violations).toEqual([expect.objectContaining({ rule: 'unknownField' })]);
      expect(violations[0].message).toContain('qiup');
    });

    it('flags a blank quip', () => {
      expect(rulesOf({ ...validChallenge, penalty: { drinks: 2, quip: '   ' } })).toEqual([
        'missingField',
      ]);
    });

    it('reads the quip limit from copyLengthLimits', () => {
      const quip = 'x'.repeat(copyLengthLimits.quip + 1);
      expect(rulesOf({ ...validChallenge, penalty: { drinks: 2, quip } })).toEqual(['copyLength']);
    });
  });

  describe('wider drinks-in-copy heuristic', () => {
    it.each([
      'Si no, se toma 2',
      'Tómese tres guaros',
      'Repartan cinco cervezas',
      'Dos chupitos para el grupo',
      'Media botella para usted',
      'O 5tragos',
      'O 5 tra​gos',
      'Si no, se toman uno por la amistad',
    ])('warns about "%s"', (body) => {
      expect(rulesOf({ ...validChallenge, body })).toEqual(['drinksInCopy']);
    });

    it('does not flag a photo dare that uses a drinking verb', () => {
      expect(rulesOf({ ...validChallenge, body: 'Tómense una selfie para el recuerdo' })).toEqual(
        [],
      );
    });

    it.each(['27FBE2FA', '3333651F', 'C97749F8', 'B3352FE5', '2B0A3F96'])(
      'flags the penalty phrasing of legacy card %s',
      (legacyId) => {
        const legacyCard = legacyCorpus.cards.find((card) => card.legacyId === legacyId);
        expect(legacyCard).toBeDefined();
        expect(rulesOf({ ...validChallenge, body: legacyCard?.text })).toContain('drinksInCopy');
      },
    );
  });

  describe('rendered copy', () => {
    it('flags a banned phrase split across a gender variant', () => {
      expect(rulesOf({ ...validChallenge, body: 'O un fondo {blanco|blanco|blanco}' })).toEqual([
        'bannedPhrase',
      ]);
    });

    it('flags a placeholder unknown in every mode even when the category is unknown', () => {
      expect(
        rulesOf({ ...validChallenge, categoryId: 'sin-filtro', body: 'Llame a {jugador}' }),
      ).toEqual(['unknownCategory', 'unknownPlaceholder']);
    });

    it('does not guess the mode for {partner} when the category is unknown', () => {
      expect(
        rulesOf({ ...validChallenge, categoryId: 'sin-filtro', body: 'Mire a {partner}' }),
      ).toEqual(['unknownCategory']);
    });
  });
});
