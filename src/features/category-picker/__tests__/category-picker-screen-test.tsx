import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';

import type { GameMode } from '@/features/content/card-types';
import * as catalogModule from '@/features/content/catalog';
import { routes } from '@/features/navigation/routes';

import { standardCardCounts, totalCards } from '../category-details';
import { CategoryPickerScreen } from '../category-picker-screen';
import { categoryPickerCopy } from '../copy';
import {
  DraftProbe,
  DraftProviders,
  WithDraftMode,
  draftProbeTestId,
} from './fixtures/draft-harness';

jest.mock('expo-router', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    router: { push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() },
    Redirect: ({ href }: { href: string }) => <MockText>{`redirect:${href}`}</MockText>,
  };
});

const mockedRouter = jest.mocked(router);

async function renderCategoryScreen(mode?: GameMode) {
  const content = (
    <>
      <CategoryPickerScreen />
      <DraftProbe />
    </>
  );
  await render(
    <DraftProviders>
      {mode ? <WithDraftMode mode={mode}>{content}</WithDraftMode> : content}
    </DraftProviders>,
  );
}

beforeEach(() => {
  Storage.clearSync();
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

describe('CategoryPickerScreen in Amigos', () => {
  it('heads the screen with the mode name and the friends subtitle', async () => {
    await renderCategoryScreen('friends');
    expect(screen.getByRole('header', { name: 'Amigos' })).toBeTruthy();
    expect(
      screen.getByText('Elija una categoría. La partida arranca suave y se va calentando sola.'),
    ).toBeTruthy();
    expect(screen.queryByText(categoryPickerCopy.playersChip(2))).toBeNull();
  });

  it('shows La Previa with its description, card count, level bars, and the free chip', async () => {
    const [laPrevia] = catalogModule.categoriesForMode('friends');
    const cardCount = totalCards(standardCardCounts('la-previa'));
    const details = `${laPrevia.description} ${categoryPickerCopy.cardCount(cardCount)}.`;
    await renderCategoryScreen('friends');

    expect(screen.getByText('La Previa')).toBeTruthy();
    expect(screen.getByText(details)).toBeTruthy();
    expect(screen.getByText(categoryPickerCopy.free)).toBeTruthy();
    expect(screen.getAllByTestId(/^level-bar-/)).toHaveLength(3);
    expect(
      screen.getByRole('button', { name: `La Previa. ${details} ${categoryPickerCopy.free}.` }),
    ).toBeTruthy();
    expect(screen.queryByText('Entre Dos')).toBeNull();
  });

  it('stores the category and opens the setup when the card is tapped', async () => {
    await renderCategoryScreen('friends');
    await fireEvent.press(screen.getByRole('button', { name: /^La Previa/ }));
    expect(screen.getByTestId(draftProbeTestId)).toHaveTextContent('friends|la-previa');
    expect(mockedRouter.push).toHaveBeenCalledWith(routes.newGame.setup);
  });

  it('shows the name and the count when a category has no description and no free chip when it is paid', async () => {
    jest
      .spyOn(catalogModule, 'categoriesForMode')
      .mockReturnValue([
        { id: 'sin-texto', name: 'Sin Texto', mode: 'friends', freeDifficulties: ['easy'] },
      ]);
    await renderCategoryScreen('friends');
    expect(screen.getByRole('button', { name: 'Sin Texto. 0 cartas.' })).toBeTruthy();
    expect(screen.queryByText(categoryPickerCopy.free)).toBeNull();
  });

  it('says so when the mode has no categories yet', async () => {
    jest.spyOn(catalogModule, 'categoriesForMode').mockReturnValue([]);
    await renderCategoryScreen('friends');
    expect(screen.getByText(categoryPickerCopy.empty)).toBeTruthy();
    expect(screen.getByRole('button', { name: categoryPickerCopy.back })).toBeTruthy();
  });
});

describe('CategoryPickerScreen in Pareja', () => {
  it('heads the screen with the mode name, the two-player chip, and the couple subtitle', async () => {
    await renderCategoryScreen('couple');
    expect(screen.getByRole('header', { name: 'Pareja' })).toBeTruthy();
    expect(screen.getByText('2 jugadores')).toBeTruthy();
    expect(screen.getByText('Un plan coqueto para dos. Picante, sí; explícito, no.')).toBeTruthy();
    expect(screen.queryByText('La Previa')).toBeNull();
  });

  it('lists each level of Entre Dos with its card count, marking only the free one', async () => {
    await renderCategoryScreen('couple');
    expect(screen.getByText('Entre Dos')).toBeTruthy();
    expect(screen.getByLabelText('Suave. Gratis · 30 cartas')).toBeTruthy();
    expect(screen.getByLabelText('Picante. 30 cartas')).toBeTruthy();
    expect(screen.getByLabelText('Prendido. 30 cartas')).toBeTruthy();
  });

  it('shows no lock, price, or purchase copy', async () => {
    await renderCategoryScreen('couple');
    expect(screen.queryByText(/bloque|USD|Pase total|Restaurar/i)).toBeNull();
  });

  it('stores Entre Dos and opens the setup from "Jugar Entre Dos"', async () => {
    await renderCategoryScreen('couple');
    await fireEvent.press(screen.getByRole('button', { name: 'Jugar Entre Dos' }));
    expect(screen.getByTestId(draftProbeTestId)).toHaveTextContent('couple|entre-dos');
    expect(mockedRouter.push).toHaveBeenCalledWith(routes.newGame.setup);
  });
});

describe('CategoryPickerScreen navigation', () => {
  it('redirects to Inicio when the draft has no mode', async () => {
    await renderCategoryScreen();
    expect(screen.getByText(`redirect:${routes.home}`)).toBeTruthy();
    expect(screen.queryByText('La Previa')).toBeNull();
  });

  it('goes back to Inicio when there is no history', async () => {
    mockedRouter.canGoBack.mockReturnValue(false);
    await renderCategoryScreen('friends');
    await fireEvent.press(screen.getByRole('button', { name: categoryPickerCopy.back }));
    expect(mockedRouter.replace).toHaveBeenCalledWith(routes.home);
  });
});
