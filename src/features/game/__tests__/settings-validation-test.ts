import { validateSettings } from '../settings-validation';
import { ana, beto, cami, friendsSettings, testCategories } from './fixtures/game-fixtures';

describe('validateSettings', () => {
  it('accepts a valid friends setup', () => {
    expect(validateSettings(friendsSettings(), testCategories)).toEqual([]);
  });

  it('requires 2 to 12 players in friends mode', () => {
    expect(validateSettings(friendsSettings({ players: [ana] }), testCategories)).toContain('playerCount');
    const thirteen = Array.from({ length: 13 }, (_, index) => ({ ...ana, id: `p${index}` }));
    expect(validateSettings(friendsSettings({ players: thirteen }), testCategories)).toContain('playerCount');
  });

  it('requires exactly 2 players in couple mode', () => {
    const couple = friendsSettings({ mode: 'couple', categoryId: 'entre-dos', players: [ana, beto, cami] });
    expect(validateSettings(couple, testCategories)).toEqual(['playerCount']);
    expect(validateSettings({ ...couple, players: [ana, beto] }, testCategories)).toEqual([]);
  });

  it('rejects an empty level selection, a category of another mode, blank names, and duplicate ids', () => {
    const errors = validateSettings(
      friendsSettings({
        selectedDifficulties: [],
        categoryId: 'entre-dos',
        players: [ana, { ...ana, name: '  ' }],
      }),
      testCategories,
    );
    expect(errors).toEqual(['selectedDifficulties', 'category', 'playerName', 'playerId']);
  });

  it('rejects an unknown category', () => {
    expect(validateSettings(friendsSettings({ categoryId: 'nope' }), testCategories)).toEqual(['category']);
  });
});
