import { fireEvent, render, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';

import AgeGateRoute from '@/app/age-gate';
import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { deviceStateKey, readDeviceState } from '@/features/device/device-storage';

import { ageGateCopy } from '../age-gate-copy';
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
  it('shows the brand, the question, the notice, and both actions', async () => {
    await renderAgeGate();

    expect(screen.getByText(ageGateCopy.wordmark)).toBeTruthy();
    expect(screen.getByRole('header', { name: ageGateCopy.question })).toBeTruthy();
    expect(screen.getByText(ageGateCopy.responsibleDrinkingNotice)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Soy mayor de 18 años' })).toBeTruthy();
    expect(screen.getByRole('button', { name: ageGateCopy.declineAction })).toBeTruthy();
    expect(screen.queryByText(ageGateCopy.adultsOnlyMessage)).toBeNull();
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
