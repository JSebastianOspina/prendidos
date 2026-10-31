import { rankPlayers } from '../ranking';
import { ana, beto, cami } from './fixtures/game-fixtures';

describe('rankPlayers', () => {
  it('orders players by score, highest first', () => {
    const ranking = rankPlayers([ana, beto, cami], { p1: 5, p2: 20, p3: -3 });
    expect(ranking.map((entry) => entry.player.name)).toEqual(['Beto', 'Ana', 'Cami']);
    expect(ranking.map((entry) => entry.position)).toEqual([1, 2, 3]);
  });

  it('gives tied players the same position and skips the next one', () => {
    const ranking = rankPlayers([ana, beto, cami], { p1: 30, p2: 30, p3: 10 });
    expect(ranking.map((entry) => entry.position)).toEqual([1, 1, 3]);
    expect(ranking.map((entry) => entry.score)).toEqual([30, 30, 10]);
  });

  it('treats a missing score as zero', () => {
    const ranking = rankPlayers([ana, beto], { p1: -1 });
    expect(ranking.map((entry) => [entry.player.id, entry.score])).toEqual([
      ['p2', 0],
      ['p1', -1],
    ]);
  });
});
