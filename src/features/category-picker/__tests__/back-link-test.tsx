import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

import { TouchTarget } from '@/constants/theme';
import { routes } from '@/features/navigation/routes';

import { BackLink } from '../back-link';

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() },
}));

const mockedRouter = jest.mocked(router);

beforeEach(() => jest.clearAllMocks());

describe('BackLink', () => {
  it('is a square button one touch target wide, announced as "Volver" without a text label', async () => {
    await render(<BackLink fallbackHref={routes.home} />);
    const button = screen.getByRole('button', { name: 'Volver' });
    expect(button).toHaveStyle({ width: TouchTarget.minimum, height: TouchTarget.minimum });
    expect(screen.queryByText('Volver')).toBeNull();
  });

  it('goes back when there is history', async () => {
    mockedRouter.canGoBack.mockReturnValue(true);
    await render(<BackLink fallbackHref={routes.home} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));
    expect(mockedRouter.back).toHaveBeenCalledTimes(1);
    expect(mockedRouter.replace).not.toHaveBeenCalled();
  });

  it('replaces with the fallback when there is no history', async () => {
    mockedRouter.canGoBack.mockReturnValue(false);
    await render(<BackLink fallbackHref={routes.home} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));
    expect(mockedRouter.replace).toHaveBeenCalledWith(routes.home);
    expect(mockedRouter.back).not.toHaveBeenCalled();
  });
});
