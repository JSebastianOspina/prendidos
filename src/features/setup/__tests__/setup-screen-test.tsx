import { fireEvent, render, screen } from '@testing-library/react-native';
import Storage from 'expo-sqlite/kv-store';
import { router } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Text } from 'react-native';

import { repeatedPressWindowMs } from '@/components/ui/button';

import type { GameMode } from '@/features/content/card-types';
import { validCards, validCategories } from '@/features/content/__tests__/fixtures/valid-catalog';
import { DeviceStateProvider } from '@/features/device/device-state-provider';
import { deviceStateKey, readDeviceState } from '@/features/device/device-storage';
import { GameProvider, NewGameDraftProvider, useNewGameDraft, type Player } from '@/features/game';
import { routes } from '@/features/navigation/routes';

import { SetupScreen } from '../setup-screen';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: jest.fn() },
}));

const ana: Player = {
  id: 'p1',
  name: 'Ana',
  gender: 'female',
  drinks: true,
  avatarId: 'avatar-01',
};
const beto: Player = {
  id: 'p2',
  name: 'Beto',
  gender: 'male',
  drinks: true,
  avatarId: 'avatar-02',
};
const cami: Player = {
  id: 'p3',
  name: 'Cami',
  gender: 'undisclosed',
  drinks: false,
  avatarId: 'avatar-03',
};
const caro: Player = {
  id: 'p4',
  name: 'Caro',
  gender: 'female',
  drinks: true,
  avatarId: 'avatar-04',
};

const categoryByMode: Record<GameMode, string> = { friends: 'la-previa', couple: 'entre-dos' };

/** Chooses mode and category as HU-03 would, then shows the setup. */
function ChosenDraft({ mode, children }: { mode?: GameMode; children: ReactNode }) {
  const draft = useNewGameDraft();
  const { setMode, setCategoryId } = draft;
  const chosen = useRef(false);
  const [wasReady, setWasReady] = useState(false);
  // Draft setters are new on every render, so choose only once.
  useEffect(() => {
    if (!mode || chosen.current) return;
    chosen.current = true;
    setMode(mode);
    setCategoryId(categoryByMode[mode]);
  }, [mode, setMode, setCategoryId]);
  if (draft.isReadyForSetup && !wasReady) setWasReady(true);
  if (mode && !wasReady) return null;
  return (
    <>
      {children}
      {/* Simulates another screen (e.g. the ranking) resetting the draft. */}
      <Text accessibilityRole="button" onPress={draft.reset}>
        Reset draft
      </Text>
    </>
  );
}

/** The shared Button ignores repeated presses within a short window; move the clock past it. */
function advanceClockPastRepeatedPressWindow() {
  clock += repeatedPressWindowMs + 1;
}

let clock = 1_000_000;

function rememberPlayers(players: Player[]) {
  Storage.setItemSync(
    deviceStateKey,
    JSON.stringify({ lastPlayers: players, seenCardIds: [], lastSpicyEnabled: false }),
  );
}

const coupleOnlyCategories = validCategories.filter((category) => category.mode === 'couple');

async function renderSetup(
  /** `null` leaves mode and category unchosen. */
  mode: GameMode | null = 'friends',
  random = () => 0,
  categories = validCategories,
) {
  await render(
    <DeviceStateProvider now={() => '2026-10-31T20:00:00.000Z'}>
      <GameProvider catalog={{ categories, cards: validCards }}>
        <NewGameDraftProvider>
          <ChosenDraft mode={mode ?? undefined}>
            <SetupScreen random={random} />
          </ChosenDraft>
        </NewGameDraftProvider>
      </GameProvider>
    </DeviceStateProvider>,
  );
}

/** Names in the expanded rows (collapsed rows have no name field). */
function shownNames(): string[] {
  return screen
    .getAllByLabelText(/^Nombre del jugador \d+$/)
    .map((input) => input.props.value as string);
}

function isChecked(element: { props: { accessibilityState?: { checked?: boolean } } }) {
  return element.props.accessibilityState?.checked === true;
}

function startButton() {
  return screen.getByRole('button', { name: /^¡A jugar! · \d+ jugadores$/ });
}

beforeEach(() => {
  Storage.clearSync();
  jest.clearAllMocks();
  jest.spyOn(Date, 'now').mockImplementation(() => clock);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('SetupScreen header', () => {
  it('shows the category as eyebrow and the title', async () => {
    await renderSetup();
    expect(screen.getByText('La Previa')).toBeTruthy();
    expect(screen.getByRole('header', { name: '¿Quiénes juegan?' })).toBeTruthy();
  });

  it('goes back when there is a previous screen', async () => {
    jest.mocked(router.canGoBack).mockReturnValue(true);
    await renderSetup();
    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));
    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('opens the category screen when there is nothing behind', async () => {
    jest.mocked(router.canGoBack).mockReturnValue(false);
    await renderSetup();
    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));
    expect(router.replace).toHaveBeenCalledWith(routes.newGame.category);
  });
});

describe('SetupScreen players', () => {
  it('preloads the last players with gender and "No toma"', async () => {
    rememberPlayers([ana, beto, cami]);
    await renderSetup();
    expect(shownNames()).toEqual(['Ana', 'Beto']);
    expect(isChecked(screen.getByRole('radio', { name: 'Mujer, jugador 1' }))).toBe(true);
    expect(isChecked(screen.getByRole('radio', { name: 'Hombre, jugador 2' }))).toBe(true);
    expect(isChecked(screen.getByRole('checkbox', { name: 'No toma, jugador 1' }))).toBe(false);
    expect(screen.getByText('Cami · No toma')).toBeTruthy();
  });

  it('shows two empty rows on first use', async () => {
    await renderSetup();
    expect(shownNames()).toEqual(['', '']);
    expect(screen.getByRole('button', { name: 'Cambiar avatar del jugador 1' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Quitar/ })).toBeNull();
    expect(startButton().props.accessibilityLabel).toBe('¡A jugar! · 2 jugadores');
  });

  it('shows exactly the first two players in couple mode, without add or remove', async () => {
    rememberPlayers([ana, beto, cami]);
    await renderSetup('couple');
    expect(shownNames()).toEqual(['Ana', 'Beto']);
    expect(screen.queryByText('Cami · No toma')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Agregar jugador' })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Quitar/ })).toBeNull();
  });

  it('sends the user to Inicio when mode or category is missing', async () => {
    await renderSetup(null);
    expect(router.replace).toHaveBeenCalledWith(routes.home);
    expect(screen.queryByRole('button', { name: /^¡A jugar!/ })).toBeNull();
  });

  it('does not redirect when the draft is reset while setup sits under another screen', async () => {
    await renderSetup();
    await fireEvent.press(screen.getByRole('button', { name: 'Reset draft' }));
    expect(router.replace).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /^¡A jugar!/ })).toBeNull();
  });

  it('adds players up to 12 and removes them down to 2', async () => {
    await renderSetup();
    await fireEvent.press(screen.getByRole('button', { name: 'Agregar jugador' }));
    expect(shownNames()).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: /^Quitar al jugador/ })).toHaveLength(3);
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar al jugador 2' }));
    expect(shownNames()).toHaveLength(2);
    for (let count = 2; count < 12; count += 1) {
      await fireEvent.press(screen.getByRole('button', { name: 'Agregar jugador' }));
    }
    expect(screen.getAllByRole('button', { name: /^Quitar al jugador/ })).toHaveLength(12);
    expect(startButton().props.accessibilityLabel).toBe('¡A jugar! · 12 jugadores');
    expect(screen.queryByRole('button', { name: 'Agregar jugador' })).toBeNull();
  });

  it('removes a player from a collapsed row', async () => {
    rememberPlayers([ana, beto, caro]);
    await renderSetup();
    await fireEvent.press(screen.getByRole('button', { name: 'Quitar al jugador 3' }));
    expect(screen.queryByText('Caro · Mujer')).toBeNull();
    expect(screen.queryByRole('button', { name: /^Quitar/ })).toBeNull();
  });

  it('edits name, gender, and "No toma"', async () => {
    await renderSetup();
    await fireEvent.changeText(screen.getByLabelText('Nombre del jugador 1'), 'Dani');
    await fireEvent.press(screen.getByRole('radio', { name: 'Hombre, jugador 1' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'No toma, jugador 1' }));
    expect(shownNames()[0]).toBe('Dani');
    expect(screen.getByRole('button', { name: 'Cambiar avatar de Dani' })).toBeTruthy();
    expect(isChecked(screen.getByRole('radio', { name: 'Hombre, jugador 1' }))).toBe(true);
    expect(isChecked(screen.getByRole('radio', { name: 'Prefiero no decir, jugador 1' }))).toBe(
      false,
    );
    expect(isChecked(screen.getByRole('checkbox', { name: 'No toma, jugador 1' }))).toBe(true);
  });

  it('limits names to 20 characters', async () => {
    await renderSetup();
    expect(screen.getByLabelText('Nombre del jugador 1').props.maxLength).toBe(20);
  });
});

describe('SetupScreen avatars', () => {
  it('moves a player to the next free avatar', async () => {
    rememberPlayers([ana, beto]);
    await renderSetup();
    await fireEvent.press(screen.getByRole('button', { name: 'Cambiar avatar de Ana' }));
    await fireEvent.press(startButton());
    expect(
      readDeviceState().activeSession?.settings.players.map((player) => player.avatarId),
    ).toEqual(['avatar-03', 'avatar-02']);
  });
});

describe('SetupScreen collapsed rows', () => {
  it('collapses rows from the third player on and expands one on tap', async () => {
    rememberPlayers([ana, beto, caro]);
    await renderSetup();
    expect(screen.queryByLabelText('Nombre del jugador 3')).toBeNull();
    expect(screen.getByText('Caro · Mujer')).toBeTruthy();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Editar al jugador 3: Caro · Mujer' }),
    );
    expect(shownNames()).toEqual(['Ana', 'Beto', 'Caro']);
    expect(isChecked(screen.getByRole('radio', { name: 'Mujer, jugador 3' }))).toBe(true);
  });

  it('keeps only one later row open: a new player opens and the previous one collapses', async () => {
    rememberPlayers([ana, beto, caro]);
    await renderSetup();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Editar al jugador 3: Caro · Mujer' }),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Agregar jugador' }));
    expect(screen.queryByLabelText('Nombre del jugador 3')).toBeNull();
    expect(screen.getByLabelText('Nombre del jugador 4')).toBeTruthy();
  });

  it('says which collapsed row misses a name after a start attempt', async () => {
    rememberPlayers([ana, beto, { ...caro, name: ' ' }]);
    await renderSetup();
    expect(screen.getByText('Jugador 3 · Mujer')).toBeTruthy();
    await fireEvent.press(startButton());
    expect(screen.getAllByText('Falta el nombre')).toHaveLength(1);
    expect(readDeviceState().activeSession).toBeUndefined();
  });
});

describe('SetupScreen start', () => {
  it('blocks the start and says which rows miss a name', async () => {
    rememberPlayers([ana, { ...beto, name: '  ' }]);
    await renderSetup();
    expect(screen.queryByText('Falta el nombre')).toBeNull();
    await fireEvent.press(startButton());
    expect(screen.getAllByText('Falta el nombre')).toHaveLength(1);
    expect(screen.getByText('Escriba el nombre de cada jugador para empezar.')).toBeTruthy();
    expect(readDeviceState().activeSession).toBeUndefined();
    expect(router.push).not.toHaveBeenCalled();
  });

  it('starts with the shown order, levels, end condition, and remembers the players', async () => {
    rememberPlayers([{ ...ana, name: ' Ana ' }, beto, cami]);
    await renderSetup('friends', () => 0);
    await fireEvent.press(
      screen.getByRole('button', { name: 'Barajar el orden de los jugadores' }),
    );
    expect(shownNames()).toEqual(['Beto', 'Cami']);
    expect(screen.getByText('Ana · Mujer')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Niveles: Los 3' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Suave' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Fin de la partida: 10 rondas' }));
    await fireEvent.press(screen.getByRole('radio', { name: '200 puntos' }));
    advanceClockPastRepeatedPressWindow();
    await fireEvent.press(startButton());

    // The started game is saved as the resumable session.
    const settings = readDeviceState().activeSession?.settings;
    expect(settings?.players.map((player) => player.name)).toEqual(['Beto', 'Cami', 'Ana']);
    expect(settings?.selectedDifficulties).toEqual(['medium', 'hard']);
    expect(settings?.endCondition).toEqual({ type: 'points', target: 200 });
    expect(router.push).toHaveBeenCalledWith(routes.play);
    expect(readDeviceState().lastPlayers.map((player) => player.name)).toEqual([
      'Beto',
      'Cami',
      'Ana',
    ]);
  });

  it('shows a generic message when the game cannot start for another reason', async () => {
    rememberPlayers([ana, beto]);
    // The catalog lacks the chosen friends category, so the engine refuses to start.
    await renderSetup('friends', () => 0, coupleOnlyCategories);
    await fireEvent.press(startButton());
    expect(
      screen.getByText('No se pudo empezar la partida. Vuelva y elija otra categoría.'),
    ).toBeTruthy();
    expect(router.push).not.toHaveBeenCalled();
  });
});

describe('SetupScreen options', () => {
  it('shows FIN, NIVELES, and ORDEN as summary chips with the lists closed', async () => {
    await renderSetup();
    expect(screen.getByText('10 rondas')).toBeTruthy();
    expect(screen.getByText('Los 3')).toBeTruthy();
    expect(screen.getByText('Barajar')).toBeTruthy();
    expect(screen.queryByRole('radio', { name: '10 rondas' })).toBeNull();
    expect(screen.queryByRole('checkbox', { name: 'Suave' })).toBeNull();
  });

  it('selects all levels by default and never deselects the last one', async () => {
    await renderSetup();
    await fireEvent.press(screen.getByRole('button', { name: 'Niveles: Los 3' }));
    for (const name of ['Suave', 'Picante', 'Prendido']) {
      expect(isChecked(screen.getByRole('checkbox', { name }))).toBe(true);
    }
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Suave' }));
    expect(screen.getByRole('button', { name: 'Niveles: Picante y Prendido' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Picante' }));
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Prendido' }));
    expect(isChecked(screen.getByRole('checkbox', { name: 'Suave' }))).toBe(false);
    expect(isChecked(screen.getByRole('checkbox', { name: 'Prendido' }))).toBe(true);
  });

  it('defaults to 10 rounds and offers every end condition', async () => {
    await renderSetup();
    await fireEvent.press(screen.getByRole('button', { name: 'Fin de la partida: 10 rondas' }));
    expect(isChecked(screen.getByRole('radio', { name: '10 rondas' }))).toBe(true);
    for (const name of ['5 rondas', '15 rondas', '20 rondas', '100 puntos', '300 puntos']) {
      expect(isChecked(screen.getByRole('radio', { name }))).toBe(false);
    }
    await fireEvent.press(screen.getByRole('radio', { name: 'Abierta' }));
    expect(isChecked(screen.getByRole('radio', { name: 'Abierta' }))).toBe(true);
    expect(isChecked(screen.getByRole('radio', { name: '10 rondas' }))).toBe(false);
    expect(screen.getByRole('button', { name: 'Fin de la partida: Abierta' })).toBeTruthy();
  });

  it('opens one list at a time and closes it on a second tap', async () => {
    await renderSetup();
    const endChip = () => screen.getByRole('button', { name: /^Fin de la partida:/ });
    await fireEvent.press(endChip());
    expect(endChip().props.accessibilityState).toMatchObject({ expanded: true });
    await fireEvent.press(screen.getByRole('button', { name: 'Niveles: Los 3' }));
    expect(screen.queryByRole('radio', { name: '10 rondas' })).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Suave' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Niveles: Los 3' }));
    expect(screen.queryByRole('checkbox', { name: 'Suave' })).toBeNull();
  });

  it('shows no Sin Filtro control yet', async () => {
    await renderSetup();
    expect(screen.queryByText(/Sin Filtro/)).toBeNull();
  });
});
