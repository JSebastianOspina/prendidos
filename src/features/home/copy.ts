import type { GameMode } from '@/features/content/card-types';

/** User-facing copy for the Inicio screen (Colombian Spanish, usted). */
export const homeCopy = {
  wordmark: 'Prendidos',
  modeQuestion: '¿Con quién va a jugar hoy?',
  modes: {
    friends: {
      title: 'Amigos',
      subtitle: 'De 2 a 12 · retos, verdades y “Yo nunca”',
    },
    couple: {
      title: 'Pareja',
      subtitle: 'Solo ustedes dos · coqueto, no explícito',
    },
  } satisfies Record<GameMode, { title: string; subtitle: string }>,
  moderation: 'Tome con moderación. Si tomó, no maneje.',
} as const;
