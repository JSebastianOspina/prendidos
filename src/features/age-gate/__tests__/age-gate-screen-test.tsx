import { fireEvent, render, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import { Dimensions, StyleSheet } from 'react-native';

import AgeGateRoute from '@/app/age-gate';
import { mascotArt } from '@/components/ui/brand-art';
import { TouchTarget } from '@/constants/theme';
import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { deviceStateKey, readDeviceState } from '@/features/device/device-storage';

import { ageGateCopy } from '../age-gate-copy';
import { mascotHeightFor } from '../age-gate-layout';
import { AgeGateScreen } from '../age-gate-screen';

const confirmedAt = '2026-10-31T20:00:00.000Z';

async function renderAgeGate() {
  return render(
    <DeviceStateProvider now={() => confirmedAt}>
      <AgeGateScreen />
    </DeviceStateProvider>,
  );
}

beforeEach(() => Storage.clearSync());

describe('AgeGateScreen', () => {
  it('shows the mascot, the question, the subtitle, the moderation card, the actions and the footnote', async () => {
    await renderAgeGate();

    expect(screen.getByRole('image', { name: mascotArt.pointing.label })).toBeTruthy();
    expect(screen.getByRole('header', { name: '¿Ya es mayor de edad?' })).toBeTruthy();
    expect(screen.getByText(ageGateCopy.subtitle)).toBeTruthy();
    expect(screen.getByText(ageGateCopy.moderationNotice)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Soy mayor de 18 años' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Soy menor de edad' })).toBeTruthy();
    expect(screen.getByText('Se lo preguntamos una sola vez.')).toBeTruthy();
    expect(screen.queryByText(ageGateCopy.adultsOnlyMessage)).toBeNull();
  });

  it('no longer shows the wordmark tile', async () => {
    await renderAgeGate();

    expect(screen.queryByText('Prendidos')).toBeNull();
  });

  it('names the 3-drink cap and not driving in the moderation card', async () => {
    await renderAgeGate();

    expect(screen.getByText(/ningún castigo pasa de 3 tragos/)).toBeTruthy();
    expect(screen.getByText(/no maneje/)).toBeTruthy();
  });

  it('hides the decorative shield glyph from screen readers', async () => {
    await renderAgeGate();

    expect(screen.queryByTestId('shield-glyph')).toBeNull();
    expect(screen.getByTestId('shield-glyph', { includeHiddenElements: true })).toBeTruthy();
  });

  it('sizes the mascot from the window height', async () => {
    await renderAgeGate();

    const mascot = screen.getByRole('image', { name: mascotArt.pointing.label });
    const expectedHeight = mascotHeightFor(Dimensions.get('window').height);
    expect(StyleSheet.flatten(mascot.props.style).height).toBe(expectedHeight);
  });

  it('gives the decline link a touch target of at least 48 pt', async () => {
    await renderAgeGate();

    const declineLink = screen.getByRole('button', { name: ageGateCopy.declineAction });
    const { minHeight } = StyleSheet.flatten(declineLink.props.style);
    expect(minHeight).toBeGreaterThanOrEqual(TouchTarget.minimum);
  });

  it('stores the confirmation on the device when the user confirms', async () => {
    await renderAgeGate();

    await fireEvent.press(screen.getByRole('button', { name: ageGateCopy.confirmAction }));

    expect(readDeviceState().ageConfirmedAt).toBe(confirmedAt);
  });

  it('keeps the user on the gate with an adults-only message when declining', async () => {
    await renderAgeGate();

    await fireEvent.press(screen.getByRole('button', { name: ageGateCopy.declineAction }));

    expect(screen.getByRole('alert')).toHaveTextContent(ageGateCopy.adultsOnlyMessage);
    expect(screen.getByRole('button', { name: ageGateCopy.confirmAction })).toBeTruthy();
    expect(Storage.getItemSync(deviceStateKey)).toBeNull();
  });

  it('can still confirm after a mistaken decline', async () => {
    await renderAgeGate();

    await fireEvent.press(screen.getByRole('button', { name: ageGateCopy.declineAction }));
    await fireEvent.press(screen.getByRole('button', { name: ageGateCopy.confirmAction }));

    expect(readDeviceState().ageConfirmedAt).toBe(confirmedAt);
  });
});

describe('age-gate route', () => {
  it('renders the age gate screen', async () => {
    await render(
      <DeviceStateProvider>
        <AgeGateRoute />
      </DeviceStateProvider>,
    );

    expect(screen.getByRole('header', { name: ageGateCopy.question })).toBeTruthy();
  });
});
