import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Colors } from '@/constants/theme';

import { ChoiceCard, lockBadgeSlotTestId } from '../choice-card';
import { accentByMode } from '../mode-accent';

describe('ChoiceCard', () => {
  it('shows title, subtitle, and description as one labelled button', async () => {
    const onPress = jest.fn();
    await render(
      <ChoiceCard
        title="Amigos"
        subtitle="De 2 a 12 jugadores"
        description="Para todo el parche."
        accentColor={accentByMode.friends}
        onPress={onPress}
      />,
    );
    expect(screen.getByText('Amigos')).toBeTruthy();
    expect(screen.getByText('De 2 a 12 jugadores')).toBeTruthy();
    expect(screen.getByText('Para todo el parche.')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Amigos. De 2 a 12 jugadores. Para todo el parche.' }),
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('labels a card with only a title by its title', async () => {
    await render(<ChoiceCard title="La Previa" accentColor={Colors.primary} onPress={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'La Previa' })).toBeTruthy();
  });

  it('keeps the lock badge slot hidden unless a badge is given', async () => {
    const { rerender } = await render(
      <ChoiceCard title="Entre Dos" accentColor={accentByMode.couple} onPress={jest.fn()} />,
    );
    expect(screen.queryByTestId(lockBadgeSlotTestId)).toBeNull();

    await rerender(
      <ChoiceCard
        title="Entre Dos"
        accentColor={accentByMode.couple}
        onPress={jest.fn()}
        lockBadge={<Text>Candado</Text>}
      />,
    );
    expect(screen.getByTestId(lockBadgeSlotTestId)).toBeTruthy();
    expect(screen.getByText('Candado')).toBeTruthy();
  });

  it('maps each mode to its brand accent', () => {
    expect(accentByMode).toEqual({ friends: Colors.primary, couple: Colors.couple });
  });
});
