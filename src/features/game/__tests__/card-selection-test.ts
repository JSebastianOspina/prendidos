import { drawCard, groupCardChance, type DrawRequest } from '../card-selection';
import {
  ana,
  beto,
  cami,
  friendsSettings,
  groupCard,
  individualCard,
  sequenceRandom,
} from './fixtures/game-fixtures';

function request(overrides: Partial<DrawRequest>): DrawRequest {
  return {
    cards: [],
    settings: friendsSettings(),
    currentPlayerId: ana.id,
    difficulty: 'easy',
    playedCardIds: [],
    seenCardIds: [],
    previousCardWasGroup: false,
    random: () => 0.99,
    ...overrides,
  };
}

describe('drawCard', () => {
  it('returns undefined when the category has no playable card', () => {
    expect(drawCard(request({ cards: [individualCard('x', { categoryId: 'entre-dos' })] }))).toBeUndefined();
  });

  it('takes individual cards of the current level from fewer to more points', () => {
    const cards = [
      individualCard('e9', { points: 9 }),
      individualCard('e2', { points: 2 }),
      individualCard('m12', { difficulty: 'medium', points: 12 }),
    ];
    expect(drawCard(request({ cards }))?.card.id).toBe('e2');
    expect(drawCard(request({ cards, playedCardIds: ['e2'] }))?.card.id).toBe('e9');
    expect(drawCard(request({ cards, difficulty: 'medium' }))?.card.id).toBe('m12');
  });

  it('never repeats a card played in this game and keeps the played list', () => {
    const cards = [individualCard('a', { points: 1 }), individualCard('b', { points: 2 })];
    const result = drawCard(request({ cards, playedCardIds: ['a'] }));
    expect(result?.card.id).toBe('b');
    expect(result?.playedCardIds).toEqual(['a', 'b']);
  });

  it('prefers cards never seen on this device', () => {
    const cards = [individualCard('seen', { points: 2 }), individualCard('fresh', { points: 5 })];
    expect(drawCard(request({ cards, seenCardIds: ['seen'] }))?.card.id).toBe('fresh');
  });

  it('resets the level pool when every individual card of the level was played', () => {
    const cards = [
      individualCard('a', { points: 1 }),
      individualCard('b', { points: 2 }),
      individualCard('m', { difficulty: 'medium', points: 15 }),
    ];
    const result = drawCard(request({ cards, playedCardIds: ['m', 'a', 'b'] }));
    expect(result?.card.id).toBe('a');
    expect(result?.playedCardIds).toEqual(['m', 'a']);
  });

  it('keeps excluded cards out even after a reset', () => {
    const cards = [individualCard('a', { points: 1 }), individualCard('b', { points: 2 })];
    const result = drawCard(request({ cards, playedCardIds: ['a', 'b'], excludedCardIds: ['a'] }));
    expect(result?.card.id).toBe('b');
  });

  it('falls back to another level when the current level has no individual card', () => {
    const cards = [individualCard('m', { difficulty: 'medium', points: 15 })];
    expect(drawCard(request({ cards, difficulty: 'hard' }))?.card.id).toBe('m');
  });

  it('skips spicy cards unless Sin Filtro is enabled', () => {
    const cards = [individualCard('spicy', { heat: 'spicy', points: 1 }), individualCard('std', { points: 4 })];
    expect(drawCard(request({ cards }))?.card.id).toBe('std');
    expect(drawCard(request({ cards, settings: friendsSettings({ spicyEnabled: true }) }))?.card.id).toBe('spicy');
  });

  describe('group interludes', () => {
    const cards = [individualCard('i'), groupCard('g1'), groupCard('g2', { difficulty: 'medium' })];

    it('draws a group card when the roll is under the group chance', () => {
      const result = drawCard(request({ cards, random: () => groupCardChance - 0.01 }));
      expect(result?.card.id).toBe('g1');
      expect(result?.mentionedPlayerId).toBeUndefined();
    });

    it('draws an individual card when the roll is at or above the group chance', () => {
      expect(drawCard(request({ cards, random: () => groupCardChance }))?.card.id).toBe('i');
    });

    it('never shows two group cards in a row', () => {
      expect(drawCard(request({ cards, random: () => 0, previousCardWasGroup: true }))?.card.id).toBe('i');
    });

    it('does not draw a group card when excluded or when none is left at the level', () => {
      expect(drawCard(request({ cards, random: () => 0, excludeGroupCards: true }))?.card.id).toBe('i');
      expect(drawCard(request({ cards, random: () => 0, playedCardIds: ['g1'] }))?.card.id).toBe('i');
    });

    it('orders unseen group cards at random', () => {
      const groups = [groupCard('g1'), groupCard('g3'), individualCard('i')];
      const ids = [0.9, 0.1].map(
        (tieBreaker) => drawCard(request({ cards: groups, random: sequenceRandom([0, tieBreaker, 0.5]) }))?.card.id,
      );
      expect(new Set(ids).size).toBe(2);
    });

    it('prefers unseen group cards', () => {
      const groups = [groupCard('g1'), groupCard('g3'), individualCard('i')];
      expect(drawCard(request({ cards: groups, random: () => 0, seenCardIds: ['g1'] }))?.card.id).toBe('g3');
    });
  });

  describe('players mentioned on the card', () => {
    it('picks another player for {player}', () => {
      const result = drawCard(request({ cards: [individualCard('i')], random: () => 0.99 }));
      expect(result?.mentionedPlayerId).toBe(cami.id);
    });

    it('returns no mentioned player when nobody else plays', () => {
      const solo = friendsSettings({ players: [ana] });
      expect(drawCard(request({ cards: [individualCard('i')], settings: solo }))?.mentionedPlayerId).toBeUndefined();
    });

    it('only draws a gender-targeted card when another player of that gender exists', () => {
      const cards = [
        individualCard('to-female', { targetGender: 'female', points: 1 }),
        individualCard('plain', { points: 6 }),
      ];
      expect(drawCard(request({ cards, currentPlayerId: ana.id }))?.card.id).toBe('plain');

      const result = drawCard(request({ cards, currentPlayerId: beto.id }));
      expect(result?.card.id).toBe('to-female');
      expect(result?.mentionedPlayerId).toBe(ana.id);
    });

    it('never picks an undisclosed player for a targeted card', () => {
      const cards = [individualCard('to-male', { targetGender: 'male', points: 1 })];
      const result = drawCard(request({ cards, currentPlayerId: ana.id, random: () => 0.99 }));
      expect(result?.mentionedPlayerId).toBe(beto.id);
    });
  });
});
