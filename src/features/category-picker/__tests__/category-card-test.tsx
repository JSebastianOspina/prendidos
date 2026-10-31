import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Colors } from '@/constants/theme';

import { CategoryCard, lockBadgeSlotTestId } from '../category-card';
import { categoryPickerCopy } from '../copy';
import { accentByMode } from '../mode-accent';

describe('CategoryCard', () => {
  it('is one labelled button with name, details, and the free chip', async () => {
    const onPress = jest.fn();
    await render(
      <CategoryCard
        name="La Previa"
        description="Para el parche."
        cardCount={1}
        isFree
        onPress={onPress}
      />,
    );
    expect(screen.getByText('Para el parche. 1 carta.')).toBeTruthy();
    expect(screen.getByText(categoryPickerCopy.free)).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: 'La Previa. Para el parche. 1 carta. Gratis.' }),
    );
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('puts a given lock badge in the chip corner instead of the free chip', async () => {
    const { rerender } = await render(
      <CategoryCard name="Sin Filtro" cardCount={90} isFree={false} onPress={jest.fn()} />,
    );
    expect(screen.queryByTestId(lockBadgeSlotTestId)).toBeNull();

    await rerender(
      <CategoryCard
        name="Sin Filtro"
        cardCount={90}
        isFree
        onPress={jest.fn()}
        lockBadge={<Text>Candado</Text>}
      />,
    );
    expect(screen.getByTestId(lockBadgeSlotTestId)).toBeTruthy();
    expect(screen.getByText('Candado')).toBeTruthy();
    expect(screen.queryByText(categoryPickerCopy.free)).toBeNull();
  });

  it('maps each mode to its brand accent', () => {
    expect(accentByMode).toEqual({ friends: Colors.primary, couple: Colors.couple });
  });
});
