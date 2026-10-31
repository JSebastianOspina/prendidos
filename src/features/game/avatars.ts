/** Player avatars (docs/brand/README.md § Player Avatars). Ids are stable; the art lives in the UI layer. */
export const avatarIds = [
  'avatar-01',
  'avatar-02',
  'avatar-03',
  'avatar-04',
  'avatar-05',
  'avatar-06',
  'avatar-07',
  'avatar-08',
  'avatar-09',
  'avatar-10',
  'avatar-11',
  'avatar-12',
] as const;

export type AvatarId = (typeof avatarIds)[number];

/** First avatar in brand order that nobody has; the first one once all 12 are taken. */
export function pickFreeAvatar(taken: readonly AvatarId[]): AvatarId {
  return avatarIds.find((id) => !taken.includes(id)) ?? avatarIds[0];
}

/** Next avatar after `current` (wrapping) that no other player has; `current` if none is free. */
export function nextFreeAvatar(current: AvatarId, takenByOthers: readonly AvatarId[]): AvatarId {
  const start = avatarIds.indexOf(current);
  for (let step = 1; step < avatarIds.length; step += 1) {
    const candidate = avatarIds[(start + step) % avatarIds.length];
    if (!takenByOthers.includes(candidate)) return candidate;
  }
  return current;
}
