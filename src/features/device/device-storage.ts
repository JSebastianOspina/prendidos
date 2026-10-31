/** Storage adapter (ADR-0001). The only module that imports the storage library. */
import Storage from 'expo-sqlite/kv-store';

import { parseDeviceState, serializeDeviceState, type DeviceState } from './device-state';

/** Namespaced and versioned; bump the version and migrate when the shape changes. */
export const deviceStateKey = 'device.v1';

export function readDeviceState(): DeviceState {
  return parseDeviceState(Storage.getItemSync(deviceStateKey));
}

export function writeDeviceState(state: DeviceState): void {
  Storage.setItemSync(deviceStateKey, serializeDeviceState(state));
}
