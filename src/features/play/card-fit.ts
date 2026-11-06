import { CardTextSteps } from '@/constants/theme';

import { illustrationHeightFor } from './illustration-fit';

/** Index into `CardTextSteps`; 0 is the largest body size. */
export type BodyStep = number;

/**
 * How the turn card fits the visible area (design D13):
 * - `fitting`: the body steps down while the card overflows;
 * - `artTrial`: the card fit at `fitStep` without room for its illustration, so it tries one
 *   smaller size to give the illustration at least 72 pt;
 * - `settled`: final for this card (it only steps down again if the card later overflows).
 */
export type CardFitState =
  | { phase: 'fitting'; step: BodyStep }
  | { phase: 'artTrial'; step: BodyStep; fitStep: BodyStep }
  | { phase: 'settled'; step: BodyStep };

export const initialCardFit: CardFitState = { phase: 'fitting', step: 0 };

const smallestBodyStep: BodyStep = CardTextSteps.length - 1;

function smallerStep(step: BodyStep): BodyStep | null {
  return step < smallestBodyStep ? step + 1 : null;
}

/**
 * Next fit after a layout of the illustration slot, whose height is the free space under the
 * text (0 when the card overflows). It only ever tries one extra step per card and never goes
 * below the smallest size, so it cannot oscillate.
 */
export function nextCardFit(
  state: CardFitState,
  slotHeight: number,
  hasIllustration: boolean,
): CardFitState {
  const overflows = slotHeight <= 0;
  const artFits = illustrationHeightFor(slotHeight) !== null;

  switch (state.phase) {
    case 'fitting': {
      const smaller = smallerStep(state.step);
      if (overflows) {
        return smaller === null ? { phase: 'settled', step: state.step } : { phase: 'fitting', step: smaller };
      }
      if (hasIllustration && !artFits && smaller !== null) {
        return { phase: 'artTrial', step: smaller, fitStep: state.step };
      }
      return { phase: 'settled', step: state.step };
    }
    case 'artTrial':
      return { phase: 'settled', step: artFits ? state.step : state.fitStep };
    case 'settled': {
      const smaller = smallerStep(state.step);
      return overflows && smaller !== null ? { phase: 'settled', step: smaller } : state;
    }
  }
}
