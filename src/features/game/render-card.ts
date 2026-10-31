import { renderGenderedText } from '@/features/content/gendered-text';
import type { Card } from '@/features/content/card-types';

import { isGroupCard } from './card-selection';
import type { Player, RenderedCard } from './game-types';

export type CardAudience = {
  currentPlayer: Player;
  /** Fills `{player}`: another player picked for the card. */
  mentionedPlayer?: Player;
  /** Fills `{partner}` in couple mode. */
  partner?: Player;
};

/** Spanish copy for the card: agrees with the current player; group cards read neutral. */
export function renderCard(card: Card, audience: CardAudience): RenderedCard {
  if (isGroupCard(card)) {
    const render = (text: string) => renderGenderedText(text, 'undisclosed', {});
    return {
      card,
      headline: card.headline === undefined ? undefined : render(card.headline),
      body: render(card.body),
    };
  }

  const placeholderValues: Record<string, string> = {};
  if (audience.mentionedPlayer) placeholderValues.player = audience.mentionedPlayer.name;
  if (audience.partner) placeholderValues.partner = audience.partner.name;
  const render = (text: string) =>
    renderGenderedText(text, audience.currentPlayer.gender, placeholderValues);

  return {
    card,
    headline: render(card.headline),
    body: render(card.body),
    penaltyQuip: card.penalty.quip === undefined ? undefined : render(card.penalty.quip),
  };
}
