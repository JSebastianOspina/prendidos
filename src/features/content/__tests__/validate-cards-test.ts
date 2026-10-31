import { validateCards, type CardInput } from '../validate-cards';
import {
  validCards,
  validCategories,
  validChallenge,
  validGroupCard,
  validTruth,
} from './fixtures/valid-catalog';

function validateOne(card: CardInput) {
  return validateCards({ categories: validCategories, cards: [card] });
}

function rulesOf(card: CardInput) {
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
        expect.arrayContaining(['pointsRange', 'drinksLimit', 'invalidField', 'missingField']),
      );
    });

    it('reports a card that is not an object', () => {
      expect(rulesOf('not a card' as unknown as CardInput)).toEqual(['invalidField']);
    });
  });
});
