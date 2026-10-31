/** The pointing pose is shown about this tall on a regular phone (proposal board 01). */
export const maximumMascotHeight = 240;

/** Below this the cat's face and gesture stop reading. */
export const minimumMascotHeight = 140;

/** Share of the window height the mascot takes before it hits a bound. */
const mascotShareOfWindowHeight = 0.28;

/**
 * Mascot height for the age gate: smaller on short screens so the question stays near the top
 * once the fixed footer (confirm, decline link, footnote) is in place.
 */
export function mascotHeightFor(windowHeight: number): number {
  const proportionalHeight = Math.round(windowHeight * mascotShareOfWindowHeight);
  return Math.min(maximumMascotHeight, Math.max(minimumMascotHeight, proportionalHeight));
}
