import Storage from 'expo-sqlite/kv-store';
import { fireEvent, renderRouter, screen } from 'expo-router/testing-library';
import { Text } from 'react-native';

import RootLayout from '@/app/_layout';
import AgeGateRoute from '@/app/age-gate';

import { ageGateCopy } from '../age-gate-copy';

/** Stand-in for Inicio: this test only checks that the real guard leaves the gate. */
function HomeStub() {
  return <Text>Inicio stub</Text>;
}

function OtherScreenStub() {
  return <Text>Other screen stub</Text>;
}

/** Every route the root layout declares; only the gate is real. */
const routerContext = {
  _layout: RootLayout,
  index: HomeStub,
  'age-gate': AgeGateRoute,
  'new-game/category': OtherScreenStub,
  'new-game/setup': OtherScreenStub,
  play: OtherScreenStub,
  results: OtherScreenStub,
};

beforeEach(() => Storage.clearSync());

describe('age gate inside the real root layout', () => {
  it('opens on the gate, stays there on decline, and shows Inicio after confirming', async () => {
    await renderRouter(routerContext, { initialUrl: '/' });

    expect(screen.getByRole('header', { name: ageGateCopy.question })).toBeTruthy();
    expect(screen.queryByText('Inicio stub')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: ageGateCopy.declineAction }));
    expect(screen).toHavePathname('/age-gate');

    await fireEvent.press(screen.getByRole('button', { name: ageGateCopy.confirmAction }));
    expect(await screen.findByText('Inicio stub')).toBeTruthy();
    expect(screen).toHavePathname('/');
  });

  it('never shows the gate again after a restart', async () => {
    const first = await renderRouter(routerContext, { initialUrl: '/' });
    await fireEvent.press(screen.getByRole('button', { name: ageGateCopy.confirmAction }));
    await screen.findByText('Inicio stub');
    await first.unmount();

    await renderRouter(routerContext, { initialUrl: '/age-gate' });

    expect(await screen.findByText('Inicio stub')).toBeTruthy();
    expect(screen.queryByRole('header', { name: ageGateCopy.question })).toBeNull();
  });
});
