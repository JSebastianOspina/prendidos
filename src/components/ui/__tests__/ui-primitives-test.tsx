import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '../button';
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
