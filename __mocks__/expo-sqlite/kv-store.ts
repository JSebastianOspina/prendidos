/** In-memory stand-in for `expo-sqlite/kv-store` in Jest (picked up automatically for node modules). */
const memoryStore = new Map<string, string>();

const Storage = {
  getItemSync: (key: string): string | null => memoryStore.get(key) ?? null,
  setItemSync: (key: string, value: string): void => {
    memoryStore.set(key, value);
  },
  removeItemSync: (key: string): boolean => memoryStore.delete(key),
  clearSync: (): boolean => {
    memoryStore.clear();
    return true;
  },
};

export default Storage;
