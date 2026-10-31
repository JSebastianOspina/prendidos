/** Every user-facing string of the mode and category screens (Colombian Spanish, usted). */
import type { GameMode } from '@/features/content/card-types';
import { playerLimitsByMode } from '@/features/game';

/** "Solo 2 jugadores" when the mode has a fixed count, else "De 2 a 12 jugadores". */
export function playerRangeLabel(mode: GameMode): string {
  const { min, max } = playerLimitsByMode[mode];
  return min === max ? `Solo ${max} jugadores` : `De ${min} a ${max} jugadores`;
}

export const categoryPickerCopy = {
  back: 'Volver',
  backSymbol: '‹',
  mode: {
    title: '¿Con quién va a jugar?',
    subtitle: 'Elija el modo y le mostramos las categorías que le van.',
  },
  modes: {
    friends: {
      name: 'Amigos',
      tone: 'Retos, verdades y cartas para todo el parche.',
    },
    couple: {
      name: 'Pareja',
      tone: 'Coqueto y picante, sin pasarse de la raya.',
    },
  } satisfies Record<GameMode, { name: string; tone: string }>,
  category: {
    title: 'Elija la categoría',
    subtitleForMode: (mode: GameMode): string => `Modo ${categoryPickerCopy.modes[mode].name}`,
    empty: 'Todavía no hay categorías para este modo. Vuelva y elija otro.',
  },
} as const;
