import { createLocalId, createPlayer, partnerOf } from '../players';
import { ana, beto, cami } from './fixtures/game-fixtures';

describe('players', () => {
  it('creates a trimmed player who drinks by default', () => {
    expect(createPlayer({ name: '  Ana ', gender: 'female' }, () => 'x')).toEqual({
      id: 'x',
      name: 'Ana',
      gender: 'female',
      drinks: true,
      avatarId: 'avatar-01',
    });
    expect(
      createPlayer({ name: 'Cami', gender: 'undisclosed', drinks: false }, () => 'y').drinks,
    ).toBe(false);
  });

  it('gives a new player the first avatar nobody has, unless one is given', () => {
    const taken = ['avatar-01', 'avatar-02'] as const;
    expect(createPlayer({ name: 'Vale', gender: 'female' }, () => 'v', taken).avatarId).toBe(
      'avatar-03',
    );
    expect(
      createPlayer({ name: 'Vale', gender: 'female', avatarId: 'avatar-07' }, () => 'v', taken)
        .avatarId,
    ).toBe('avatar-07');
  });

  it('finds the partner only in a pair', () => {
    expect(partnerOf([ana, beto], ana.id)).toBe(beto);
    expect(partnerOf([ana, beto, cami], ana.id)).toBeUndefined();
  });

  it('creates distinct local ids', () => {
    expect(createLocalId()).not.toBe(createLocalId());
  });
});
