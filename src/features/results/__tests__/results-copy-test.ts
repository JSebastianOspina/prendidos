import {
  formatPoints,
  joinPlayerNames,
  rankingEntryAccessibilityLabel,
  rankingEyebrow,
  sharedFirstPlaceLine,
  spokenPoints,
  winnerTitle,
} from '../results-copy';

describe('formatPoints', () => {
  it.each([
    [12, '12 pts'],
    [1, '1 pt'],
    [0, '0 pts'],
    [-1, '-1 pt'],
    [-3, '-3 pts'],
  ])('formats %d as "%s"', (score, expected) => {
    expect(formatPoints(score)).toBe(expected);
  });
});

describe('spokenPoints', () => {
  it('spells the unit out for screen readers', () => {
    expect(spokenPoints(12)).toBe('12 puntos');
    expect(spokenPoints(1)).toBe('1 punto');
    expect(spokenPoints(-3)).toBe('menos 3 puntos');
  });
});

describe('rankingEntryAccessibilityLabel', () => {
  it('describes a podium step or row with position, full name, and score', () => {
    expect(rankingEntryAccessibilityLabel(1, 'Maximiliano Andrés', 12)).toBe(
      'Puesto 1: Maximiliano Andrés, 12 puntos',
    );
    expect(rankingEntryAccessibilityLabel(5, 'Caro', -3)).toBe('Puesto 5: Caro, menos 3 puntos');
  });
});

describe('rankingEyebrow', () => {
  it('names the category and the rounds of a rounds game', () => {
    expect(
      rankingEyebrow({
        categoryName: 'La Previa',
        endCondition: { type: 'rounds', rounds: 10 },
        roundsPlayed: 10,
      }),
    ).toBe('La Previa · 10 rondas');
  });

  it('uses the singular for one round of an open game', () => {
    expect(
      rankingEyebrow({ categoryName: 'La Previa', endCondition: { type: 'open' }, roundsPlayed: 1 }),
    ).toBe('La Previa · 1 ronda');
  });

  it('names the target of a points game', () => {
    expect(
      rankingEyebrow({
        categoryName: 'Entre Dos',
        endCondition: { type: 'points', target: 100 },
        roundsPlayed: 4,
      }),
    ).toBe('Entre Dos · Meta 100 pts');
  });

  it('shows only the game length when the category is unknown', () => {
    expect(
      rankingEyebrow({ endCondition: { type: 'rounds', rounds: 5 }, roundsPlayed: 5 }),
    ).toBe('5 rondas');
  });
});

describe('winnerTitle and sharedFirstPlaceLine', () => {
  it('names a single winner', () => {
    expect(winnerTitle(['Vale'])).toBe('¡Ganó Vale!');
  });

  it('announces a tie for first and names everyone who shares it', () => {
    expect(winnerTitle(['Vale', 'Juanpa'])).toBe('¡Empate arriba!');
    expect(sharedFirstPlaceLine(['Vale', 'Juanpa'])).toBe(
      'Vale y Juanpa comparten el primer puesto.',
    );
    expect(sharedFirstPlaceLine(['Ana', 'Beto', 'Isabel'])).toBe(
      'Ana, Beto e Isabel comparten el primer puesto.',
    );
  });
});

describe('joinPlayerNames', () => {
  it('returns an empty string for no names', () => {
    expect(joinPlayerNames([])).toBe('');
  });

  it('returns a single name as is', () => {
    expect(joinPlayerNames(['Ana'])).toBe('Ana');
  });

  it('joins two names with "y"', () => {
    expect(joinPlayerNames(['Ana', 'Luis'])).toBe('Ana y Luis');
  });

  it('joins three or more names with commas and a final "y"', () => {
    expect(joinPlayerNames(['Ana', 'Beto', 'Luis'])).toBe('Ana, Beto y Luis');
  });

  it.each([
    ['Isabel', 'Ana e Isabel'],
    ['Íngrid', 'Ana e Íngrid'],
    ['Hilda', 'Ana e Hilda'],
    ['hilario', 'Ana e hilario'],
  ])('uses "e" before a name that starts with an /i/ sound (%s)', (lastName, expected) => {
    expect(joinPlayerNames(['Ana', lastName])).toBe(expected);
  });

  it.each([
    ['Hiedra', 'Ana y Hiedra'],
    ['Iara', 'Ana y Iara'],
    ['Yesid', 'Ana y Yesid'],
  ])('keeps "y" when the /i/ starts a diphthong or is a consonant (%s)', (lastName, expected) => {
    expect(joinPlayerNames(['Ana', lastName])).toBe(expected);
  });
});
