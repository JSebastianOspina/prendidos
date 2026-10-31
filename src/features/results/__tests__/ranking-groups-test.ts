import type { Player, RankingEntry } from '@/features/game';

import { groupRankingByPosition } from '../ranking-groups';

function player(id: string, name: string): Player {
  return { id, name, gender: 'undisclosed', drinks: true };
}

const ana = player('p1', 'Ana');
const luis = player('p2', 'Luis');
const beto = player('p3', 'Beto');

describe('groupRankingByPosition', () => {
  it('returns no groups for an empty ranking', () => {
    expect(groupRankingByPosition([])).toEqual([]);
  });

  it('keeps one group per player when nobody is tied', () => {
    const ranking: RankingEntry[] = [
      { player: ana, score: 12, position: 1 },
      { player: beto, score: 7, position: 2 },
    ];
    expect(groupRankingByPosition(ranking)).toEqual([
      { position: 1, score: 12, players: [ana] },
      { position: 2, score: 7, players: [beto] },
    ]);
  });

  it('puts tied players in one group that keeps the shared position', () => {
    const ranking: RankingEntry[] = [
      { player: ana, score: 10, position: 1 },
      { player: luis, score: 10, position: 1 },
      { player: beto, score: -3, position: 3 },
    ];
    expect(groupRankingByPosition(ranking)).toEqual([
      { position: 1, score: 10, players: [ana, luis] },
      { position: 3, score: -3, players: [beto] },
    ]);
  });

  it('groups a tie in the middle of the ranking', () => {
    const ranking: RankingEntry[] = [
      { player: ana, score: 9, position: 1 },
      { player: luis, score: 4, position: 2 },
      { player: beto, score: 4, position: 2 },
    ];
    expect(groupRankingByPosition(ranking).map((group) => group.players)).toEqual([
      [ana],
      [luis, beto],
    ]);
  });
});
