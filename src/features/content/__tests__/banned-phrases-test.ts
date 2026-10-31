import legacyCorpus from '../../../../docs/content/legacy/legacy-challenges.json';
import { bannedPhrases, findBannedPhrases } from '../banned-phrases';

/** Every slur form that appears in the 2023 legacy deck. */
const legacySlurForms = [
  'puss*',
  'puss*s',
  'hpt*',
  'mk!',
  'mka',
  'Mkaaa',
  'gilipollas',
  'pelotudo!',
  'morrongo!',
  'puto!',
];

describe('legacy corpus regression', () => {
  const legacyText = legacyCorpus.cards.map((card) => card.text).join('\n');

  it.each(legacySlurForms)('finds the legacy form "%s"', (form) => {
    expect(legacyText).toContain(form);
    expect(findBannedPhrases(form)).toHaveLength(1);
  });
});

describe('findBannedPhrases', () => {
  it.each(bannedPhrases)('finds "%s" in any case', (phrase) => {
    // Overlapping entries ("hijo de puta" also contains "puta") report every match.
    expect(findBannedPhrases(`Si no, ${phrase.toUpperCase()}.`)).toContain(phrase);
  });

  it('ignores accents and extra spaces', () => {
    expect(findBannedPhrases('o se toma un fóndo   blancó')).toEqual(['fondo blanco']);
  });

  it('finds censored legacy slurs', () => {
    expect(findBannedPhrases('se toma 2 por puss*')).toEqual(['puss']);
  });

  it('reports each banned phrase once, in list order', () => {
    expect(findBannedPhrases('puto y fondo blanco, puto')).toEqual(['fondo blanco', 'puto']);
  });

  it.each([
    ['putos', 'puto'],
    ['maricas', 'marica'],
    ['Mkaaa', 'mka'],
    ['pussy', 'pussy'],
    ['sapo hpt*', 'hpt'],
    ['por mk!', 'mk'],
  ])('finds the plural, elongated, or censored form "%s"', (text, phrase) => {
    expect(findBannedPhrases(text)).toEqual([phrase]);
  });

  it.each([
    ['puta', 'puta'],
    ['putas', 'puta'],
    ['pelotuda', 'pelotuda'],
    ['maricón', 'maricon'],
    ['maricones', 'maricon'],
    ['hpta', 'hpta'],
    ['hijueputa', 'hijueputa'],
    ['hijo de puta', 'hijo de puta'],
  ])('finds the feminine or Colombian form "%s"', (text, phrase) => {
    expect(findBannedPhrases(text)).toContain(phrase);
  });

  describe('documented limits', () => {
    it('does not catch letters repeated in the middle of a word', () => {
      expect(findBannedPhrases('puuuto')).toEqual([]);
    });

    it('flags "MK" even outside a slur, which a reviewer clears', () => {
      expect(findBannedPhrases('Juegue Mortal Kombat, el MK de siempre')).toEqual(['mk']);
    });
  });

  it.each(['fondo-blanco', 'fondo_blanco', 'fondo.blanco', 'fondoblanco', 'hasta-el-fondo'])(
    'finds phrases joined by separators or no space: "%s"',
    (text) => {
      expect(findBannedPhrases(text)).toHaveLength(1);
    },
  );

  it('finds phrases written with full-width letters', () => {
    expect(findBannedPhrases('ＦＯＮＤＯ ＢＬＡＮＣＯ')).toEqual(['fondo blanco']);
  });

  it('finds phrases hidden with zero-width or soft-hyphen characters', () => {
    expect(findBannedPhrases('fondo​ blanco')).toEqual(['fondo blanco']);
    expect(findBannedPhrases('pu­to')).toEqual(['puto']);
  });

  it.each(['computo', 'Tengo fondos', 'Maricarmen', 'el fondo del vaso blanco', 'mkt'])(
    'does not flag the look-alike "%s"',
    (text) => {
      expect(findBannedPhrases(text)).toEqual([]);
    },
  );
});
