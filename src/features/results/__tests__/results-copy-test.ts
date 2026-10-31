import {
  formatPoints,
  joinPlayerNames,
  rankingRowAccessibilityLabel,
  spokenPoints,
  winnerAccessibilityLabel,
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

describe('accessibility labels', () => {
  it('describes a ranking row with position, names, and score', () => {
    expect(rankingRowAccessibilityLabel(1, ['Ana', 'Luis'], 10)).toBe(
      'Puesto 1: Ana y Luis, 10 puntos',
    );
  });

  it('describes a single winner and a tie for first', () => {
    expect(winnerAccessibilityLabel(['Ana'], 12)).toBe('Ganó Ana con 12 puntos');
    expect(winnerAccessibilityLabel(['Ana', 'Luis'], 10)).toBe(
      'Empate en el primer puesto: Ana y Luis con 10 puntos',
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
