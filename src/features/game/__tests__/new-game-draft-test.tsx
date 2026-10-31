import { act, renderHook } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import type { ReactNode } from 'react';

import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { deviceStateKey } from '@/features/device/device-storage';

import { NewGameDraftProvider, useNewGameDraft } from '../new-game-draft';
import { ana, beto } from './fixtures/game-fixtures';

function wrapper({ children }: { children: ReactNode }) {
  return (
    <DeviceStateProvider>
      <NewGameDraftProvider>{children}</NewGameDraftProvider>
    </DeviceStateProvider>
  );
}

beforeEach(() => Storage.clearSync());

describe('useNewGameDraft', () => {
  it('preloads the last players and Sin Filtro choice with default options', async () => {
    Storage.setItemSync(
      deviceStateKey,
      JSON.stringify({ lastPlayers: [ana, beto], seenCardIds: [], lastSpicyEnabled: true }),
    );
    const { result } = await renderHook(() => useNewGameDraft(), { wrapper });
    expect(result.current.players).toEqual([ana, beto]);
    expect(result.current.spicyEnabled).toBe(true);
    expect(result.current.selectedDifficulties).toEqual(['easy', 'medium', 'hard']);
    expect(result.current.endCondition).toEqual({ type: 'rounds', rounds: 10 });
    expect(result.current.isReadyForSetup).toBe(false);
  });

  it('builds complete settings once mode and category are chosen', async () => {
    const { result } = await renderHook(() => useNewGameDraft(), { wrapper });
    expect(() => result.current.toSettings()).toThrow('Choose a mode');
    await act(() => {
      result.current.setMode('friends');
      result.current.setCategoryId('la-previa');
      result.current.setPlayers([ana, beto]);
      result.current.setSelectedDifficulties(['hard']);
      result.current.setEndCondition({ type: 'points', target: 200 });
      result.current.setSpicyEnabled(true);
    });
    expect(result.current.isReadyForSetup).toBe(true);
    expect(result.current.toSettings()).toEqual({
      mode: 'friends',
      categoryId: 'la-previa',
      players: [ana, beto],
      selectedDifficulties: ['hard'],
      endCondition: { type: 'points', target: 200 },
      spicyEnabled: true,
    });
  });

  it('clears the category on a mode change and keeps Sin Filtro off in couple mode', async () => {
    const { result } = await renderHook(() => useNewGameDraft(), { wrapper });
    await act(() => {
      result.current.setMode('friends');
      result.current.setCategoryId('la-previa');
      result.current.setSpicyEnabled(true);
    });
    await act(() => result.current.setMode('friends'));
    expect(result.current.categoryId).toBe('la-previa');
    await act(() => result.current.setMode('couple'));
    expect(result.current.categoryId).toBeUndefined();
    expect(result.current.spicyEnabled).toBe(false);
    await act(() => {
      result.current.setCategoryId('entre-dos');
      result.current.setSpicyEnabled(true);
    });
    expect(result.current.toSettings().spicyEnabled).toBe(false);
    await act(() => result.current.reset());
    expect(result.current.mode).toBeUndefined();
  });

  it('fails loudly outside the provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(renderHook(() => useNewGameDraft())).rejects.toThrow('NewGameDraftProvider');
  });
});
