import type { Player, RankingEntry } from '@/features/game';

import { layoutRanking } from '../ranking-layout';

function player(name: string): Player {
  return {
    id: name.toLowerCase(),
    name,
    gender: 'undisclosed',
    drinks: true,
    avatarId: 'avatar-01',
  };
}

function entry(name: string, score: number, position: number): RankingEntry {
  return { player: player(name), score, position };
}

const namesOf = (entries: RankingEntry[]) => entries.map((item) => item.player.name);

describe('layoutRanking', () => {
  it('returns an empty layout for an empty ranking', () => {
    expect(layoutRanking([])).toEqual({ winners: [], podium: [], rows: [] });
  });

  it('centers a sole winner between second and third and lists the rest as rows', () => {
    const layout = layoutRanking([
      entry('Vale', 142, 1),
      entry('Juanpa', 118, 2),
      entry('Mafe', 96, 3),
      entry('Andres', 40, 4),
      entry('Caro', -3, 5),
    ]);
    expect(namesOf(layout.winners)).toEqual(['Vale']);
    expect(namesOf(layout.podium)).toEqual(['Juanpa', 'Vale', 'Mafe']);
    expect(namesOf(layout.rows)).toEqual(['Andres', 'Caro']);
  });

  it('puts second place left of the winner in a two-player game', () => {
    const layout = layoutRanking([entry('Ana', 12, 1), entry('Beto', 7, 2)]);
    expect(namesOf(layout.podium)).toEqual(['Beto', 'Ana']);
    expect(layout.rows).toEqual([]);
  });

  it('keeps ranking order on the podium when first place is shared', () => {
    const layout = layoutRanking([
      entry('Vale', 130, 1),
      entry('Juanpa', 130, 1),
      entry('Mafe', 96, 3),
      entry('Caro', -3, 4),
    ]);
    expect(namesOf(layout.winners)).toEqual(['Vale', 'Juanpa']);
    expect(namesOf(layout.podium)).toEqual(['Vale', 'Juanpa', 'Mafe']);
    expect(layout.rows.map((row) => row.position)).toEqual([4]);
  });

  it('keeps the shared position on rows when a tie spills past the podium', () => {
    const layout = layoutRanking([
      entry('Ana', 9, 1),
      entry('Beto', 4, 2),
      entry('Cami', 4, 2),
      entry('Dani', 4, 2),
    ]);
    expect(namesOf(layout.podium)).toEqual(['Beto', 'Ana', 'Cami']);
    expect(layout.rows.map((row) => [row.player.name, row.position])).toEqual([['Dani', 2]]);
  });

  it('shows a single player alone on the podium', () => {
    expect(namesOf(layoutRanking([entry('Ana', 3, 1)]).podium)).toEqual(['Ana']);
  });
});
