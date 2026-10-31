import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button, repeatedPressWindowMs } from '../button';
import { CardFrame } from '../card-frame';
import { LevelBadge } from '../level-badge';
import { PlaceholderScreen } from '../placeholder-screen';
import { AppText } from '../app-text';

describe('UI primitives', () => {
  it('presses a button by its label', async () => {
    const onPress = jest.fn();
    await render(<Button label="¡Cumplió!" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: '¡Cumplió!' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ignores a repeated press while the first one is still being handled', async () => {
    const onPress = jest.fn();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(1_000);
    await render(<Button label="Nueva partida" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Nueva partida' });
    await fireEvent.press(button);
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(1);

    clock.mockReturnValue(1_000 + repeatedPressWindowMs);
    await fireEvent.press(button);
    expect(onPress).toHaveBeenCalledTimes(2);
    clock.mockRestore();
  });

  it('shows a placeholder with its name and a next button', async () => {
    const onNext = jest.fn();
    await render(<PlaceholderScreen title="Inicio" story="HU-02" onNext={onNext} />);
    expect(screen.getByRole('header', { name: 'Inicio' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onNext).toHaveBeenCalled();
  });

  it('labels levels in Spanish and renders the card frame', async () => {
    await render(
      <CardFrame tone="group">
        <LevelBadge difficulty="hard" />
        <AppText>Yo nunca</AppText>
      </CardFrame>,
    );
    expect(screen.getByLabelText('Nivel Prendido')).toBeTruthy();
    expect(screen.getByText('Yo nunca')).toBeTruthy();
  });
});
