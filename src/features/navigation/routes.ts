/** Every route of the Prendidos flow. Screens navigate with these, never with literal paths. */
export const routes = {
  ageGate: '/age-gate',
  home: '/',
  newGame: {
    mode: '/new-game/mode',
    category: '/new-game/category',
    setup: '/new-game/setup',
  },
  play: '/play',
  results: '/results',
} as const;
