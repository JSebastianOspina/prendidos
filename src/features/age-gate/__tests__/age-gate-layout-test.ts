import { mascotHeightFor, maximumMascotHeight, minimumMascotHeight } from '../age-gate-layout';

describe('mascotHeightFor', () => {
  it('keeps the mascot near 240 pt on a 390 × 844 phone', () => {
    expect(mascotHeightFor(844)).toBe(236);
  });

  it('shrinks the mascot on a 375 × 667 phone', () => {
    expect(mascotHeightFor(667)).toBe(187);
    expect(mascotHeightFor(667)).toBeLessThan(mascotHeightFor(844));
  });

  it('never grows past the maximum on tall screens', () => {
    expect(mascotHeightFor(1400)).toBe(maximumMascotHeight);
  });

  it('never shrinks under the minimum on very short screens', () => {
    expect(mascotHeightFor(320)).toBe(minimumMascotHeight);
  });
});
