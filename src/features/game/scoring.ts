/** Points lost when refusing an individual card: half its points, rounded up (7 → 4). */
export function refusalPenaltyPoints(points: number): number {
  return Math.ceil(points / 2);
}
