import type { Player } from '@/features/game';

import {
  changeAvatar,
  createEmptyPlayer,
  endConditionOptions,
  hasMissingName,
  isRowExpanded,
  isSameEndCondition,
  preparePlayersForMode,
  shufflePlayers,
  toggleDifficulty,
  trimPlayerNames,
} from '../setup-rules';

const ana: Player = {
  id: 'p1',
  name: 'Ana',
  gender: 'female',
  drinks: true,
  avatarId: 'avatar-01',
};
const beto: Player = {
  id: 'p2',
  name: 'Beto',
  gender: 'male',
  drinks: true,
  avatarId: 'avatar-02',
};
const cami: Player = {
  id: 'p3',
  name: 'Cami',
  gender: 'undisclosed',
  drinks: false,
  avatarId: 'avatar-03',
};

function sequentialIds(): () => string {
  let next = 0;
  return () => `new-${++next}`;
}

describe('createEmptyPlayer', () => {
  it('creates a nameless, undisclosed player who drinks', () => {
    expect(createEmptyPlayer(() => 'x')).toEqual({
      id: 'x',
      name: '',
      gender: 'undisclosed',
      drinks: true,
      avatarId: 'avatar-01',
    });
  });

  it('gives the new row the first avatar nobody has', () => {
    expect(createEmptyPlayer(() => 'x', [ana, beto]).avatarId).toBe('avatar-03');
  });
});

describe('preparePlayersForMode', () => {
  it('pads a first use with two empty rows', () => {
    const players = preparePlayersForMode([], 'friends', sequentialIds());
    expect(players.map((player) => player.id)).toEqual(['new-1', 'new-2']);
    expect(players.every((player) => player.name === '')).toBe(true);
    expect(players.map((player) => player.avatarId)).toEqual(['avatar-01', 'avatar-02']);
  });

  it('pads a single remembered player up to two', () => {
    const players = preparePlayersForMode([ana], 'friends', sequentialIds());
    expect(players.map((player) => player.id)).toEqual(['p1', 'new-1']);
    expect(players[1].avatarId).toBe('avatar-02');
  });

  it('keeps the same list when nothing changes', () => {
    const players = [ana, beto, cami];
    expect(preparePlayersForMode(players, 'friends', sequentialIds())).toBe(players);
  });

  it('keeps only the first two players in couple mode', () => {
    expect(preparePlayersForMode([ana, beto, cami], 'couple', sequentialIds())).toEqual([
      ana,
      beto,
    ]);
  });

  it('keeps only the first twelve players in friends mode', () => {
    const many = Array.from({ length: 14 }, (_, index) => ({ ...ana, id: `p${index}` }));
    expect(preparePlayersForMode(many, 'friends', sequentialIds())).toHaveLength(12);
  });
});

describe('shufflePlayers', () => {
  it('reorders the players with the injected randomness', () => {
    // random 0 always swaps with the first element: [a,b,c] -> [b,c,a]
    expect(shufflePlayers([ana, beto, cami], () => 0)).toEqual([beto, cami, ana]);
  });

  it('always shows a different order when there are at least two players', () => {
    // random near 1 keeps every element in place, so the result is rotated by one.
    expect(shufflePlayers([ana, beto, cami], () => 0.999)).toEqual([beto, cami, ana]);
    expect(shufflePlayers([ana, beto], () => 0.999)).toEqual([beto, ana]);
  });

  it('does not change the input array', () => {
    const players = [ana, beto];
    shufflePlayers(players, () => 0);
    expect(players).toEqual([ana, beto]);
  });

  it('returns a single player as is', () => {
    expect(shufflePlayers([ana], () => 0)).toEqual([ana]);
  });
});

describe('toggleDifficulty', () => {
  it('deselects a selected level', () => {
    expect(toggleDifficulty(['easy', 'medium', 'hard'], 'medium')).toEqual(['easy', 'hard']);
  });

  it('selects a level and keeps the canonical order', () => {
    expect(toggleDifficulty(['hard'], 'easy')).toEqual(['easy', 'hard']);
  });

  it('never deselects the last level', () => {
    expect(toggleDifficulty(['hard'], 'hard')).toEqual(['hard']);
  });
});

describe('player names', () => {
  it('flags blank and whitespace-only names as missing', () => {
    expect(hasMissingName({ ...ana, name: '' })).toBe(true);
    expect(hasMissingName({ ...ana, name: '   ' })).toBe(true);
    expect(hasMissingName(ana)).toBe(false);
  });

  it('trims every name', () => {
    expect(trimPlayerNames([{ ...ana, name: '  Ana ' }, beto])).toEqual([ana, beto]);
  });
});

describe('isRowExpanded', () => {
  it('always expands the first two rows', () => {
    expect(isRowExpanded(0, 'p1', undefined)).toBe(true);
    expect(isRowExpanded(1, 'p2', 'p3')).toBe(true);
  });

  it('expands a later row only when it is the chosen one', () => {
    expect(isRowExpanded(2, 'p3', undefined)).toBe(false);
    expect(isRowExpanded(2, 'p3', 'p4')).toBe(false);
    expect(isRowExpanded(2, 'p3', 'p3')).toBe(true);
  });
});

describe('changeAvatar', () => {
  it('gives the player the next avatar nobody else has', () => {
    const changed = changeAvatar([ana, beto, cami], 0);
    expect(changed[0]).toEqual({ ...ana, avatarId: 'avatar-04' });
    expect(changed.slice(1)).toEqual([beto, cami]);
  });

  it('wraps around the avatar list', () => {
    const lastAvatar: Player = { ...ana, avatarId: 'avatar-12' };
    expect(changeAvatar([lastAvatar, beto], 0)[0].avatarId).toBe('avatar-01');
  });
});

describe('end conditions', () => {
  it('offers rounds 5/10/15/20, points 100/200/300, and open', () => {
    expect(endConditionOptions).toEqual([
      { type: 'rounds', rounds: 5 },
      { type: 'rounds', rounds: 10 },
      { type: 'rounds', rounds: 15 },
      { type: 'rounds', rounds: 20 },
      { type: 'points', target: 100 },
      { type: 'points', target: 200 },
      { type: 'points', target: 300 },
      { type: 'open' },
    ]);
  });

  it('compares end conditions by value', () => {
    expect(isSameEndCondition({ type: 'rounds', rounds: 10 }, { type: 'rounds', rounds: 10 })).toBe(
      true,
    );
    expect(isSameEndCondition({ type: 'rounds', rounds: 10 }, { type: 'rounds', rounds: 5 })).toBe(
      false,
    );
    expect(
      isSameEndCondition({ type: 'points', target: 100 }, { type: 'points', target: 100 }),
    ).toBe(true);
    expect(isSameEndCondition({ type: 'open' }, { type: 'open' })).toBe(true);
    expect(isSameEndCondition({ type: 'open' }, { type: 'rounds', rounds: 10 })).toBe(false);
  });
});
