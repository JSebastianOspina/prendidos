/**
 * Web variant of the storage adapter (ADR-0001). Web is not a product target; this lets the
 * flow run in a browser without the expo-sqlite WebAssembly setup.
 */
import { parseDeviceState, serializeDeviceState, type DeviceState } from './device-state';

export const deviceStateKey = 'device.v1';

function webStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readDeviceState(): DeviceState {
  return parseDeviceState(webStorage()?.getItem(deviceStateKey) ?? null);
}

export function writeDeviceState(state: DeviceState): void {
  webStorage()?.setItem(deviceStateKey, serializeDeviceState(state));
}
