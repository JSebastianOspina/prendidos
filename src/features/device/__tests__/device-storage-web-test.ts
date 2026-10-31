import { emptyDeviceState } from '../device-state';
import { deviceStateKey, readDeviceState, writeDeviceState } from '../device-storage.web';

describe('web device storage', () => {
  const originalDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

  afterEach(() => {
    if (originalDescriptor) Object.defineProperty(globalThis, 'localStorage', originalDescriptor);
    else delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it('round-trips through localStorage under the versioned key', () => {
    const memory = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => memory.get(key) ?? null,
        setItem: (key: string, value: string) => memory.set(key, value),
      },
    });
    writeDeviceState({ ...emptyDeviceState, lastSpicyEnabled: true });
    expect(memory.has(deviceStateKey)).toBe(true);
    expect(readDeviceState().lastSpicyEnabled).toBe(true);
  });

  it('falls back to the empty state when storage is unavailable', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('blocked');
      },
    });
    expect(readDeviceState()).toEqual(emptyDeviceState);
    expect(() => writeDeviceState(emptyDeviceState)).not.toThrow();
  });
});
