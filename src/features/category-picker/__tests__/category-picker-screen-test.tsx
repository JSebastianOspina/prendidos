import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';

import type { GameMode } from '@/features/content/card-types';
import * as catalogModule from '@/features/content/catalog';
import { routes } from '@/features/navigation/routes';

import { CategoryPickerScreen } from '../category-picker-screen';
import { lockBadgeSlotTestId } from '../choice-card';
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

describe('CategoryPickerScreen', () => {
  it('lists only the Amigos categories with name and description from the content', async () => {
    const [laPrevia] = catalogModule.categoriesForMode('friends');
    await renderCategoryScreen('friends');
    expect(screen.getByRole('header', { name: categoryPickerCopy.category.title })).toBeTruthy();
    expect(screen.getByText('Modo Amigos')).toBeTruthy();
    expect(screen.getByText('La Previa')).toBeTruthy();
    expect(screen.getByText(laPrevia.description ?? '')).toBeTruthy();
    expect(screen.queryByText('Entre Dos')).toBeNull();
  });

  it('stores the category and opens the setup with mode and category applied', async () => {
    await renderCategoryScreen('couple');
    expect(screen.queryByText('La Previa')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: /^Entre Dos/ }));
    expect(screen.getByTestId(draftProbeTestId)).toHaveTextContent('couple|entre-dos');
    expect(mockedRouter.push).toHaveBeenCalledWith(routes.newGame.setup);
  });

  it('shows no lock badge at launch', async () => {
    await renderCategoryScreen('couple');
    expect(screen.queryByTestId(lockBadgeSlotTestId)).toBeNull();
    expect(screen.queryByText(/bloquead/i)).toBeNull();
  });

  it('redirects to the mode screen when the draft has no mode', async () => {
    await renderCategoryScreen();
    expect(screen.getByText(`redirect:${routes.newGame.mode}`)).toBeTruthy();
    expect(screen.queryByText('La Previa')).toBeNull();
  });

  it('shows only the name when a category has no description', async () => {
    jest
      .spyOn(catalogModule, 'categoriesForMode')
      .mockReturnValue([
        { id: 'sin-texto', name: 'Sin Texto', mode: 'friends', freeDifficulties: ['easy'] },
      ]);
    await renderCategoryScreen('friends');
    expect(screen.getByRole('button', { name: 'Sin Texto' })).toBeTruthy();
  });

  it('says so when the mode has no categories yet', async () => {
    jest.spyOn(catalogModule, 'categoriesForMode').mockReturnValue([]);
    await renderCategoryScreen('friends');
    expect(screen.getByText(categoryPickerCopy.category.empty)).toBeTruthy();
    expect(screen.getByRole('button', { name: categoryPickerCopy.back })).toBeTruthy();
  });

  it('goes back to the mode screen when there is no history', async () => {
    mockedRouter.canGoBack.mockReturnValue(false);
    await renderCategoryScreen('friends');
    await fireEvent.press(screen.getByRole('button', { name: categoryPickerCopy.back }));
    expect(mockedRouter.replace).toHaveBeenCalledWith(routes.newGame.mode);
  });
});
