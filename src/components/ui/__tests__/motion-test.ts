import { Motion } from '@/constants/theme';

import { entranceFor, pressTravelDurationFor, springSettleMs } from '../motion';

describe('motion', () => {
  it('uses the spring entrance unless Reduce Motion is on', () => {
    expect(entranceFor(false)).toBe('spring');
    expect(entranceFor(true)).toBe('fade');
  });

  it('animates the press travel unless Reduce Motion is on', () => {
    expect(pressTravelDurationFor(false)).toBe(Motion.pressDurationMs);
    expect(pressTravelDurationFor(true)).toBe(0);
  });

  it('keeps the motion tokens of the design tokens', () => {
    expect(Motion).toMatchObject({
      pressDurationMs: 120,
      cardEnterMaxMs: 450,
      levelUpDurationMs: 600,
      reducedFadeMs: 200,
    });
  });

  it('settles the card spring within the card entrance limit', () => {
    expect(springSettleMs(Motion.cardSpring)).toBeLessThanOrEqual(Motion.cardEnterMaxMs);
  });

  it('settles the celebration spring in about the level-up duration', () => {
    expect(springSettleMs(Motion.celebrationSpring)).toBe(Motion.levelUpDurationMs);
  });

  it('gives both springs a small overshoot', () => {
    for (const spring of [Motion.cardSpring, Motion.celebrationSpring]) {
      expect(spring.dampingRatio).toBeGreaterThan(0);
      expect(spring.dampingRatio).toBeLessThan(1);
    }
  });
});
