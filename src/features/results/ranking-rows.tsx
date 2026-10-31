import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { PlayerAvatar } from '@/components/ui/player-avatar';
import { BorderWidth, Colors, Radius, Spacing, TouchTarget } from '@/constants/theme';
import type { RankingEntry } from '@/features/game';

import { rankingEntryAccessibilityLabel } from './results-copy';
import { ScoreText } from './score-text';

const avatarSize = 32;

/** Everyone after the podium: position, avatar, name, and score. */
export function RankingRows({ entries }: { entries: RankingEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <View style={styles.rows}>
      {entries.map(({ player, position, score }) => (
        <View
          key={player.id}
          accessible
          accessibilityLabel={rankingEntryAccessibilityLabel(position, player.name, score)}
          style={styles.row}
        >
          <AppText variant="button" style={styles.position}>
            {position}
          </AppText>
          <PlayerAvatar avatarId={player.avatarId} size={avatarSize} />
          <AppText numberOfLines={1} ellipsizeMode="tail" style={styles.name}>
            {player.name}
          </AppText>
          <ScoreText score={score} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: Spacing.sm,
  },
  row: {
    minHeight: TouchTarget.minimum,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: BorderWidth.regular,
    borderColor: Colors.ink,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  position: {
    minWidth: Spacing.xl,
  },
  name: {
    flex: 1,
  },
});
