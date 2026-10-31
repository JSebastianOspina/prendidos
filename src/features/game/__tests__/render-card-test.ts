import { renderCard } from '../render-card';
import { ana, beto, cami, groupCard, individualCard } from './fixtures/game-fixtures';

describe('renderCard', () => {
  it('agrees with the current player and names the mentioned player', () => {
    const rendered = renderCard(individualCard('i'), { currentPlayer: ana, mentionedPlayer: beto });
    expect(rendered.headline).toBe('Hola campeona');
    expect(rendered.body).toBe('Haga algo con Beto.');
    expect(rendered.penaltyQuip).toBe('por floja');
  });

  it('uses the neutral variant for an undisclosed player', () => {
    expect(
      renderCard(individualCard('i'), { currentPlayer: cami, mentionedPlayer: ana }).headline,
    ).toBe('Hola estrella');
  });

  it('fills {partner} with the partner in couple mode', () => {
    const card = individualCard('c', { body: 'Mire a {partner}.', penalty: { drinks: 1 } });
    const rendered = renderCard(card, { currentPlayer: beto, partner: ana });
    expect(rendered.body).toBe('Mire a Ana.');
    expect(rendered.penaltyQuip).toBeUndefined();
  });

  it('renders group cards neutral and without a mentioned player', () => {
    const rendered = renderCard(groupCard('g', { body: 'Los {listos|listas|listes}.' }), {
      currentPlayer: ana,
      mentionedPlayer: beto,
    });
    expect(rendered.body).toBe('Los listes.');
    expect(rendered.headline).toBeUndefined();
  });

  it('renders a group headline when present', () => {
    const rendered = renderCard(groupCard('g', { headline: '¡Todos!' }), { currentPlayer: ana });
    expect(rendered.headline).toBe('¡Todos!');
  });
});
