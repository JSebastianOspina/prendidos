import type { Player } from '@/features/game';

import { avatarButtonLabel, levelsSummary, playerSummary, startButtonLabel } from '../copy';

const caro: Player = {
  id: 'p3',
  name: 'Caro',
  gender: 'female',
  drinks: true,
  avatarId: 'avatar-03',
};

describe('playerSummary', () => {
  it('shows the name and gender', () => {
    expect(playerSummary(caro, 3)).toBe('Caro · Mujer');
    expect(playerSummary({ ...caro, gender: 'male' }, 3)).toBe('Caro · Hombre');
  });

  it('leaves out an undisclosed gender', () => {
    expect(playerSummary({ ...caro, gender: 'undisclosed' }, 3)).toBe('Caro');
  });

  it('adds "No toma" for a player who does not drink', () => {
    expect(playerSummary({ ...caro, drinks: false }, 3)).toBe('Caro · Mujer · No toma');
  });

  it('names a blank player by position', () => {
    expect(playerSummary({ ...caro, name: '  ', gender: 'undisclosed' }, 4)).toBe('Jugador 4');
  });
});

describe('levelsSummary', () => {
  it('says "Los 3" when every level is selected', () => {
    expect(levelsSummary(['easy', 'medium', 'hard'])).toBe('Los 3');
  });

  it('lists the selected levels', () => {
    expect(levelsSummary(['hard'])).toBe('Prendido');
    expect(levelsSummary(['medium', 'hard'])).toBe('Picante y Prendido');
  });
});

describe('avatarButtonLabel', () => {
  it('uses the trimmed name, or the position while the name is blank', () => {
    expect(avatarButtonLabel(' Vale ', 1)).toBe('Cambiar avatar de Vale');
    expect(avatarButtonLabel('', 2)).toBe('Cambiar avatar del jugador 2');
  });
});

describe('startButtonLabel', () => {
  it('counts the players', () => {
    expect(startButtonLabel(5)).toBe('¡A jugar! · 5 jugadores');
  });
});
