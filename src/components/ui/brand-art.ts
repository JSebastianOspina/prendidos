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
    aspectRatio: 375 / 384,
  },
  'mascot-diva': {
    source: require('../../../assets/images/brand/card-mascot-diva.png'),
    aspectRatio: 1,
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
  'mascot-heart-eyes': {
    source: require('../../../assets/images/brand/card-mascot-heart-eyes.png'),
    aspectRatio: 1,
  },
  'mascot-shh': {
    source: require('../../../assets/images/brand/card-mascot-shh.png'),
    aspectRatio: 310 / 384,
  },
  'mascot-broken-heart': {
    source: require('../../../assets/images/brand/card-mascot-broken-heart.png'),
    aspectRatio: 264 / 384,
  },
  'mascot-rose': {
    source: require('../../../assets/images/brand/card-mascot-rose.png'),
    aspectRatio: 367 / 384,
  },
  'mascot-hug': {
    source: require('../../../assets/images/brand/card-mascot-hug.png'),
    aspectRatio: 305 / 384,
  },
  'mascot-telenovela': {
    source: require('../../../assets/images/brand/card-mascot-telenovela.png'),
    aspectRatio: 350 / 384,
  },
  'mascot-fingers-crossed': {
    source: require('../../../assets/images/brand/card-mascot-fingers-crossed.png'),
    aspectRatio: 359 / 384,
  },
  'mascot-thinking': {
    source: require('../../../assets/images/brand/card-mascot-thinking.png'),
    aspectRatio: 304 / 384,
  },
  'mascot-megaphone': {
    source: require('../../../assets/images/brand/card-mascot-megaphone.png'),
    aspectRatio: 486 / 384,
  },
  'chat-bubbles': {
    source: require('../../../assets/images/brand/card-chat-bubbles.png'),
    aspectRatio: 242 / 384,
  },
  'like-heart': {
    source: require('../../../assets/images/brand/card-like-heart.png'),
    aspectRatio: 297 / 346,
  },
  'heart-arrow': {
    source: require('../../../assets/images/brand/card-heart-arrow.png'),
    aspectRatio: 416 / 351,
  },
  'theater-masks': {
    source: require('../../../assets/images/brand/card-theater-masks.png'),
    aspectRatio: 444 / 346,
  },
  'disco-ball': {
    source: require('../../../assets/images/brand/card-disco-ball.png'),
    aspectRatio: 366 / 384,
  },
  'moon-stars': {
    source: require('../../../assets/images/brand/card-moon-stars.png'),
    aspectRatio: 341 / 356,
  },
  'gift-box': {
    source: require('../../../assets/images/brand/card-gift-box.png'),
    aspectRatio: 338 / 366,
  },
  'ring-box': {
    source: require('../../../assets/images/brand/card-ring-box.png'),
    aspectRatio: 292 / 374,
  },
  'pizza-slice': {
    source: require('../../../assets/images/brand/card-pizza-slice.png'),
    aspectRatio: 384 / 345,
  },
  'voice-note': {
    source: require('../../../assets/images/brand/card-voice-note.png'),
    aspectRatio: 340 / 384,
  },
  'mascot-typing': {
    source: require('../../../assets/images/brand/card-mascot-typing.png'),
    aspectRatio: 347 / 384,
  },
  'emoji-faces': {
    source: require('../../../assets/images/brand/card-emoji-faces.png'),
    aspectRatio: 400 / 367,
  },
  'mascot-phone-shock': {
    source: require('../../../assets/images/brand/card-mascot-phone-shock.png'),
    aspectRatio: 271 / 384,
  },
  'mascot-kissing': {
    source: require('../../../assets/images/brand/card-mascot-kissing.png'),
    aspectRatio: 1,
  },
  'mascot-blushing': {
    source: require('../../../assets/images/brand/card-mascot-blushing.png'),
    aspectRatio: 283 / 384,
  },
  'photo-camera': {
    source: require('../../../assets/images/brand/card-photo-camera.png'),
    aspectRatio: 400 / 316,
  },
  'profile-card': {
    source: require('../../../assets/images/brand/card-profile-card.png'),
    aspectRatio: 407 / 259,
  },
  'photo-gallery': {
    source: require('../../../assets/images/brand/card-photo-gallery.png'),
    aspectRatio: 236 / 384,
  },
  'mascot-posing': {
    source: require('../../../assets/images/brand/card-mascot-posing.png'),
    aspectRatio: 333 / 384,
  },
  'mascot-spa': {
    source: require('../../../assets/images/brand/card-mascot-spa.png'),
    aspectRatio: 296 / 384,
  },
  'staring-eyes': {
    source: require('../../../assets/images/brand/card-staring-eyes.png'),
    aspectRatio: 334 / 246,
  },
  'stopwatch': {
    source: require('../../../assets/images/brand/card-stopwatch.png'),
    aspectRatio: 290 / 384,
  },
  'rock-paper-scissors': {
    source: require('../../../assets/images/brand/card-rock-paper-scissors.png'),
    aspectRatio: 414 / 306,
  },
  'dance-shoes': {
    source: require('../../../assets/images/brand/card-dance-shoes.png'),
    aspectRatio: 365 / 343,
  },
  'headphones-music': {
    source: require('../../../assets/images/brand/card-headphones-music.png'),
    aspectRatio: 347 / 328,
  },
  'mascot-gossip': {
    source: require('../../../assets/images/brand/card-mascot-gossip.png'),
    aspectRatio: 301 / 384,
  },
  'confetti': {
    source: require('../../../assets/images/brand/card-confetti.png'),
    aspectRatio: 356 / 379,
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
