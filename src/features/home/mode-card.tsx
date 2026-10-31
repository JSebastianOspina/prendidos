import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import {
  BorderWidth,
  Colors,
  Fonts,
  PressedTravel,
  Radius,
  ShadowOffset,
  Spacing,
} from '@/constants/theme';

export type ModeCardProps = {
  title: string;
  subtitle: string;
  backgroundColor: string;
  /** Proposal height; the card grows when large text needs more room. */
  minHeight: number;
  /** Decorative art pinned to the top-right corner. */
  illustration: ReactNode;
  onPress: () => void;
};

/** Big clay card for one game mode: art up top, title and subtitle at the bottom. */
export function ModeCard({
  title,
  subtitle,
  backgroundColor,
  minHeight,
  illustration,
  onPress,
}: ModeCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.shadow} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
        onPress={onPress}
        style={({ pressed }) => [
          styles.face,
          { backgroundColor, minHeight },
          pressed && { transform: [{ translateY: PressedTravel }] },
        ]}
      >
        {illustration}
        <AppText variant="title">{title}</AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: Spacing.gutter,
    gap: Spacing.xs,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  subtitle: {
    fontFamily: Fonts.nunitoExtraBold,
  },
});
