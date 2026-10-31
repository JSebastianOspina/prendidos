import { groupCardTypes, type Card, type Difficulty, type GroupCard } from '@/features/content/card-types';

import type { GameSettings, Player } from './game-types';

/** Share of draws that are group interludes ("Yo nunca", "Todos los que…"). */
export const groupCardChance = 0.2;

export type DrawRequest = {
  cards: readonly Card[];
  settings: GameSettings;
  currentPlayerId: string;
  difficulty: Difficulty;
  playedCardIds: readonly string[];
  /** Cards shown on this device in previous games. */
  seenCardIds: readonly string[];
  previousCardWasGroup: boolean;
  /** Swaps only draw individual cards. */
  excludeGroupCards?: boolean;
  /** Never drawn, even after a pool reset (the card being swapped). */
  excludedCardIds?: readonly string[];
  random: () => number;
};

export type DrawResult = {
  card: Card;
  playedCardIds: string[];
  mentionedPlayerId?: string;
};

export function isGroupCard(card: Card): card is GroupCard {
  return groupCardTypes.includes(card.type as (typeof groupCardTypes)[number]);
}

function otherPlayers(settings: GameSettings, currentPlayerId: string): Player[] {
  return settings.players.filter((player) => player.id !== currentPlayerId);
}

function mentionablePlayers(card: Card, others: readonly Player[]): Player[] {
  return card.targetGender ? others.filter((player) => player.gender === card.targetGender) : [...others];
}

function pickRandom<Item>(items: readonly Item[], random: () => number): Item | undefined {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

/** Unseen cards first; individual cards by ascending points, otherwise random order. */
function rankCandidates(candidates: readonly Card[], seen: ReadonlySet<string>, random: () => number): Card[] {
  const shuffled = candidates
    .map((card) => ({ card, tieBreaker: random() }))
    .sort((first, second) => first.tieBreaker - second.tieBreaker)
    .map(({ card }) => card);

  return shuffled.sort((first, second) => {
    const seenOrder = Number(seen.has(first.id)) - Number(seen.has(second.id));
    if (seenOrder !== 0) return seenOrder;
    return (first.points ?? 0) - (second.points ?? 0);
  });
}

/**
 * Picks the next card for the current player: no repeats within the game, unseen on the
 * device first, fewer points first, about one group interlude in five, gender targeting,
 * and a pool reset when the level runs out.
 */
export function drawCard(request: DrawRequest): DrawResult | undefined {
  const { settings, random } = request;
  const others = otherPlayers(settings, request.currentPlayerId);
  const excluded = new Set(request.excludedCardIds ?? []);
  const seen = new Set(request.seenCardIds);

  const isEligible = (card: Card) =>
    !card.targetGender || mentionablePlayers(card, others).length > 0;
  const playable = request.cards.filter(
    (card) =>
      card.categoryId === settings.categoryId &&
      (card.heat === 'standard' || settings.spicyEnabled) &&
      !excluded.has(card.id) &&
      isEligible(card),
  );
  const atLevel = playable.filter((card) => card.difficulty === request.difficulty);

  let playedCardIds = [...request.playedCardIds];
  const isUnplayed = (card: Card) => !playedCardIds.includes(card.id);

  const unplayedGroupCards = atLevel.filter((card) => isGroupCard(card) && isUnplayed(card));
  const wantsGroupCard =
    !request.excludeGroupCards &&
    !request.previousCardWasGroup &&
    unplayedGroupCards.length > 0 &&
    random() < groupCardChance;

  let card: Card | undefined;
  if (wantsGroupCard) {
    card = rankCandidates(unplayedGroupCards, seen, random)[0];
  } else {
    const individualAtLevel = atLevel.filter((candidate) => !isGroupCard(candidate));
    let candidates = individualAtLevel.filter(isUnplayed);
    if (candidates.length === 0 && individualAtLevel.length > 0) {
      const levelIds = new Set(individualAtLevel.map((candidate) => candidate.id));
      playedCardIds = playedCardIds.filter((id) => !levelIds.has(id));
      candidates = individualAtLevel;
    }
    if (candidates.length === 0) {
      const individualAnyLevel = playable.filter((candidate) => !isGroupCard(candidate));
      const unplayedAnyLevel = individualAnyLevel.filter(isUnplayed);
      candidates = unplayedAnyLevel.length > 0 ? unplayedAnyLevel : individualAnyLevel;
    }
    card = rankCandidates(candidates, seen, random)[0];
  }

  if (!card) return undefined;

  const mentionedPlayer = isGroupCard(card) ? undefined : pickRandom(mentionablePlayers(card, others), random);
  return {
    card,
    playedCardIds: [...playedCardIds, card.id],
    mentionedPlayerId: mentionedPlayer?.id,
  };
}
