import { bannedPhrases, findBannedPhrases } from '../banned-phrases';

describe('findBannedPhrases', () => {
  it.each(bannedPhrases)('finds "%s" in any case', (phrase) => {
    expect(findBannedPhrases(`Si no, ${phrase.toUpperCase()}.`)).toEqual([phrase]);
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

  it.each(['computo', 'Tengo fondos', 'Maricarmen', 'el fondo del vaso blanco'])(
    'does not flag the look-alike "%s"',
    (text) => {
      expect(findBannedPhrases(text)).toEqual([]);
    },
  );
});
