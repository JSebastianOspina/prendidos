import { act, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Motion } from '@/constants/theme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

import { Entrance } from '../entrance';

jest.mock('@/hooks/use-reduce-motion', () => ({ useReduceMotion: jest.fn() }));

const mockedUseReduceMotion = jest.mocked(useReduceMotion);

describe('Entrance', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it.each([true, false])('renders its children with Reduce Motion %s', async (reduceMotion) => {
    mockedUseReduceMotion.mockReturnValue(reduceMotion);
    await render(
      <Entrance from="below" spring={Motion.cardSpring} testID="entrance">
        <Text>Reto de Ana</Text>
      </Entrance>,
    );
    expect(screen.getByText('Reto de Ana')).toBeTruthy();
    expect(screen.getByTestId('entrance')).toBeTruthy();
  });

  it('springs a card up into place within the card entrance limit', async () => {
    mockedUseReduceMotion.mockReturnValue(false);
    await render(
      <Entrance from="below" spring={Motion.cardSpring} testID="entrance">
        <Text>Reto</Text>
      </Entrance>,
    );
    const entrance = screen.getByTestId('entrance');
    expect(entrance).not.toHaveAnimatedStyle({ opacity: 1, transform: [{ translateY: 0 }] });

    await act(() => jest.advanceTimersByTime(Motion.cardEnterMaxMs + 50));
    expect(entrance).toHaveAnimatedStyle({ opacity: 1, transform: [{ translateY: 0 }] });
  });

  it('grows a piece from small to full size', async () => {
    mockedUseReduceMotion.mockReturnValue(false);
    await render(
      <Entrance from="small" spring={Motion.celebrationSpring} testID="entrance">
        <Text>Mascota</Text>
      </Entrance>,
    );
    const entrance = screen.getByTestId('entrance');
    expect(entrance).not.toHaveAnimatedStyle({ transform: [{ scale: 1 }] });

    await act(() => jest.advanceTimersByTime(Motion.levelUpDurationMs + 50));
    expect(entrance).toHaveAnimatedStyle({ transform: [{ scale: 1 }] });
  });

  it('only fades in, without movement, under Reduce Motion', async () => {
    mockedUseReduceMotion.mockReturnValue(true);
    await render(
      <Entrance from="below" spring={Motion.cardSpring} testID="entrance">
        <Text>Reto</Text>
      </Entrance>,
    );
    const entrance = screen.getByTestId('entrance');
    expect(entrance).toHaveAnimatedStyle({ opacity: 0 });

    await act(() => jest.advanceTimersByTime(Motion.reducedFadeMs + 50));
    expect(entrance).toHaveAnimatedStyle({ opacity: 1 });
    expect(entrance).not.toHaveAnimatedStyle({ transform: [{ translateY: 24 }] });
  });

  it('uses the fade for the next entrance once Reduce Motion is turned on', async () => {
    mockedUseReduceMotion.mockReturnValue(false);
    const view = await render(
      <Entrance key="first" from="below" spring={Motion.cardSpring} testID="entrance">
        <Text>Primera</Text>
      </Entrance>,
    );
    await act(() => jest.advanceTimersByTime(Motion.cardEnterMaxMs + 50));

    mockedUseReduceMotion.mockReturnValue(true);
    await view.rerender(
      <Entrance key="next" from="below" spring={Motion.cardSpring} testID="entrance">
        <Text>Siguiente</Text>
      </Entrance>,
    );
    const entrance = screen.getByTestId('entrance');
    expect(entrance).toHaveAnimatedStyle({ opacity: 0 });
    expect(entrance).not.toHaveAnimatedStyle({ transform: [{ translateY: 24 }] });
  });
});
