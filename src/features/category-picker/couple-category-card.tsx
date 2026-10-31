import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { levelLabels } from '@/components/ui/level-badge';
import { BorderWidth, Colors, LevelColors, Radius, Spacing } from '@/constants/theme';
import type { Difficulty } from '@/features/content/card-types';
import { allDifficulties } from '@/features/game';

import type { LevelCardCounts } from './category-details';
import { categoryPickerCopy } from './copy';
import { surfaceCardStyles } from './surface-card-styles';

export type CoupleCategoryCardProps = {
  name: string;
  cardCounts: LevelCardCounts;
  freeDifficulties: readonly Difficulty[];
  onPlay: () => void;
};

/** "GRATIS · 30 cartas" on free levels, "30 cartas" on the rest; no lock or price yet (HU-09). */
function levelDetails(cards: number, isFree: boolean): { shown: string; spoken: string } {
  const count = categoryPickerCopy.cardCount(cards);
  if (!isFree) return { shown: count, spoken: count };
  const free = categoryPickerCopy.free;
  return { shown: `${free.toUpperCase()} · ${count}`, spoken: `${free} · ${count}` };
}

/** White card for one Pareja category: a row per level and the "Jugar <category>" button. */
export function CoupleCategoryCard({
  name,
  cardCounts,
  freeDifficulties,
  onPlay,
}: CoupleCategoryCardProps) {
  return (
    <View style={surfaceCardStyles.wrapper}>
      <View style={surfaceCardStyles.shadow} />
      <View style={[surfaceCardStyles.face, styles.face]}>
        <AppText variant="card">{name}</AppText>
        <View style={styles.levels}>
          {allDifficulties.map((difficulty) => {
            const colors = LevelColors[difficulty];
            const details = levelDetails(
              cardCounts[difficulty],
              freeDifficulties.includes(difficulty),
            );
            return (
              <View
                key={difficulty}
                accessible
                accessibilityLabel={`${levelLabels[difficulty]}. ${details.spoken}`}
                style={[styles.levelRow, { backgroundColor: colors.fill }]}
              >
                <AppText variant="button" color={colors.text} style={styles.levelName}>
                  {levelLabels[difficulty]}
                </AppText>
                <AppText variant="label" color={colors.text} style={styles.levelDetails}>
                  {details.shown}
                </AppText>
              </View>
            );
          })}
        </View>
        <Button label={categoryPickerCopy.playCategory(name)} onPress={onPlay} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    gap: Spacing.md,
  },
  levels: {
    gap: Spacing.sm,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
  },
  levelName: {
    flexGrow: 1,
    flexShrink: 1,
  },
  levelDetails: {
    textTransform: 'none',
    letterSpacing: 0,
  },
});
