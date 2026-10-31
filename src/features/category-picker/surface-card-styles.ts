import { StyleSheet } from 'react-native';

import { BorderWidth, Colors, Radius, ShadowOffset, Spacing } from '@/constants/theme';

/** White clay card shared by both category cards: wrapper, hard ink shadow layer, and face. */
export const surfaceCardStyles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
    paddingBottom: ShadowOffset.card,
  },
  shadow: {
    ...StyleSheet.absoluteFill,
    top: ShadowOffset.card,
    borderRadius: Radius.xl,
    backgroundColor: Colors.ink,
  },
  face: {
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    padding: Spacing.gutter,
  },
});
