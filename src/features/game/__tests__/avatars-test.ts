import { avatarIds, nextFreeAvatar, pickFreeAvatar } from '../avatars';

describe('avatar registry', () => {
  it('lists the 12 avatars in brand order', () => {
    expect(avatarIds).toHaveLength(12);
    expect(avatarIds[0]).toBe('avatar-01');
    expect(avatarIds[11]).toBe('avatar-12');
  });

  it('picks the first avatar nobody has', () => {
    expect(pickFreeAvatar([])).toBe('avatar-01');
    expect(pickFreeAvatar(['avatar-01', 'avatar-02'])).toBe('avatar-03');
  });

  it('falls back to the first avatar when all 12 are taken', () => {
    expect(pickFreeAvatar(avatarIds)).toBe('avatar-01');
  });

  it('moves to the next avatar nobody else has, skipping taken ones', () => {
    expect(nextFreeAvatar('avatar-03', ['avatar-04'])).toBe('avatar-05');
    expect(nextFreeAvatar('avatar-03', [])).toBe('avatar-04');
  });

  it('wraps around after the last avatar', () => {
    expect(nextFreeAvatar('avatar-12', ['avatar-01'])).toBe('avatar-02');
  });

  it('keeps the current avatar when every other one is taken', () => {
    const others = avatarIds.filter((id) => id !== 'avatar-05');
    expect(nextFreeAvatar('avatar-05', others)).toBe('avatar-05');
  });
});
