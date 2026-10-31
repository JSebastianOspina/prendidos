import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import {
  BorderWidth,
  Colors,
  LevelColors,
  PressedTravel,
  Radius,
  Spacing,
} from '@/constants/theme';
import { allDifficulties } from '@/features/game';

import { categoryPickerCopy } from './copy';
import { PillChip } from './pill-chip';
import { surfaceCardStyles } from './surface-card-styles';

export const lockBadgeSlotTestId = 'category-card-lock-badge-slot';

const levelBarWidth = 56;
const levelBarHeight = 10;

export type CategoryCardProps = {
  name: string;
  description?: string;
  /** Standard cards in the category. */
  cardCount: number;
  /** Shows the "GRATIS" chip; set when every level is free. */
  isFree: boolean;
  onPress: () => void;
  /** Lock badge for paid content (HU-09); it takes the chip's corner when given. */
  lockBadge?: ReactNode;
};

/** White clay card for one Amigos category: name, details, the three level bars. */
export function CategoryCard({
  name,
  description,
  cardCount,
  isFree,
  onPress,
  lockBadge,
}: CategoryCardProps) {
  const countSentence = `${categoryPickerCopy.cardCount(cardCount)}.`;
  const details = description ? `${description} ${countSentence}` : countSentence;
  const accessibilityLabel = `${name}. ${details}${isFree ? ` ${categoryPickerCopy.free}.` : ''}`;

  return (
    <View style={surfaceCardStyles.wrapper}>
      <View style={surfaceCardStyles.shadow} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          surfaceCardStyles.face,
          styles.face,
          pressed && { transform: [{ translateY: PressedTravel }] },
        ]}
      >
        <View style={styles.header}>
          <AppText variant="card" style={styles.name}>
            {name}
          </AppText>
          {lockBadge ? (
            <View testID={lockBadgeSlotTestId}>{lockBadge}</View>
          ) : isFree ? (
            <PillChip label={categoryPickerCopy.free} backgroundColor={Colors.levelEasy} />
          ) : null}
        </View>
        <AppText>{details}</AppText>
        <View style={styles.levelBars}>
          {allDifficulties.map((difficulty) => (
            <View
              key={difficulty}
              testID={`level-bar-${difficulty}`}
              style={[styles.levelBar, { backgroundColor: LevelColors[difficulty].fill }]}
            />
          ))}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  name: {
    flexShrink: 1,
  },
  levelBars: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  levelBar: {
    width: levelBarWidth,
    height: levelBarHeight,
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
  },
});
