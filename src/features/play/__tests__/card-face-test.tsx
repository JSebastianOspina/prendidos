import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { cardIllustrationArt } from '@/components/ui/brand-art';
import type { Card, Difficulty, IllustrationKey } from '@/features/content/card-types';
import type { RenderedCard } from '@/features/game';
import { ana, groupCard, individualCard } from '@/features/game/__tests__/fixtures/game-fixtures';

import { CardFace } from '../card-face';
import { playCopy } from '../copy';
import { cardIllustrationGap, cardIllustrationMinHeight } from '../illustration-fit';

function copyFor(card: Card, overrides: Partial<RenderedCard> = {}): RenderedCard {
  return { card, headline: 'Hola campeona', body: 'Abrace a Beto.', ...overrides };
}

/** The least free space that still shows an illustration (72 pt plus the gap). */
const roomForIllustration = cardIllustrationMinHeight + cardIllustrationGap;

async function layOutSlot(height: number) {
  await fireEvent(screen.getByTestId('card-illustration-slot'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 300, height } },
  });
}

function illustration() {
  return screen.queryByTestId('card-illustration', { includeHiddenElements: true });
}

/** Position of a marker in the rendered tree, to check what sits above what. */
function treeIndexOf(marker: string): number {
  return JSON.stringify(screen.toJSON()).indexOf(marker);
}

describe('CardFace', () => {
  it('shows a Reto with the player, its chips and copy, without a hint line or penalty footer', async () => {
    const card = individualCard('r1', { points: 5 });
    await render(
      <CardFace card={card} copy={copyFor(card, { penaltyQuip: 'por floja' })} player={ana} />,
    );

    expect(screen.getByText(playCopy.turnOf)).toBeTruthy();
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByLabelText('Avatar de Ana')).toBeTruthy();
    expect(screen.getByText(playCopy.challengeTag)).toBeTruthy();
    expect(screen.queryByText('Hágalo')).toBeNull();
    expect(screen.queryByText(playCopy.truthTag)).toBeNull();
    expect(screen.getByText('5 pts')).toBeTruthy();
    expect(screen.getByText('Hola campeona')).toBeTruthy();
    expect(screen.getByText('Abrace a Beto.')).toBeTruthy();
    expect(screen.queryByText('Si no cumple')).toBeNull();
    expect(screen.queryByText(/Toma 1 trago/)).toBeNull();
    expect(screen.getByLabelText('Nivel Suave')).toBeTruthy();
  });

  it('shows a Verdad by its chip', async () => {
    const card = individualCard('v1', {
      type: 'truth',
      difficulty: 'hard',
      points: 25,
      penalty: { drinks: 3 },
    });
    await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

    expect(screen.getByText(playCopy.truthTag)).toBeTruthy();
    expect(screen.queryByText('Responda con la verdad')).toBeNull();
    expect(screen.queryByText(playCopy.challengeTag)).toBeNull();
    expect(screen.queryByText('Toma 3 tragos')).toBeNull();
    expect(screen.getByLabelText('Nivel Prendido')).toBeTruthy();
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
    expect(screen.queryByText('Si no cumple')).toBeNull();
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

  describe('illustration slot', () => {
    it('shows the illustration below the text, as the last element of the card, once it fits', async () => {
      const card = individualCard('i1', { illustration: 'mascot-laugh' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);
      expect(illustration()).toBeNull();

      await layOutSlot(roomForIllustration + 40);

      expect(illustration()).not.toBeNull();
      expect(treeIndexOf('Abrace a Beto.')).toBeLessThan(treeIndexOf('card-illustration"'));
      const tree = JSON.stringify(screen.toJSON());
      expect(tree.indexOf('card-illustration"')).toBeGreaterThan(tree.indexOf('5 pts'));
      expect(tree.indexOf('Si no cumple')).toBe(-1);
    });

    it.each<[Difficulty, IllustrationKey]>([
      ['easy', 'mascot-relaxed'],
      ['medium', 'mascot-smirk'],
      ['hard', 'mascot-laugh'],
    ])("shows the %s level's mascot face on a card without a key", async (difficulty, face) => {
      const card = individualCard('i2', {
        difficulty,
        points: { easy: 5, medium: 15, hard: 25 }[difficulty],
      });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);
      await layOutSlot(400);
      expect(illustration()?.props.source).toEqual([cardIllustrationArt[face].source]);
    });

    it("shows the level face on a group card without a key, and nothing under 72 pt", async () => {
      const card = groupCard('g6', { difficulty: 'medium' });
      await render(<CardFace card={card} copy={{ card, headline: undefined, body: 'Todos.' }} player={ana} />);
      await layOutSlot(roomForIllustration - 1);
      expect(illustration()).toBeNull();

      await layOutSlot(150);
      expect(illustration()?.props.source).toEqual([cardIllustrationArt['mascot-smirk'].source]);
      expect(StyleSheet.flatten(illustration()?.props.style).height).toBe(150 - cardIllustrationGap);
    });

    it('renders text-only when the illustration does not fit', async () => {
      const card = individualCard('i3', { illustration: 'mascot-laugh' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);
      await layOutSlot(roomForIllustration - 1);
      expect(illustration()).toBeNull();
      expect(screen.getByText('Abrace a Beto.')).toBeTruthy();
    });

    it('keeps the illustration out of the accessibility tree', async () => {
      const card = individualCard('i4', { illustration: 'mascot-surprised' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);
      await layOutSlot(400);
      expect(illustration()).not.toBeNull();
      expect(screen.queryByTestId('card-illustration')).toBeNull();
    });

    it('applies the same rule to group cards, above the rule box', async () => {
      const card = groupCard('g3', { illustration: 'mascot-wink' });
      await render(<CardFace card={card} copy={{ card, headline: undefined, body: 'Todos.' }} player={ana} />);
      expect(illustration()).toBeNull();

      await layOutSlot(roomForIllustration - 1);
      expect(illustration()).toBeNull();

      await layOutSlot(roomForIllustration);
      expect(illustration()).not.toBeNull();
      expect(treeIndexOf('Todos.')).toBeLessThan(treeIndexOf('card-illustration"'));
      expect(treeIndexOf('card-illustration"')).toBeLessThan(treeIndexOf(playCopy.groupRule));
    });

    it('hides the illustration again for a new card until its slot is measured', async () => {
      const first = individualCard('i5', { illustration: 'mascot-laugh' });
      const view = await render(<CardFace card={first} copy={copyFor(first)} player={ana} />);
      await layOutSlot(400);
      expect(illustration()).not.toBeNull();

      const next = individualCard('i6', { illustration: 'mascot-smirk' });
      await view.rerender(<CardFace card={next} copy={copyFor(next)} player={ana} />);
      expect(illustration()).toBeNull();

      await layOutSlot(400);
      expect(illustration()).not.toBeNull();
    });

    it('checks the fit again on every slot layout, as when the window or font size changes', async () => {
      const card = individualCard('i7', { illustration: 'mascot-laugh' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);
      await layOutSlot(roomForIllustration);
      expect(illustration()).not.toBeNull();

      // Larger text or a shorter window leaves less room under the text.
      await layOutSlot(roomForIllustration - 1);
      expect(illustration()).toBeNull();

      // Rotating or a smaller font gives the room back.
      await layOutSlot(roomForIllustration + 80);
      expect(illustration()).not.toBeNull();
    });

    it('draws the illustration out of the layout flow, so it never moves anything', async () => {
      const card = individualCard('i8', { illustration: 'mascot-laugh' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);
      await layOutSlot(400);

      const frame = screen.getByTestId('card-illustration-frame', { includeHiddenElements: true });
      expect(StyleSheet.flatten(frame.props.style)).toMatchObject({ position: 'absolute' });
    });

    it('sizes the illustration to the free space left under the text', async () => {
      const card = individualCard('i9', { illustration: 'mascot-laugh' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

      await layOutSlot(100);
      const image = illustration();
      expect(image).not.toBeNull();
      expect(StyleSheet.flatten(image?.props.style).height).toBe(100 - cardIllustrationGap);

      await layOutSlot(400);
      expect(StyleSheet.flatten(illustration()?.props.style).height).toBe(160);
    });
  });

  describe('card fit', () => {
    function bodyFontSize(text = 'Abrace a Beto.'): number | undefined {
      return StyleSheet.flatten(screen.getByText(text).props.style).fontSize;
    }

    it('starts the body at 29 pt', async () => {
      const card = individualCard('f1');
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);
      expect(bodyFontSize()).toBe(29);
    });

    it('steps the body down to 24 and then 20 pt while the card overflows, and stops there', async () => {
      const card = individualCard('f2');
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

      await layOutSlot(0);
      expect(bodyFontSize()).toBe(24);
      await layOutSlot(0);
      expect(bodyFontSize()).toBe(20);
      await layOutSlot(0);
      expect(bodyFontSize()).toBe(20);
    });

    it('never steps the body down for the default level face', async () => {
      const card = individualCard('f3');
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

      await layOutSlot(40);
      expect(bodyFontSize()).toBe(29);
      expect(illustration()).toBeNull();
    });

    it('gives the illustration one smaller text size when that makes room for it', async () => {
      const card = individualCard('f8', { illustration: 'mascot-laugh' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

      await layOutSlot(40);
      expect(bodyFontSize()).toBe(24);
      expect(illustration()).toBeNull();

      await layOutSlot(120);
      expect(bodyFontSize()).toBe(24);
      expect(StyleSheet.flatten(illustration()?.props.style).height).toBe(108);
    });

    it('returns to the size that fit when one step down still leaves no room for the illustration', async () => {
      const card = individualCard('f9', { illustration: 'mascot-laugh' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

      await layOutSlot(40);
      expect(bodyFontSize()).toBe(24);
      await layOutSlot(60);
      expect(bodyFontSize()).toBe(29);
      expect(illustration()).toBeNull();
    });

    it('shows the illustration with the room left after the text steps down', async () => {
      const card = individualCard('f4', { illustration: 'mascot-laugh' });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

      await layOutSlot(0);
      expect(illustration()).toBeNull();
      await layOutSlot(100);
      expect(bodyFontSize()).toBe(24);
      expect(StyleSheet.flatten(illustration()?.props.style).height).toBe(88);
    });

    it('steps a group card body the same way', async () => {
      const card = groupCard('g5');
      await render(<CardFace card={card} copy={{ card, headline: undefined, body: 'Todos.' }} player={ana} />);
      expect(bodyFontSize('Todos.')).toBe(29);

      await layOutSlot(0);
      expect(bodyFontSize('Todos.')).toBe(24);
    });

    it('starts a new card again at 29 pt', async () => {
      const first = individualCard('f5');
      const view = await render(<CardFace card={first} copy={copyFor(first)} player={ana} />);
      await layOutSlot(0);
      expect(bodyFontSize()).toBe(24);

      const next = individualCard('f6');
      await view.rerender(<CardFace card={next} copy={copyFor(next)} player={ana} />);
      expect(bodyFontSize()).toBe(29);
    });

    it('keeps every header element in the compact layout', async () => {
      const card = individualCard('f7', { points: 5 });
      await render(<CardFace card={card} copy={copyFor(card)} player={ana} />);

      const avatar = screen.getByLabelText('Avatar de Ana');
      expect(StyleSheet.flatten(avatar.props.style)).toMatchObject({ width: 48, height: 48 });
      expect(screen.getByText(playCopy.turnOf)).toBeTruthy();
      expect(screen.getByRole('header', { name: 'Ana' })).toBeTruthy();
      expect(screen.getByText(playCopy.challengeTag)).toBeTruthy();
      expect(screen.getByLabelText('Nivel Suave')).toBeTruthy();
      expect(screen.getByText('5 pts')).toBeTruthy();
    });
  });
});
