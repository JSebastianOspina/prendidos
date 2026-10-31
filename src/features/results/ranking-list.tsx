import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { BorderWidth, Colors, Radius, Spacing, TouchTarget } from '@/constants/theme';

import { joinPlayerNames, rankingRowAccessibilityLabel, resultsCopy } from './results-copy';
import type { RankingGroup } from './ranking-groups';
import { ScoreText } from './score-text';

/** Full final ranking; tied players share one row and one position ("1. Ana y Luis"). */
export function RankingList({ groups }: { groups: RankingGroup[] }) {
  return (
    <View style={styles.list}>
      <AppText variant="label" color={Colors.textSecondary}>
        {resultsCopy.rankingHeading}
      </AppText>
      {groups.map((group) => {
        const names = group.players.map((player) => player.name);
        return (
          <View
            key={group.position}
            accessible
            accessibilityLabel={rankingRowAccessibilityLabel(group.position, names, group.score)}
            style={styles.row}
          >
            <AppText variant="button" style={styles.names}>
              {`${group.position}. ${joinPlayerNames(names)}`}
            </AppText>
            <ScoreText score={group.score} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: TouchTarget.minimum,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: BorderWidth.small,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  names: {
    flexShrink: 1,
  },
});
