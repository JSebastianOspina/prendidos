import { routes } from '../routes';

describe('routes', () => {
  it('lists the Prendidos flow in order', () => {
    expect([
      routes.ageGate,
      routes.home,
      routes.newGame.mode,
      routes.newGame.category,
      routes.newGame.setup,
      routes.play,
      routes.results,
    ]).toEqual(['/age-gate', '/', '/new-game/mode', '/new-game/category', '/new-game/setup', '/play', '/results']);
  });
});
