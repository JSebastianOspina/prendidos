/// <reference types="node" />
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { illustrationKeys } from '@/features/content/card-types';
import { avatarIds } from '@/features/game/avatars';

import { avatarArt, cardIllustrationArt, mascotArt, mascotForLevel } from '../brand-art';
import { CardIllustration } from '../card-illustration';
import { Mascot } from '../mascot';
import { PlayerAvatar } from '../player-avatar';

describe('brand art', () => {
  it('has art for every avatar id and every mascot name', () => {
    for (const id of avatarIds) expect(avatarArt[id]).toBeDefined();
    for (const name of ['wink', 'laugh', 'relaxed', 'smirk', 'pointing', 'icon'] as const) {
      expect(mascotArt[name].source).toBeDefined();
      expect(mascotArt[name].label).toMatch(/Prendido/);
    }
  });

  it('maps each level to its mascot face', () => {
    expect(mascotForLevel.easy).toBe('relaxed');
    expect(mascotForLevel.medium).toBe('smirk');
    expect(mascotForLevel.hard).toBe('laugh');
  });

  it('shows a mascot at the requested size with a Spanish label', async () => {
    await render(<Mascot art="wink" size={48} />);
    const image = screen.getByLabelText(mascotArt.wink.label);
    expect(StyleSheet.flatten(image.props.style)).toMatchObject({ width: 48, height: 48 });
  });

  it('keeps the pose proportions by height', async () => {
    await render(<Mascot art="pointing" size={250} />);
    const style = StyleSheet.flatten(screen.getByLabelText(mascotArt.pointing.label).props.style);
    expect(style.height).toBe(250);
    expect(style.width).toBeLessThan(250);
  });

  it('lets a screen replace the mascot label', async () => {
    await render(<Mascot art="laugh" size={120} accessibilityLabel="Prendido, nivel Prendido" />);
    expect(screen.getByLabelText('Prendido, nivel Prendido')).toBeTruthy();
  });

  it('shows an avatar in a square frame named after the player', async () => {
    await render(<PlayerAvatar avatarId="avatar-07" size={56} playerName="Vale" />);
    const frame = screen.getByLabelText('Avatar de Vale');
    expect(StyleSheet.flatten(frame.props.style)).toMatchObject({
      width: 56,
      height: 56,
      borderRadius: 14,
    });
  });

  it('hides an unnamed avatar from screen readers', async () => {
    await render(<PlayerAvatar avatarId="avatar-01" size={32} />);
    expect(screen.queryByLabelText(/Avatar/)).toBeNull();
  });

  describe('card illustrations', () => {
    it('holds exactly the 60 library keys of the brand-art spec, in library order', () => {
      expect(illustrationKeys).toEqual([
        'mascot-wink',
        'mascot-relaxed',
        'mascot-smirk',
        'mascot-laugh',
        'mascot-pointing',
        'mascot-surprised',
        'mascot-monocle',
        'mascot-reading-book',
        'mascot-crying',
        'mascot-sad-map-pin',
        'mascot-blowing-kiss',
        'mascot-sunglasses',
        'mascot-dancing',
        'mascot-tongue-out',
        'mascot-annoyed',
        'mascot-selfie',
        'mascot-diva',
        'phone-ringing',
        'microphone',
        'animal-wheel',
        'shot-glass-on-fire',
        'glasses-toasting',
        'rooster',
        'two-dogs',
        'mascot-heart-eyes',
        'mascot-shh',
        'mascot-broken-heart',
        'mascot-rose',
        'mascot-hug',
        'mascot-telenovela',
        'mascot-fingers-crossed',
        'mascot-thinking',
        'mascot-megaphone',
        'chat-bubbles',
        'like-heart',
        'heart-arrow',
        'theater-masks',
        'disco-ball',
        'moon-stars',
        'gift-box',
        'ring-box',
        'pizza-slice',
        'voice-note',
        'mascot-typing',
        'emoji-faces',
        'mascot-phone-shock',
        'mascot-kissing',
        'mascot-blushing',
        'photo-camera',
        'profile-card',
        'photo-gallery',
        'mascot-posing',
        'mascot-spa',
        'staring-eyes',
        'stopwatch',
        'rock-paper-scissors',
        'dance-shoes',
        'headphones-music',
        'mascot-gossip',
        'confetti',
      ]);
    });

    it.each(illustrationKeys)('has bundled art with a positive aspect ratio for %s', (key) => {
      expect(cardIllustrationArt[key].source).toBeDefined();
      expect(cardIllustrationArt[key].aspectRatio).toBeGreaterThan(0);
    });

    it('declares each card PNG with its real aspect ratio', () => {
      const brandDir = join(__dirname, '../../../../assets/images/brand');
      const mismatches = illustrationKeys
        .filter((key) => existsSync(join(brandDir, `card-${key}.png`)))
        .filter((key) => {
          // PNG IHDR: width and height are big-endian 32-bit integers at bytes 16 and 20.
          const header = readFileSync(join(brandDir, `card-${key}.png`));
          const ratio = header.readUInt32BE(16) / header.readUInt32BE(20);
          return Math.abs(cardIllustrationArt[key].aspectRatio - ratio) > 0.001;
        });
      expect(mismatches).toEqual([]);
    });

    it('reuses the mascot art for the mascot expressions', () => {
      expect(cardIllustrationArt['mascot-wink'].source).toBe(mascotArt.wink.source);
      expect(cardIllustrationArt['mascot-pointing']).toMatchObject({
        source: mascotArt.pointing.source,
        aspectRatio: mascotArt.pointing.aspectRatio,
      });
    });

    it('shows the non-square dancing piece 120 pt tall at its own proportions', async () => {
      await render(<CardIllustration illustration="mascot-dancing" height={120} />);
      const image = screen.getByTestId('card-illustration', { includeHiddenElements: true });
      expect(StyleSheet.flatten(image.props.style)).toEqual({
        height: 120,
        width: Math.round(120 * cardIllustrationArt['mascot-dancing'].aspectRatio),
      });
      expect(cardIllustrationArt['mascot-dancing'].aspectRatio).not.toBe(1);
    });

    it('sizes the width from the height and the aspect ratio', async () => {
      await render(<CardIllustration illustration="mascot-pointing" height={120} />);
      const image = screen.getByTestId('card-illustration', { includeHiddenElements: true });
      expect(StyleSheet.flatten(image.props.style)).toMatchObject({
        height: 120,
        width: Math.round(120 * mascotArt.pointing.aspectRatio),
      });
      expect(image.props.contentFit).toBe('contain');
    });

    it('is hidden from screen readers', async () => {
      await render(<CardIllustration illustration="mascot-surprised" height={120} />);
      expect(screen.queryByTestId('card-illustration')).toBeNull();
      const image = screen.getByTestId('card-illustration', { includeHiddenElements: true });
      expect(image.props).toMatchObject({
        accessible: false,
        accessibilityElementsHidden: true,
        importantForAccessibility: 'no-hide-descendants',
      });
    });
  });
});
