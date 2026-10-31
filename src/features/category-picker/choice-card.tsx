import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import {
  BorderWidth,
  Colors,
  PressedTravel,
  Radius,
  ShadowOffset,
  Spacing,
} from '@/constants/theme';

export const lockBadgeSlotTestId = 'choice-card-lock-badge-slot';

const minimumCardHeight = 120;

export type ChoiceCardProps = {
  title: string;
  /** Short line under the title, e.g. the player range. */
  subtitle?: string;
  description?: string;
  accentColor: string;
  onPress: () => void;
  /** Lock badge for paid content (HU-09); the corner stays empty when absent. */
  lockBadge?: ReactNode;
};

/** Large clay card for one choice: ink outline, hard ink shadow, and the mode accent fill. */
export function ChoiceCard({
  title,
  subtitle,
  description,
  accentColor,
  onPress,
  lockBadge,
}: ChoiceCardProps) {
  const accessibilityLabel = [title, subtitle, description]
    .filter((part): part is string => Boolean(part))
    .join('. ');

  return (
    <View style={styles.wrapper}>
      <View style={styles.shadow} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.face,
          { backgroundColor: accentColor },
          pressed && { transform: [{ translateY: PressedTravel }] },
        ]}
      >
        <View style={styles.header}>
          <AppText variant="title" style={styles.title}>
            {title}
          </AppText>
          {lockBadge ? <View testID={lockBadgeSlotTestId}>{lockBadge}</View> : null}
        </View>
        {subtitle ? <AppText variant="label">{subtitle}</AppText> : null}
        {description ? <AppText>{description}</AppText> : null}
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
    minHeight: minimumCardHeight,
    borderRadius: Radius.xl,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    padding: Spacing.xl,
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  title: {
    flexShrink: 1,
  },
});
