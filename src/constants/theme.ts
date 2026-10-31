/**
 * Prendidos design tokens (docs/brand/design-tokens.md). Light theme only.
 * Read colors through `useTheme()`; never hardcode them in components.
 */
import type { TextStyle } from 'react-native';

import type { Difficulty } from '@/features/content/card-types';

export const Colors = {
  ink: '#2A1608',
  background: '#FFF7ED',
  surface: '#FFFFFF',
  surfaceSoft: '#FED7AA',
  textSecondary: '#7C2D12',
  textMuted: '#475569',
  primary: '#F97316',
  brandRed: '#C01E1B',
  flameYellow: '#FACC15',
  points: '#F59E0B',
  couple: '#EC4899',
  negative: '#B91C1C',
  scrim: 'rgba(42, 22, 8, 0.6)',
  white: '#FFFFFF',
  levelEasy: '#6EE7B7',
  levelMedium: '#F97316',
  levelHard: '#C01E1B',
} as const;

export type ThemeColor = keyof typeof Colors;

/** Fill and text color per level; Prendido takes white text. */
export const LevelColors: Record<Difficulty, { fill: string; text: string }> = {
  easy: { fill: Colors.levelEasy, text: Colors.ink },
  medium: { fill: Colors.levelMedium, text: Colors.ink },
  hard: { fill: Colors.levelHard, text: Colors.white },
};

/** Font family names registered by `useFonts` in the root layout. */
export const Fonts = {
  fredokaSemiBold: 'Fredoka_600SemiBold',
  fredokaBold: 'Fredoka_700Bold',
  nunitoBold: 'Nunito_700Bold',
  nunitoExtraBold: 'Nunito_800ExtraBold',
} as const;

export type TypographyVariant = 'display' | 'title' | 'card' | 'button' | 'body' | 'label';

export const Typography: Record<TypographyVariant, TextStyle> = {
  display: { fontFamily: Fonts.fredokaBold, fontSize: 52, lineHeight: 52 },
  title: { fontFamily: Fonts.fredokaBold, fontSize: 36, lineHeight: 40 },
  card: { fontFamily: Fonts.fredokaSemiBold, fontSize: 29, lineHeight: 35 },
  button: { fontFamily: Fonts.fredokaSemiBold, fontSize: 21, lineHeight: 26 },
  body: { fontFamily: Fonts.nunitoBold, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: Fonts.nunitoExtraBold, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase' },
};

/** 4 / 8 rhythm; `gutter` is the screen side padding. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  gutter: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  card: 34,
  pill: 999,
} as const;

export const BorderWidth = {
  regular: 3,
  small: 2,
} as const;

/** Hard `ink` shadows drawn as an offset layer (Android elevation cannot draw them). */
export const ShadowOffset = {
  button: 5,
  card: 6,
  gameCard: 8,
  pressed: 1,
} as const;

/** The piece moves down this much while pressed. */
export const PressedTravel = 4;

export const TouchTarget = {
  minimum: 48,
  turnAction: 72,
} as const;

export const MaxContentWidth = 560;
