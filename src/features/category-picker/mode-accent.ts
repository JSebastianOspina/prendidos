import { Colors } from '@/constants/theme';
import type { GameMode } from '@/features/content/card-types';

/** Amigos wears the flame accent; Pareja wears the pink couple accent. */
export const accentByMode: Record<GameMode, string> = {
  friends: Colors.primary,
  couple: Colors.couple,
};
