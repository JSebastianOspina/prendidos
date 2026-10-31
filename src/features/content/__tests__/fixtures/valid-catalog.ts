import type { Card, Category } from '../../card-types';

export const validCategories: Category[] = [
  {
    id: 'la-previa',
    name: 'La Previa',
    mode: 'friends',
    freeDifficulties: ['easy', 'medium', 'hard'],
  },
  {
    id: 'entre-dos',
    name: 'Entre Dos',
    mode: 'couple',
    freeDifficulties: ['easy'],
  },
];

export const validChallenge: Card = {
  id: 'prev-001',
  categoryId: 'la-previa',
  type: 'challenge',
  difficulty: 'medium',
  headline: 'Llegó {el divo|la diva|la estrella} de la noche',
  body: 'Durante una ronda le dice que sí a todo lo que le pidan, dentro de lo legal. El grupo decide cuándo se acaba.',
  points: 16,
  penalty: { drinks: 2, quip: 'por aguafiestas' },
  heat: 'standard',
  requiresConsent: false,
  reachesOutside: false,
};

export const validSpicyChallenge: Card = {
  id: 'prev-002',
  categoryId: 'la-previa',
  type: 'challenge',
  difficulty: 'hard',
  headline: 'Uyy pana, de malas',
  body: 'El grupo escoge: su ex o su crush. Llámele en altavoz y pregúntele qué fue lo primero que le gustó de usted.',
  points: 27,
  penalty: { drinks: 3, quip: 'por arrugarse' },
  heat: 'spicy',
  requiresConsent: false,
  reachesOutside: true,
  sourceLegacyId: 'B8530F01',
};

export const validTruth: Card = {
  id: 'dos-001',
  categoryId: 'entre-dos',
  type: 'truth',
  difficulty: 'easy',
  headline: 'Historytime',
  body: '¿Qué fue lo primero que pensó de {partner} cuando se conocieron?',
  points: 4,
  penalty: { drinks: 1 },
  heat: 'standard',
  requiresConsent: false,
  reachesOutside: false,
  illustration: 'mascot-glasses-reading',
};

export const validGroupCard: Card = {
  id: 'prev-003',
  categoryId: 'la-previa',
  type: 'neverHaveIEver',
  difficulty: 'easy',
  body: '…he llegado a una fiesta solo por la picada.',
  heat: 'standard',
  requiresConsent: false,
  reachesOutside: false,
};

export const validEveryoneWhoCard: Card = {
  id: 'prev-004',
  categoryId: 'la-previa',
  type: 'everyoneWho',
  difficulty: 'medium',
  headline: '¡Todos!',
  body: 'Los que le hayan escrito a un ex este mes.',
  heat: 'spicy',
  requiresConsent: false,
  reachesOutside: false,
  targetGender: 'female',
};

export const validCards: Card[] = [
  validChallenge,
  validSpicyChallenge,
  validTruth,
  validGroupCard,
  validEveryoneWhoCard,
];
