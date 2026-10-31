/**
 * Interim brand art cropped from the AI drafts (docs/brand/README.md); replaced by vectors later.
 * Screens never import these files directly: they use `Mascot` and `PlayerAvatar`.
 */
import type { ImageProps } from 'expo-image';

import type { Difficulty } from '@/features/content/card-types';
import type { AvatarId } from '@/features/game/avatars';

/** A bundled PNG (`require`) as `expo-image` takes it. */
type BundledImage = ImageProps['source'];

export type MascotArtName = 'wink' | 'laugh' | 'relaxed' | 'smirk' | 'pointing' | 'icon';

/** `aspectRatio` is width / height; sizes are given by height. */
export const mascotArt: Record<
  MascotArtName,
  { source: BundledImage; label: string; aspectRatio: number }
> = {
  wink: {
    source: require('../../../assets/images/brand/mascot-face-wink.png'),
    label: 'Prendido, el gato, guiñando el ojo',
    aspectRatio: 1,
  },
  laugh: {
    source: require('../../../assets/images/brand/mascot-face-laugh.png'),
    label: 'Prendido, el gato, muerto de la risa',
    aspectRatio: 1,
  },
  relaxed: {
    source: require('../../../assets/images/brand/mascot-face-relaxed.png'),
    label: 'Prendido, el gato, relajado',
    aspectRatio: 1,
  },
  smirk: {
    source: require('../../../assets/images/brand/mascot-face-smirk.png'),
    label: 'Prendido, el gato, con mirada pícara',
    aspectRatio: 1,
  },
  pointing: {
    source: require('../../../assets/images/brand/mascot-pose-pointing.png'),
    label: 'Prendido, el gato, guiñando el ojo y señalando',
    aspectRatio: 569 / 768,
  },
  icon: {
    source: require('../../../assets/images/brand/mascot-icon-cat.png'),
    label: 'Prendido, el gato con la cabeza en llamas',
    aspectRatio: 1,
  },
};

/** Level-up face per level (design tokens § Flame by level). */
export const mascotForLevel: Record<Difficulty, MascotArtName> = {
  easy: 'relaxed',
  medium: 'smirk',
  hard: 'laugh',
};

export const avatarArt: Record<AvatarId, BundledImage> = {
  'avatar-01': require('../../../assets/images/brand/avatar-01.png'),
  'avatar-02': require('../../../assets/images/brand/avatar-02.png'),
  'avatar-03': require('../../../assets/images/brand/avatar-03.png'),
  'avatar-04': require('../../../assets/images/brand/avatar-04.png'),
  'avatar-05': require('../../../assets/images/brand/avatar-05.png'),
  'avatar-06': require('../../../assets/images/brand/avatar-06.png'),
  'avatar-07': require('../../../assets/images/brand/avatar-07.png'),
  'avatar-08': require('../../../assets/images/brand/avatar-08.png'),
  'avatar-09': require('../../../assets/images/brand/avatar-09.png'),
  'avatar-10': require('../../../assets/images/brand/avatar-10.png'),
  'avatar-11': require('../../../assets/images/brand/avatar-11.png'),
  'avatar-12': require('../../../assets/images/brand/avatar-12.png'),
};
