import { createLocalId, createPlayer, partnerOf } from '../players';
import { ana, beto, cami } from './fixtures/game-fixtures';

describe('players', () => {
  it('creates a trimmed player who drinks by default', () => {
    expect(createPlayer({ name: '  Ana ', gender: 'female' }, () => 'x')).toEqual({
      id: 'x',
      name: 'Ana',
      gender: 'female',
      drinks: true,
    });
    expect(createPlayer({ name: 'Cami', gender: 'undisclosed', drinks: false }, () => 'y').drinks).toBe(false);
  });

  it('finds the partner only in a pair', () => {
    expect(partnerOf([ana, beto], ana.id)).toBe(beto);
    expect(partnerOf([ana, beto, cami], ana.id)).toBeUndefined();
  });

  it('creates distinct local ids', () => {
    expect(createLocalId()).not.toBe(createLocalId());
  });
});
