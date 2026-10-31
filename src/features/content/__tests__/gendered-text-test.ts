import {
  longestRenderedLength,
  parseGenderedText,
  renderGenderedText,
} from '../gendered-text';

describe('parseGenderedText', () => {
  it('returns plain text as a single text segment with no issues', () => {
    expect(parseGenderedText('Báilese la canción')).toEqual({
      segments: [{ kind: 'text', value: 'Báilese la canción' }],
      issues: [],
    });
  });

  it('parses the {player} and {partner} placeholders', () => {
    const parsed = parseGenderedText('{player} le canta a {partner}');
    expect(parsed.issues).toEqual([]);
    expect(parsed.segments).toEqual([
      { kind: 'placeholder', name: 'player' },
      { kind: 'text', value: ' le canta a ' },
      { kind: 'placeholder', name: 'partner' },
    ]);
  });

  it('reports any other single-word token as a placeholder name for the caller to check', () => {
    expect(parseGenderedText('Llame a {jugador}').segments).toContainEqual({
      kind: 'placeholder',
      name: 'jugador',
    });
  });

  it('parses a three-option gender variant', () => {
    const parsed = parseGenderedText('Llegó {el divo|la diva|la estrella}');
    expect(parsed.issues).toEqual([]);
    expect(parsed.segments).toContainEqual({
      kind: 'variant',
      options: ['el divo', 'la diva', 'la estrella'],
    });
  });

  it('flags a two-option variant as malformed', () => {
    expect(parseGenderedText('Muy {tímido|tímida}').issues).toEqual([
      { kind: 'malformedVariant', token: '{tímido|tímida}' },
    ]);
  });

  it('flags a variant with an empty option as malformed', () => {
    expect(parseGenderedText('Muy {tímido||tímide}').issues).toEqual([
      { kind: 'malformedVariant', token: '{tímido||tímide}' },
    ]);
  });

  it('flags tokens that are neither placeholders nor variants', () => {
    expect(parseGenderedText('Hola {} y {dos palabras}').issues).toEqual([
      { kind: 'unknownToken', token: '{}' },
      { kind: 'unknownToken', token: '{dos palabras}' },
    ]);
  });

  it('flags braces that are not closed or opened', () => {
    expect(parseGenderedText('Abra la {jeta').issues).toEqual([
      { kind: 'unbalancedBrace', token: '{' },
    ]);
    expect(parseGenderedText('Cierre} ya').issues).toEqual([
      { kind: 'unbalancedBrace', token: '}' },
    ]);
  });
});

describe('renderGenderedText', () => {
  const text = 'Llegó {el divo|la diva|la estrella}: {player} manda';
  const placeholders = { player: 'Vale' };

  it('renders the masculine option for male players', () => {
    expect(renderGenderedText(text, 'male', placeholders)).toBe('Llegó el divo: Vale manda');
  });

  it('renders the feminine option for female players', () => {
    expect(renderGenderedText(text, 'female', placeholders)).toBe('Llegó la diva: Vale manda');
  });

  it('renders the neutral option for undisclosed players', () => {
    expect(renderGenderedText(text, 'undisclosed', placeholders)).toBe(
      'Llegó la estrella: Vale manda',
    );
  });

  it('leaves a placeholder token in place when no value is given', () => {
    expect(renderGenderedText('Hola {player}', 'male', {})).toBe('Hola {player}');
  });
});

describe('longestRenderedLength', () => {
  it('measures the longest gender rendering', () => {
    expect(longestRenderedLength('Llegó {el divo|la diva|la estrella}')).toBe(
      'Llegó la estrella'.length,
    );
  });

  it('counts each placeholder as 12 characters', () => {
    expect(longestRenderedLength('Hola {player}')).toBe('Hola '.length + 12);
  });
});
