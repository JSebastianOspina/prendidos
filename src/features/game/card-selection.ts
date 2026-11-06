import {
  groupCardTypes,
  type Card,
  type Difficulty,
  type GroupCard,
  type IllustrationKey,
} from '@/features/content/card-types';
import { shownIllustrationFor } from '@/features/content/shown-illustration';

import type { GameSettings, Player } from './game-types';

/**
 * Chance that a draw after an individual card is a group interlude ("Yo nunca", "Todos los que…").
 * Group cards never follow each other, so they make up 0.25 / 1.25 = 20 % of the cards shown.
 */
export const groupCardChance = 0.25;

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
  /** Shown illustration of the card on screen; the next card prefers a different one. */
  avoidIllustration?: IllustrationKey;
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
  return card.targetGender
    ? others.filter((player) => player.gender === card.targetGender)
    : [...others];
}

function pickRandom<Item>(items: readonly Item[], random: () => number): Item | undefined {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

/** Unseen cards first; individual cards by ascending points, otherwise random order. */
function rankCandidates(
  candidates: readonly Card[],
  seen: ReadonlySet<string>,
  random: () => number,
): Card[] {
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

/** First ranked card whose shown illustration differs from `avoid`; the first one otherwise. */
function preferDifferentIllustration(ranked: readonly Card[], avoid?: IllustrationKey): Card | undefined {
  if (avoid === undefined) return ranked[0];
  return ranked.find((card) => shownIllustrationFor(card) !== avoid) ?? ranked[0];
}

/**
 * Picks the next card for the current player: no repeats within the game, unseen on the
 * device first, fewer points first, about one group interlude in five, gender targeting,
 * a pool reset when the level runs out, and no illustration twice in a row when avoidable.
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
    card = preferDifferentIllustration(rankCandidates(unplayedGroupCards, seen, random), request.avoidIllustration);
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
    card = preferDifferentIllustration(rankCandidates(candidates, seen, random), request.avoidIllustration);
  }

  if (!card) return undefined;

  const mentionedPlayer = isGroupCard(card)
    ? undefined
    : pickRandom(mentionablePlayers(card, others), random);
  return {
    card,
    playedCardIds: [...playedCardIds, card.id],
    mentionedPlayerId: mentionedPlayer?.id,
  };
}
