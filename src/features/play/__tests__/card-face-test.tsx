import { render, screen } from '@testing-library/react-native';

import type { Card } from '@/features/content/card-types';
import type { RenderedCard } from '@/features/game';
import { ana, groupCard, individualCard } from '@/features/game/__tests__/fixtures/game-fixtures';

import { CardFace } from '../card-face';
import { playCopy } from '../copy';

function copyFor(card: Card, overrides: Partial<RenderedCard> = {}): RenderedCard {
  return { card, headline: 'Hola campeona', body: 'Abrace a Beto.', ...overrides };
}

describe('CardFace', () => {
  it('shows a Reto with the player, its chips, copy and penalty footer', async () => {
    const card = individualCard('r1', { points: 5 });
    await render(
      <CardFace card={card} copy={copyFor(card, { penaltyQuip: 'por floja' })} player={ana} />,
    );

    expect(screen.getByText(playCopy.turnOf)).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByLabelText('Avatar de Ana')).toBeTruthy();
    expect(screen.getByText(playCopy.challengeTag)).toBeTruthy();
    expect(screen.getByText(playCopy.challengeHint)).toBeTruthy();
    expect(screen.queryByText(playCopy.truthTag)).toBeNull();
    expect(screen.getByText('5 pts')).toBeTruthy();
    expect(screen.getByText('Hola campeona')).toBeTruthy();
    expect(screen.getByText('Abrace a Beto.')).toBeTruthy();
    expect(screen.getByText(playCopy.ifRefused)).toBeTruthy();
    expect(screen.getByText('Toma 1 trago — por floja')).toBeTruthy();
    expect(screen.getByLabelText('Nivel Suave')).toBeTruthy();
  });

  it('shows a Verdad as a question to answer', async () => {
    const card = individualCard('v1', {
      type: 'truth',
      difficulty: 'hard',
      points: 25,
      penalty: { drinks: 3 },
    });
    await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

    expect(screen.getByText(playCopy.truthTag)).toBeTruthy();
    expect(screen.getByText(playCopy.truthHint)).toBeTruthy();
    expect(screen.queryByText(playCopy.challengeTag)).toBeNull();
    expect(screen.getByText('Toma 3 tragos')).toBeTruthy();
    expect(screen.getByLabelText('Nivel Prendido')).toBeTruthy();
  });

  it('shows the drink penalty to players who do not drink until HU-11', async () => {
    const card = individualCard('d1', { penalty: { drinks: 2 } });
    await render(<CardFace card={card} copy={copyFor(card)} player={{ ...ana, drinks: false }} />);
    expect(screen.getByText('Toma 2 tragos')).toBeTruthy();
  });

  it('leaves the headline out when the card has none', async () => {
    const card = individualCard('n1');
    await render(
      <CardFace card={card} copy={copyFor(card, { headline: undefined })} player={ana} />,
    );

    expect(screen.queryByText('Hola campeona')).toBeNull();
    expect(screen.getByText('Abrace a Beto.')).toBeTruthy();
  });

  it('shows the consent and outside-contact notes only when the card is flagged', async () => {
    const plain = individualCard('p1');
    const view = await render(<CardFace card={plain} copy={copyFor(plain)} player={ana} />);
    expect(screen.queryByText(playCopy.consentNote)).toBeNull();
    expect(screen.queryByText(playCopy.outsideNote)).toBeNull();

    const flagged = individualCard('f1', { requiresConsent: true, reachesOutside: true });
    await view.rerender(<CardFace card={flagged} copy={copyFor(flagged)} player={ana} />);
    expect(screen.getByText(playCopy.consentNote)).toBeTruthy();
    expect(screen.getByText(playCopy.outsideNote)).toBeTruthy();
  });

  it('shows a group card for everyone with its rule box, without points or penalty', async () => {
    const card = groupCard('g1');
    await render(
      <CardFace
        card={card}
        copy={{ card, headline: undefined, body: '…he bailado solo.' }}
        player={ana}
      />,
    );

    expect(screen.getByText(playCopy.everyoneChip)).toBeTruthy();
    expect(screen.getByLabelText(playCopy.forTheGroup)).toBeTruthy();
    expect(screen.getByText(playCopy.groupHeadlines.neverHaveIEver)).toBeTruthy();
    expect(screen.getByText('…he bailado solo.')).toBeTruthy();
    expect(screen.getByText(playCopy.groupRule)).toBeTruthy();
    expect(screen.getByText(playCopy.groupRuleNote)).toBeTruthy();
    expect(screen.queryByText(playCopy.turnOf)).toBeNull();
    expect(screen.queryByText(/\d pts?$/)).toBeNull();
    expect(screen.queryByText(playCopy.ifRefused)).toBeNull();
  });

  it('prefers the group card own headline and shows its consent note', async () => {
    const card = groupCard('g2', { type: 'everyoneWho', requiresConsent: true });
    await render(
      <CardFace card={card} copy={{ card, headline: '¡Bailen!', body: 'Todos.' }} player={ana} />,
    );

    expect(screen.getByText('¡Bailen!')).toBeTruthy();
    expect(screen.queryByText(playCopy.groupHeadlines.everyoneWho)).toBeNull();
    expect(screen.getByText(playCopy.consentNote)).toBeTruthy();
  });
});
