import { routes } from '../routes';

describe('routes', () => {
  it('lists the Prendidos flow in order', () => {
    expect([
      routes.ageGate,
      routes.home,
      routes.newGame.category,
      routes.newGame.setup,
      routes.play,
      routes.results,
    ]).toEqual([
      '/age-gate',
      '/',
      '/new-game/category',
      '/new-game/setup',
      '/play',
      '/results',
    ]);
  });

  it('has no separate mode screen: the mode is chosen on Inicio', () => {
    expect(routes.newGame).not.toHaveProperty('mode');
  });
});
