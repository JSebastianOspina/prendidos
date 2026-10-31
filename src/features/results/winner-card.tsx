import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { CardFrame } from '@/components/ui/card-frame';
import { BorderWidth, Colors, Radius, Spacing } from '@/constants/theme';

import { joinPlayerNames, resultsCopy, winnerAccessibilityLabel } from './results-copy';
import type { RankingGroup } from './ranking-groups';
import { ScoreText } from './score-text';

const medalSize = 64;

/**
 * The winner moment: flame-yellow card with a `points` medal as the crown accent
 * (HU-15 replaces it with the crowned mascot). A tie for first shares the card.
 */
export function WinnerCard({ group }: { group: RankingGroup }) {
  const names = group.players.map((player) => player.name);
  const isTie = names.length > 1;

  return (
    <View accessible accessibilityLabel={winnerAccessibilityLabel(names, group.score)}>
      <CardFrame tone="group">
        <View style={styles.header}>
          <View style={styles.medal}>
            <AppText variant="title">{group.position}</AppText>
          </View>
          <AppText variant="label" style={styles.badge}>
            {isTie ? resultsCopy.tieBadge : resultsCopy.winnerBadge}
          </AppText>
        </View>
        <AppText variant="title">{joinPlayerNames(names)}</AppText>
        <View style={styles.scoreChip}>
          <ScoreText score={group.score} />
        </View>
      </CardFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  medal: {
    width: medalSize,
    height: medalSize,
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.points,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexShrink: 1,
  },
  // `points` on flame yellow fails contrast, so the score sits on a white chip (design tokens).
  scoreChip: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
});
