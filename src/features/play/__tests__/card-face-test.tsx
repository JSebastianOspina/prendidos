import { render, screen } from '@testing-library/react-native';

import type { Card } from '@/features/content/card-types';
import type { RenderedCard } from '@/features/game';
import { groupCard, individualCard } from '@/features/game/__tests__/fixtures/game-fixtures';

import { CardFace } from '../card-face';
import { playCopy } from '../copy';

function copyFor(card: Card, overrides: Partial<RenderedCard> = {}): RenderedCard {
  return { card, headline: 'Hola campeona', body: 'Abrace a Beto.', ...overrides };
}

describe('CardFace', () => {
  it('shows a Reto with its points, copy and penalty', async () => {
    const card = individualCard('r1', { points: 5 });
    await render(<CardFace card={card} copy={copyFor(card, { penaltyQuip: 'por floja' })} />);

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
    await render(<CardFace card={card} copy={copyFor(card)} />);

    expect(screen.getByText(playCopy.truthTag)).toBeTruthy();
    expect(screen.getByText(playCopy.truthHint)).toBeTruthy();
    expect(screen.queryByText(playCopy.challengeTag)).toBeNull();
    expect(screen.getByText('Toma 3 tragos')).toBeTruthy();
    expect(screen.getByLabelText('Nivel Prendido')).toBeTruthy();
  });

  it('shows the consent and outside-contact notes only when the card is flagged', async () => {
    const plain = individualCard('p1');
    const view = await render(<CardFace card={plain} copy={copyFor(plain)} />);
    expect(screen.queryByText(playCopy.consentNote)).toBeNull();
    expect(screen.queryByText(playCopy.outsideNote)).toBeNull();

    const flagged = individualCard('f1', { requiresConsent: true, reachesOutside: true });
    await view.rerender(<CardFace card={flagged} copy={copyFor(flagged)} />);
    expect(screen.getByText(playCopy.consentNote)).toBeTruthy();
    expect(screen.getByText(playCopy.outsideNote)).toBeTruthy();
  });

  it('shows a group card for everyone, without points or penalty', async () => {
    const card = groupCard('g1');
    await render(
      <CardFace card={card} copy={{ card, headline: undefined, body: '…he bailado solo.' }} />,
    );

    expect(screen.getByText(playCopy.forTheGroup)).toBeTruthy();
    expect(screen.getByText(playCopy.groupHeadlines.neverHaveIEver)).toBeTruthy();
    expect(screen.getByText('…he bailado solo.')).toBeTruthy();
    expect(screen.queryByText(/pts?$/)).toBeNull();
    expect(screen.queryByText(playCopy.ifRefused)).toBeNull();
  });

  it('prefers the group card own headline and shows its consent note', async () => {
    const card = groupCard('g2', { type: 'everyoneWho', requiresConsent: true });
    await render(<CardFace card={card} copy={{ card, headline: '¡Todos!', body: 'Bailen.' }} />);

    expect(screen.getByText('¡Todos!')).toBeTruthy();
    expect(screen.queryByText(playCopy.groupHeadlines.everyoneWho)).toBeNull();
    expect(screen.getByText(playCopy.consentNote)).toBeTruthy();
  });
});
