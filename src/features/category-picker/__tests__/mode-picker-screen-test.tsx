import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import Storage from 'expo-sqlite/kv-store';

import { routes } from '@/features/navigation/routes';

import { categoryPickerCopy, playerRangeLabel } from '../copy';
import { ModePickerScreen } from '../mode-picker-screen';
import { DraftProbe, DraftProviders, draftProbeTestId } from './fixtures/draft-harness';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() },
}));

const mockedRouter = jest.mocked(router);

async function renderModeScreen() {
  await render(
    <DraftProviders>
      <ModePickerScreen />
      <DraftProbe />
    </DraftProviders>,
  );
}

beforeEach(() => {
  Storage.clearSync();
  jest.clearAllMocks();
});

describe('ModePickerScreen', () => {
  it('offers Amigos and Pareja with their player range and tone', async () => {
    await renderModeScreen();
    expect(screen.getByRole('header', { name: categoryPickerCopy.mode.title })).toBeTruthy();
    expect(screen.getByText('Amigos')).toBeTruthy();
    expect(screen.getByText('De 2 a 12 jugadores')).toBeTruthy();
    expect(screen.getByText(categoryPickerCopy.modes.friends.tone)).toBeTruthy();
    expect(screen.getByText('Pareja')).toBeTruthy();
    expect(screen.getByText('Solo 2 jugadores')).toBeTruthy();
    expect(screen.getByText(categoryPickerCopy.modes.couple.tone)).toBeTruthy();
  });

  it('builds the player range from the mode limits', () => {
    expect(playerRangeLabel('friends')).toBe('De 2 a 12 jugadores');
    expect(playerRangeLabel('couple')).toBe('Solo 2 jugadores');
  });

  it('stores Pareja in the draft and opens the category list', async () => {
    await renderModeScreen();
    await fireEvent.press(screen.getByRole('button', { name: /^Pareja/ }));
    expect(screen.getByTestId(draftProbeTestId)).toHaveTextContent('couple|none');
    expect(mockedRouter.push).toHaveBeenCalledWith(routes.newGame.category);
  });

  it('stores Amigos in the draft and opens the category list', async () => {
    await renderModeScreen();
    await fireEvent.press(screen.getByRole('button', { name: /^Amigos/ }));
    expect(screen.getByTestId(draftProbeTestId)).toHaveTextContent('friends|none');
    expect(mockedRouter.push).toHaveBeenCalledWith(routes.newGame.category);
  });

  it('goes back home when there is no history', async () => {
    mockedRouter.canGoBack.mockReturnValue(false);
    await renderModeScreen();
    await fireEvent.press(screen.getByRole('button', { name: categoryPickerCopy.back }));
    expect(mockedRouter.replace).toHaveBeenCalledWith(routes.home);
  });
});
