import { render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { avatarIds } from '@/features/game/avatars';

import { avatarArt, mascotArt, mascotForLevel } from '../brand-art';
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
});
