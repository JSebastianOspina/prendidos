import { render, screen, within } from '@testing-library/react-native';

import { mascotArt } from '@/components/ui/brand-art';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

import { levelUpLine, playCopy } from '../copy';
import { LevelUpOverlay } from '../level-up-overlay';

jest.mock('@/hooks/use-reduce-motion', () => ({ useReduceMotion: jest.fn() }));

const mockedUseReduceMotion = jest.mocked(useReduceMotion);

async function renderOverlay() {
  await render(<LevelUpOverlay level="medium" roundText="Ronda 3 de 5" onContinue={jest.fn()} />);
}

describe('LevelUpOverlay', () => {
  it.each([false, true])('shows the same celebration with Reduce Motion %s', async (reduceMotion) => {
    mockedUseReduceMotion.mockReturnValue(reduceMotion);
    await renderOverlay();

    expect(screen.getByText('Ronda 3 de 5')).toBeTruthy();
    expect(screen.getByLabelText(mascotArt.smirk.label)).toBeTruthy();
    expect(screen.getByText(playCopy.levelUpTitles.medium)).toBeTruthy();
    expect(screen.getByText(levelUpLine('medium'))).toBeTruthy();
    expect(screen.getByLabelText(playCopy.currentLevel('medium'))).toBeTruthy();
    expect(screen.getByText(playCopy.moderation)).toBeTruthy();
    expect(screen.getByRole('button', { name: playCopy.keepPartying })).toBeTruthy();
  });

  it('animates only the mascot tile', async () => {
    mockedUseReduceMotion.mockReturnValue(false);
    await renderOverlay();

    const tile = within(screen.getByTestId('level-up-mascot-entrance'));
    expect(tile.getByLabelText(mascotArt.smirk.label)).toBeTruthy();
    expect(tile.queryByText(playCopy.levelUpTitles.medium)).toBeNull();
    expect(tile.queryByText('Ronda 3 de 5')).toBeNull();
    expect(tile.queryByRole('button')).toBeNull();
  });
});
