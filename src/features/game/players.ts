import type { PlayerGender } from '@/features/content/card-types';

import type { Player } from './game-types';

export type NewPlayer = { name: string; gender: PlayerGender; drinks?: boolean };

/** A local player with a generated id; drinks unless told otherwise. */
export function createPlayer(newPlayer: NewPlayer, createId: () => string): Player {
  return { id: createId(), name: newPlayer.name.trim(), gender: newPlayer.gender, drinks: newPlayer.drinks ?? true };
}

/** Partner of the current player in couple mode: the other one of the two. */
export function partnerOf(players: readonly Player[], currentPlayerId: string): Player | undefined {
  return players.length === 2 ? players.find((player) => player.id !== currentPlayerId) : undefined;
}

export function createLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
