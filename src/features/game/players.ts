import type { PlayerGender } from '@/features/content/card-types';

import { pickFreeAvatar, type AvatarId } from './avatars';
import type { Player } from './game-types';

export type NewPlayer = {
  name: string;
  gender: PlayerGender;
  drinks?: boolean;
  avatarId?: AvatarId;
};

/**
 * A local player with a generated id; drinks unless told otherwise, and gets the first avatar
 * not in `takenAvatars` unless one is given.
 */
export function createPlayer(
  newPlayer: NewPlayer,
  createId: () => string,
  takenAvatars: readonly AvatarId[] = [],
): Player {
  return {
    id: createId(),
    name: newPlayer.name.trim(),
    gender: newPlayer.gender,
    drinks: newPlayer.drinks ?? true,
    avatarId: newPlayer.avatarId ?? pickFreeAvatar(takenAvatars),
  };
}

/** Partner of the current player in couple mode: the other one of the two. */
export function partnerOf(players: readonly Player[], currentPlayerId: string): Player | undefined {
  return players.length === 2 ? players.find((player) => player.id !== currentPlayerId) : undefined;
}

export function createLocalId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
