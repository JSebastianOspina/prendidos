/**
 * Pure motion decisions shared by every animated component, so the Reduce Motion
 * branch is unit-tested without running animations (design tokens § Motion).
 */
import { Motion, SpringSettleFactor, type SpringToken } from '@/constants/theme';

export type EntranceKind = 'spring' | 'fade';

/** Under Reduce Motion every entrance becomes an opacity fade, with no movement or scaling. */
export function entranceFor(reduceMotion: boolean): EntranceKind {
  return reduceMotion ? 'fade' : 'spring';
}

/** Under Reduce Motion the press shows its sunk state at once. */
export function pressTravelDurationFor(reduceMotion: boolean): number {
  return reduceMotion ? 0 : Motion.pressDurationMs;
}

/** Time a duration-based spring takes to settle, in milliseconds. */
export function springSettleMs(spring: SpringToken): number {
  return spring.duration * SpringSettleFactor;
}
