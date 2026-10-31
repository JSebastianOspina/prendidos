/** Every user-facing string of the category screen (Colombian Spanish, usted). */
import type { GameMode } from '@/features/content/card-types';

export const categoryPickerCopy = {
  back: 'Volver',
  backSymbol: '‹',
  modes: {
    friends: {
      name: 'Amigos',
      subtitle: 'Elija una categoría. La partida arranca suave y se va calentando sola.',
    },
    couple: {
      name: 'Pareja',
      subtitle: 'Un plan coqueto para dos. Picante, sí; explícito, no.',
    },
  } satisfies Record<GameMode, { name: string; subtitle: string }>,
  /** Header chip for a mode with a fixed number of players. */
  playersChip: (players: number): string => `${players} jugadores`,
  cardCount: (cards: number): string => (cards === 1 ? '1 carta' : `${cards} cartas`),
  free: 'Gratis',
  playCategory: (categoryName: string): string => `Jugar ${categoryName}`,
  empty: 'Todavía no hay categorías para este modo. Vuelva y elija otro.',
} as const;
