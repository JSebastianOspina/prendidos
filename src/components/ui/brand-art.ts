/**
 * Interim brand art cropped from the AI drafts (docs/brand/README.md); replaced by vectors later.
 * Screens never import these files directly: they use `Mascot`, `PlayerAvatar`, and `CardIllustration`.
 */
import type { ImageProps } from 'expo-image';

import type { Difficulty, IllustrationKey } from '@/features/content/card-types';
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

/**
 * Card illustration library art (docs/brand/README.md § Card Illustration Library).
 * Typed by the key set, so a key without art is a type error. Decorative: no label.
 */
export const cardIllustrationArt: Record<
  IllustrationKey,
  { source: BundledImage; aspectRatio: number }
> = {
  'mascot-wink': { source: mascotArt.wink.source, aspectRatio: mascotArt.wink.aspectRatio },
  'mascot-relaxed': { source: mascotArt.relaxed.source, aspectRatio: mascotArt.relaxed.aspectRatio },
  'mascot-smirk': { source: mascotArt.smirk.source, aspectRatio: mascotArt.smirk.aspectRatio },
  'mascot-laugh': { source: mascotArt.laugh.source, aspectRatio: mascotArt.laugh.aspectRatio },
  'mascot-pointing': { source: mascotArt.pointing.source, aspectRatio: mascotArt.pointing.aspectRatio },
  'mascot-surprised': {
    source: require('../../../assets/images/brand/card-mascot-surprised.png'),
    aspectRatio: 1,
  },  'mascot-monocle': {
    source: require('../../../assets/images/brand/card-mascot-monocle.png'),
    aspectRatio: 1,
  },
  'mascot-reading-book': {
    source: require('../../../assets/images/brand/card-mascot-reading-book.png'),
    aspectRatio: 398 / 384,
  },
  'mascot-crying': {
    source: require('../../../assets/images/brand/card-mascot-crying.png'),
    aspectRatio: 1,
  },
  'mascot-sad-map-pin': {
    source: require('../../../assets/images/brand/card-mascot-sad-map-pin.png'),
    aspectRatio: 419 / 348,
  },
  'mascot-blowing-kiss': {
    source: require('../../../assets/images/brand/card-mascot-blowing-kiss.png'),
    aspectRatio: 1,
  },
  'mascot-sunglasses': {
    source: require('../../../assets/images/brand/card-mascot-sunglasses.png'),
    aspectRatio: 1,
  },
  'mascot-dancing': {
    source: require('../../../assets/images/brand/card-mascot-dancing.png'),
    aspectRatio: 348 / 384,
  },
  'mascot-tongue-out': {
    source: require('../../../assets/images/brand/card-mascot-tongue-out.png'),
    aspectRatio: 1,
  },
  'mascot-annoyed': {
    source: require('../../../assets/images/brand/card-mascot-annoyed.png'),
    aspectRatio: 1,
  },
  'mascot-selfie': {
    source: require('../../../assets/images/brand/card-mascot-selfie.png'),
    aspectRatio: 369 / 384,
  },
  'mascot-diva': {
    source: require('../../../assets/images/brand/card-mascot-diva.png'),
    aspectRatio: 380 / 384,
  },
  'phone-ringing': {
    source: require('../../../assets/images/brand/card-phone-ringing.png'),
    aspectRatio: 263 / 384,
  },
  'microphone': {
    source: require('../../../assets/images/brand/card-microphone.png'),
    aspectRatio: 244 / 384,
  },
  'animal-wheel': {
    source: require('../../../assets/images/brand/card-animal-wheel.png'),
    aspectRatio: 382 / 384,
  },
  'shot-glass-on-fire': {
    source: require('../../../assets/images/brand/card-shot-glass-on-fire.png'),
    aspectRatio: 202 / 384,
  },
  'glasses-toasting': {
    source: require('../../../assets/images/brand/card-glasses-toasting.png'),
    aspectRatio: 396 / 313,
  },
  'rooster': {
    source: require('../../../assets/images/brand/card-rooster.png'),
    aspectRatio: 379 / 384,
  },
  'two-dogs': {
    source: require('../../../assets/images/brand/card-two-dogs.png'),
    aspectRatio: 410 / 384,
  },
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
